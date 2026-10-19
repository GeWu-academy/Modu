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

// 模拟的 Modu-AI 远程入口地址（不可达 / 可达两个场景）
const UNREACHABLE_REMOTE = 'http://127.0.0.1:5998/remoteEntry.js';
const REACHABLE_REMOTE = 'http://127.0.0.1:5999/remoteEntry.js';

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

  // 模拟后端：GET 返回已保存地址，PUT 记录并回写
  let savedUrl = '';
  const putBodies = [];
  await context.route('**/api/v1/ai/module-settings', async (route) => {
    const request = route.request();
    if (request.method() === 'PUT') {
      const body = JSON.parse(request.postData() ?? '{}');
      putBodies.push(body);
      savedUrl = body.remoteUrl ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ remoteUrl: savedUrl }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ remoteUrl: savedUrl }),
    });
  });

  // 模拟远程入口：5998 不可达；5999 可达并计数加载请求
  await context.route('http://127.0.0.1:5998/**', (route) => route.abort('connectionrefused'));
  let remoteEntryHits = 0;
  await context.route('http://127.0.0.1:5999/remoteEntry.js', (route) => {
    remoteEntryHits += 1;
    return route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/javascript',
        'access-control-allow-origin': '*',
      },
      body: 'export const name = "modu-ai-e2e-stub";',
    });
  });

  const page = await context.newPage();

  try {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'load' });
    await page.waitForSelector('aside[aria-label="侧边主导航栏"]');
    await page.waitForTimeout(400);

    console.log('\n--- 1. 进入 /ai，等待设置面板 ---');
    const aiBtn = page.locator('aside').getByRole('button', { name: /AI 模块/ });
    await aiBtn.click();
    const urlInput = page.getByPlaceholder(/remoteEntry/);
    await urlInput.waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(
      await page.getByText('尚未配置 Modu-AI 部署链接').isVisible(),
      true,
      '未配置时应显示引导文案',
    );

    console.log('\n--- 2. 填写不可达地址并点击「测试链接」---');
    await urlInput.fill(UNREACHABLE_REMOTE);
    await page.getByRole('button', { name: '测试链接' }).click();
    const failMessage = page.getByText('无法访问该地址');
    await failMessage.waitFor({ state: 'visible', timeout: 10000 });
    assert.equal(putBodies.length, 0, '测试失败时不应保存到后端');

    console.log('\n--- 3. 填写可达地址并点击「测试链接」---');
    await urlInput.fill(REACHABLE_REMOTE);
    await page.getByRole('button', { name: '测试链接' }).click();
    const okMessage = page.getByText('连接成功，已保存并加载远程模块');
    await okMessage.waitFor({ state: 'visible', timeout: 10000 });

    const putDeadline = Date.now() + 5000;
    while (putBodies.length === 0 && Date.now() < putDeadline) {
      await page.waitForTimeout(100);
    }
    assert.equal(putBodies.length, 1, '测试成功后应保存一次');
    assert.equal(putBodies[0].remoteUrl, REACHABLE_REMOTE, '保存的地址应与输入一致');

    console.log('\n--- 4. 断言已按保存地址发起远程入口加载请求 ---');
    const loadDeadline = Date.now() + 10000;
    while (remoteEntryHits === 0 && Date.now() < loadDeadline) {
      await page.waitForTimeout(200);
    }
    assert.ok(remoteEntryHits >= 1, '保存后应按部署地址发起远程入口加载请求');

    console.log('\n--- 5. 断言页面未崩溃 ---');
    assert.equal(
      await page.locator('aside[aria-label="侧边主导航栏"]').isVisible(),
      true,
      '页面不应崩溃',
    );

    console.log('\n✅ AI 模块设置「地址 + 测试链接」测试通过！');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('\n❌ 测试失败:', err);
  process.exit(1);
});
