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
      } catch {}
    }
  }
  return await chromium.launch({ headless: true });
}

async function runTests() {
  if (!fs.existsSync(distDir)) {
    console.error('apps/admin/dist does not exist. Please run vite build first.');
    process.exit(1);
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Playwright E2E] Static test server running on http://localhost:${port}`);

  const browser = await launchChromium();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const routesToTest = [
    { route: '/system/users', placeholder: '搜索用户名', desc: '用户管理搜索框' },
    { route: '/system/invites', placeholder: '搜索邀请备注', desc: '邀请管理搜索框' },
    { route: '/my/plugins', placeholder: '搜索插件名称', desc: '我的插件搜索框' },
    { route: '/platform/plugins', placeholder: '搜索插件标识', desc: '平台插件搜索框' },
    { route: '/skills', placeholder: '搜索 Skill', desc: 'Skill 管理搜索框' },
    { route: '/system/audit', placeholder: '搜索操作人', desc: '系统审计搜索框' },
  ];

  for (const { route, placeholder, desc } of routesToTest) {
    console.log(`\n--- 验证: ${desc} (${route}) ---`);
    await page.goto(`http://localhost:${port}/#${route}`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator(`input[placeholder*="${placeholder}"]`);
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });

    const inputRect = await searchInput.boundingBox();
    const iconSvg = page.locator(`div:has(> input[placeholder*="${placeholder}"]) svg`);
    const iconRect = await iconSvg.boundingBox();

    assert.ok(inputRect, `${desc}: 输入框应当正常渲染`);
    assert.ok(iconRect, `${desc}: 放大镜图标应当正常渲染`);

    // 1. 验证搜索框宽度没有被挤压塌陷（至少 >= 260px，通常为 360-384px）
    console.log(`[宽度检验] inputWidth: ${inputRect.width}px`);
    assert.ok(
      inputRect.width >= 260,
      `${desc}: 宽度异常 (${inputRect.width}px)，疑似被弹性布局挤压`
    );

    // 2. 验证放大镜垂直绝对居中 (SVG 中心 Y 与 输入框中心 Y 偏差不超过 0.5px)
    const inputCenterY = inputRect.y + inputRect.height / 2;
    const iconCenterY = iconRect.y + iconRect.height / 2;
    const diffY = Math.abs(inputCenterY - iconCenterY);
    console.log(`[垂直居中检验] inputCenterY: ${inputCenterY}, iconCenterY: ${iconCenterY}, diff: ${diffY}px`);
    assert.ok(
      diffY <= 0.5,
      `${desc}: 放大镜未垂直居中，偏差达到 ${diffY}px`
    );

    // 3. 验证文本左缩进充足 (paddingLeft >= 32px)，确保图标与文本不重叠
    const paddingLeft = await searchInput.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingLeft);
    });
    console.log(`[内边距检验] paddingLeft: ${paddingLeft}px`);
    assert.ok(
      paddingLeft >= 32,
      `${desc}: 左侧文本内边距不足 (${paddingLeft}px)，会导致文字与放大镜重叠`
    );

    // 4. 验证点击放大镜区域可以穿透聚焦到输入框
    await page.mouse.click(iconRect.x + iconRect.width / 2, iconRect.y + iconRect.height / 2);
    const isFocused = await searchInput.evaluate((el) => document.activeElement === el);
    console.log(`[点击聚焦检验] isFocused: ${isFocused}`);
    assert.ok(isFocused, `${desc}: 点击放大镜图标应当自动聚焦到输入框`);
  }

  console.log('\n所有搜索框放大镜居中、布局展开与交互对齐 E2E 测试全部通过！');
  await browser.close();
  server.close();
}

runTests().catch((err) => {
  console.error('[E2E FAILED]:', err);
  process.exit(1);
});
