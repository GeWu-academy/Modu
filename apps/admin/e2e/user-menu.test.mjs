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

  try {
    console.log('\n--- 1. 访问工作台页面 ---');
    await page.goto(`http://localhost:${port}/workspace`);
    await page.waitForLoadState('networkidle');

    // 寻找 Header 区域的用户头像触发展开按钮
    const userTriggerBtn = page.locator('header button:has-text("李明")');
    await userTriggerBtn.waitFor({ state: 'visible', timeout: 5000 });

    // 确认初始状态下拉菜单不存在
    let menuDropdown = page.locator('header div.absolute:has-text("个人与企业设置")');
    assert.strictEqual(await menuDropdown.count(), 0, '初始状态下用户下拉菜单不应展开');

    console.log('--- 2. 点击用户头像展开菜单 ---');
    await userTriggerBtn.click();
    await menuDropdown.waitFor({ state: 'visible', timeout: 3000 });

    // 验证头部身份卡片
    console.log('--- 3. 验证个人身份卡片 ---');
    const userNameEl = menuDropdown.locator('span:text-is("李明")');
    const userEmailEl = menuDropdown.locator('div:text-is("liming@yourcompany.com")');
    assert.ok(await userNameEl.isVisible(), '用户姓名应正确显示');
    assert.ok(await userEmailEl.isVisible(), '用户邮箱应正确显示');

    // 验证各个菜单项
    console.log('--- 4. 验证操作菜单项尺寸与排版一致性 ---');
    const menuButtons = [
      { name: '个人与企业设置', locator: menuDropdown.locator('button:has-text("个人与企业设置")') },
      { name: '我的操作审计', locator: menuDropdown.locator('button:has-text("我的操作审计")') },
      { name: '退出登录', locator: menuDropdown.locator('button:has-text("退出登录")') },
    ];

    for (const item of menuButtons) {
      assert.ok(await item.locator.isVisible(), `${item.name} 按钮应当可见`);
      const rect = await item.locator.boundingBox();
      assert.ok(rect, `${item.name} 应当有准确的布局几何盒模型`);

      console.log(`[尺寸检验] ${item.name}: 宽 ${rect.width.toFixed(1)}px, 高 ${rect.height.toFixed(1)}px`);
      // 检验高度严格为 36px (h-9)，允许 sub-pixel 0.5px 误差
      assert.ok(
        Math.abs(rect.height - 36) <= 0.5,
        `${item.name} 高度应当为 36px，实际为 ${rect.height}px`
      );

      // 检验图标与文本水平对齐（单行 flex 布局）
      const svgLocator = item.locator.locator('svg').first();
      const textLocator = item.locator.locator('span.flex-1');
      assert.ok(await svgLocator.isVisible(), `${item.name} 内部 SVG 图标应当可见`);
      assert.ok(await textLocator.isVisible(), `${item.name} 内部文本应当可见`);

      const svgRect = await svgLocator.boundingBox();
      const textRect = await textLocator.boundingBox();

      // 图标应当在文本左侧
      assert.ok(
        svgRect.x < textRect.x,
        `${item.name} 图标应位于文本左侧（水平流式布局），不应垂直换行堆叠`
      );

      // 图标中心 Y 与 文本中心 Y 偏差不超过 1.5px
      const svgCenterY = svgRect.y + svgRect.height / 2;
      const textCenterY = textRect.y + textRect.height / 2;
      const diffY = Math.abs(svgCenterY - textCenterY);
      console.log(`[垂直居中检验] ${item.name}: 图标中心Y=${svgCenterY.toFixed(1)}, 文本中心Y=${textCenterY.toFixed(1)}, 偏差=${diffY.toFixed(2)}px`);
      assert.ok(
        diffY <= 1.5,
        `${item.name} 图标与文本中心未垂直居中对齐，偏差达到 ${diffY}px`
      );
    }

    // 检验退出登录的视觉警示风格
    console.log('--- 5. 验证退出登录项的视觉危险警示设计 ---');
    const logoutBtn = menuDropdown.locator('button:has-text("退出登录")');
    const logoutColor = await logoutBtn.evaluate((el) => window.getComputedStyle(el).color);
    console.log(`[颜色检验] 退出登录文本颜色: ${logoutColor}`);
    // Tailwind v4 uses OKLCH (e.g. oklch(0.586 0.253 17.585) for rose-600) or rgb(225, 29, 72)
    const isRoseColor =
      logoutColor.includes('oklch') ||
      logoutColor.includes('225, 29, 72') ||
      logoutColor.includes('239, 68, 68') ||
      logoutColor.includes('rose');
    assert.ok(
      isRoseColor,
      `退出登录应具备危险红色系文字警示，实际为 ${logoutColor}`
    );

    // 截图保存
    const scratchDir = '/Users/allure/.gemini/antigravity/brain/d4d0dcb8-a1a0-44ed-8656-b52229585db1/scratch';
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    const screenshotPath = path.join(scratchDir, 'user_menu_redesign.png');
    await menuDropdown.screenshot({ path: screenshotPath });
    console.log(`[截图已保存] ${screenshotPath}`);

    // 交互验证：按 Escape 键收起
    console.log('--- 6. 验证 Escape 快捷键收起菜单 ---');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    assert.strictEqual(await menuDropdown.count(), 0, '按下 Escape 键后菜单应当收起');

    // 再次点击打开，验证点击外部收起
    console.log('--- 7. 验证 Click-Outside 点击外部区域收起菜单 ---');
    await userTriggerBtn.click();
    await menuDropdown.waitFor({ state: 'visible', timeout: 3000 });
    // 点击远离菜单的左上角空白区域
    await page.mouse.click(50, 50);
    await page.waitForTimeout(200);
    assert.strictEqual(await menuDropdown.count(), 0, '点击外部区域后菜单应当收起');

    console.log('\n[PASS] 用户头像下拉菜单（个人信息与退出登录）重构与尺寸一致性测试全部通过！');
  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch((err) => {
  console.error('[E2E FAILED]:', err);
  process.exit(1);
});
