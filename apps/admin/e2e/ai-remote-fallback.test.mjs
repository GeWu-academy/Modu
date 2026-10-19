import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminDir = path.resolve(__dirname, '..');
const distDir = path.join(adminDir, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error reading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

const CHROMIUM_PATHS = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  '/Users/allure/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  '/Users/allure/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
].filter(Boolean);

async function launchChromium() {
  for (const exePath of CHROMIUM_PATHS) {
    if (fs.existsSync(exePath)) {
      try {
        return await chromium.launch({ executablePath: exePath, headless: true });
      } catch {
        // try next
      }
    }
  }
  return await chromium.launch({ headless: true });
}

async function run() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Playwright E2E] Static test server running on http://localhost:${port}`);

  const browser = await launchChromium();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  // 模拟远程模块不可用：拦截所有指向 Modu-AI 远程入口的请求并使其失败
  await context.route(/localhost:5001/, (route) => route.abort());

  const page = await context.newPage();

  try {
    // AI 模块设置现由后端提供；模拟后端返回一个远程地址，才能进入“远程加载失败”分支
    await context.route('**/api/v1/ai/module-settings', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ remoteUrl: 'http://localhost:5001/remoteEntry.js' }),
      }),
    );

    await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
    await page.waitForSelector('aside[aria-label="侧边主导航栏"]');
    await page.waitForTimeout(400);

    console.log('\n--- 1. 进入 /ai，远程模块不可用 ---');
    const aiBtn = page.locator('aside').getByRole('button', { name: /AI 模块/ });
    await aiBtn.click();

    console.log('\n--- 2. 断言出现「AI 模块还没引入」占位 ---');
    const placeholder = page.getByText('AI 模块还没引入');
    await placeholder.waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await placeholder.isVisible(), true, '远程不可用时应显示「AI 模块还没引入」占位');

    console.log('\n--- 3. 断言页面未崩溃（侧边栏与占位同时存在）---');
    assert.equal(await page.locator('aside[aria-label="侧边主导航栏"]').isVisible(), true, '页面不应崩溃');

    console.log('\n--- 4. 点击「重试加载」，远程仍不可用时应优雅回落占位（不崩溃）---');
    const retryBtn = page.getByRole('button', { name: '重试加载' });
    await retryBtn.waitFor({ state: 'visible', timeout: 5000 });
    await retryBtn.click();
    await page.waitForTimeout(1000);
    assert.equal(await placeholder.isVisible(), true, '重试后远程仍不可用应回落占位');
    assert.equal(await page.getByRole('button', { name: '重试加载' }).isVisible(), true, '重试按钮应再次可点击');
    assert.equal(await page.locator('aside[aria-label="侧边主导航栏"]').isVisible(), true, '重试后页面不应崩溃');

    console.log('\n✅ AI 远程模块加载失败降级占位 + 重试测试通过！');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('\n❌ 测试失败:', err);
  process.exit(1);
});
