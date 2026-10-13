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
  // fallback to default
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
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  try {
    await page.goto(`http://localhost:${port}/workspace`);
    await page.waitForSelector('aside');
    await page.waitForTimeout(500);

    const getAlignment = async () => {
      return await page.evaluate(() => {
        const aside = document.querySelector('aside');
        const navContainer = aside.querySelector('div[style*="position: relative"]');
        const indicator = navContainer.querySelector('div[aria-hidden="true"]');
        // Find the currently active button (styled with font-semibold or brand color)
        const buttons = Array.from(aside.querySelectorAll('button'));
        const activeBtn = buttons.find((b) => b.getAttribute('style')?.includes('font-weight: 600') || b.classList.contains('font-semibold'));
        if (!activeBtn || !indicator) {
          return null;
        }

        const btnRect = activeBtn.getBoundingClientRect();
        const indRect = indicator.getBoundingClientRect();
        const asideRect = aside.getBoundingClientRect();
        const navContainerRect = navContainer.getBoundingClientRect();

        return {
          asideWidth: Math.round(asideRect.width),
          asideTop: asideRect.top,
          asideScrollTop: aside.scrollTop,
          asideScrollHeight: aside.scrollHeight,
          asideClientHeight: aside.clientHeight,
          navScrollHeight: navContainer.scrollHeight,
          navClientHeight: navContainer.clientHeight,
          navScrollTop: navContainer.scrollTop,
          navContainerTop: navContainerRect.top,
          activeText: activeBtn.textContent.trim(),
          btnTop: btnRect.top,
          btnOffsetTop: activeBtn.offsetTop,
          btnHeight: btnRect.height,
          indTop: indRect.top,
          indTransform: indicator.style.transform,
          indHeight: indRect.height,
          diffTop: Math.abs(indRect.top - btnRect.top),
          diffHeight: Math.abs(indRect.height - btnRect.height),
        };
      });
    };

    console.log('\n--- 1. 验证初始状态 (展开态) 对齐与无滚动 ---');
    const initial = await getAlignment();
    console.log('初始状态指标:', initial);
    assert(initial !== null, '找不到激活按钮或指示器');
    assert(initial.asideWidth > 200, `预期侧边栏展开宽度 > 200, 实际: ${initial.asideWidth}`);
    assert(initial.diffTop <= 1.5, `初始状态下指示器与按钮顶边偏差过大: ${initial.diffTop}px`);
    assert(
      initial.navScrollHeight <= initial.navClientHeight,
      `初始状态下导航栏内容不应溢出滚动！navScrollHeight: ${initial.navScrollHeight}, navClientHeight: ${initial.navClientHeight}`
    );
    assert(
      initial.asideScrollHeight <= initial.asideClientHeight,
      `初始状态下侧边栏不应溢出滚动！asideScrollHeight: ${initial.asideScrollHeight}, asideClientHeight: ${initial.asideClientHeight}`
    );

    console.log('\n--- 2. 验证切换至其他菜单项时的平滑对齐 ---');
    const usersBtn = page.locator('aside button').filter({ hasText: '用户管理' });
    await usersBtn.click();
    await page.waitForTimeout(400);
    const switched = await getAlignment();
    console.log('切换后指标:', switched);
    assert(switched.activeText.includes('用户管理'), `预期激活用户管理, 实际: ${switched.activeText}`);
    assert(switched.diffTop <= 1.5, `切换菜单后指示器与按钮顶边偏差过大: ${switched.diffTop}px`);

    console.log('\n--- 3. 验证关闭/收起侧边栏后的精准对齐 (关键复现点) ---');
    const collapseBtn = page.locator('aside button[title*="侧边栏"]');
    await collapseBtn.click();
    await page.waitForTimeout(500); // 等待折叠过渡动画完全落定
    const collapsed = await getAlignment();
    console.log('收起侧边栏后指标:', collapsed);
    assert(collapsed.asideWidth <= 80, `预期侧边栏收起宽度 <= 80, 实际: ${collapsed.asideWidth}`);
    assert(
      collapsed.diffTop <= 1.5,
      `收起侧边栏后指示器位置发生偏移！偏差: ${collapsed.diffTop}px (预期 <= 1.5px)`
    );

    console.log('\n--- 4. 验证在收起状态下切换菜单的对齐 ---');
    // 在折叠态下点击工作台图标按钮（第 1 个导航按钮）
    const navButtons = page.locator('aside div[style*="position: relative"] button');
    await navButtons.nth(0).click();
    await page.waitForTimeout(400);
    const collapsedSwitched = await getAlignment();
    console.log('收起态切换菜单指标:', collapsedSwitched);
    assert(
      collapsedSwitched.diffTop <= 1.5,
      `收起态切换菜单后指示器偏移: ${collapsedSwitched.diffTop}px`
    );

    console.log('\n--- 5. 验证重新展开侧边栏后的精准对齐 ---');
    await collapseBtn.click();
    await page.waitForTimeout(500); // 等待展开过渡动画完全落定
    const reExpanded = await getAlignment();
    console.log('重新展开后指标:', reExpanded);
    assert(reExpanded.asideWidth > 200, `预期侧边栏展开宽度 > 200, 实际: ${reExpanded.asideWidth}`);
    assert(
      reExpanded.diffTop <= 1.5,
      `展开侧边栏后指示器位置发生偏移！偏差: ${reExpanded.diffTop}px (预期 <= 1.5px)`
    );

    console.log('\n--- 6. 验证偏好与安全组（系统与企业设置）收起与展开对齐 ---');
    const settingsBtn = page.locator('aside button').filter({ hasText: '系统与企业设置' });
    await settingsBtn.click();
    await page.waitForTimeout(400);
    const settingsExpanded = await getAlignment();
    console.log('系统设置展开态指标:', settingsExpanded);
    assert(settingsExpanded.activeText.includes('系统与企业设置'), '未能激活系统与企业设置');
    assert(settingsExpanded.diffTop <= 1.5, `系统设置展开态指示器偏移: ${settingsExpanded.diffTop}px`);

    await collapseBtn.click();
    await page.waitForTimeout(500);
    const settingsCollapsed = await getAlignment();
    console.log('系统设置收起态指标:', settingsCollapsed);
    assert(settingsCollapsed.diffTop <= 1.5, `系统设置收起态指示器偏移: ${settingsCollapsed.diffTop}px`);

    await collapseBtn.click();
    await page.waitForTimeout(500);
    const settingsReExpanded = await getAlignment();
    console.log('系统设置重新展开态指标:', settingsReExpanded);
    assert(settingsReExpanded.diffTop <= 1.5, `系统设置重新展开态指示器偏移: ${settingsReExpanded.diffTop}px`);

    console.log('\n--- 7. 验证中间菜单项（我的插件）收起与展开对齐 ---');
    const pluginsBtn = page.locator('aside button').filter({ hasText: '我的插件' });
    await pluginsBtn.click();
    await page.waitForTimeout(400);
    const pluginsExpanded = await getAlignment();
    console.log('我的插件展开态指标:', pluginsExpanded);
    assert(pluginsExpanded.activeText.includes('我的插件'), '未能激活我的插件');
    assert(pluginsExpanded.diffTop <= 1.5, `我的插件展开态指示器偏移: ${pluginsExpanded.diffTop}px`);

    await collapseBtn.click();
    await page.waitForTimeout(500);
    const pluginsCollapsed = await getAlignment();
    console.log('我的插件收起态指标:', pluginsCollapsed);
    assert(pluginsCollapsed.diffTop <= 1.5, `我的插件收起态指示器偏移: ${pluginsCollapsed.diffTop}px`);

    await collapseBtn.click();
    await page.waitForTimeout(500);
    console.log('\n--- 8. 验证视口高度不足（实在装不下）时的滚动溢出与对齐 ---');
    // 将视口高度缩小至 420px，模拟内容实在装不下的极限场景
    await page.setViewportSize({ width: 1280, height: 420 });
    await page.waitForTimeout(300);
    const smallViewport = await getAlignment();
    console.log('小视口（装不下）指标:', smallViewport);
    assert(
      smallViewport.navScrollHeight > smallViewport.navClientHeight,
      `视口缩小至 420px 后导航区域应正确触发溢出滚动！navScrollHeight: ${smallViewport.navScrollHeight}, navClientHeight: ${smallViewport.navClientHeight}`
    );
    assert(
      smallViewport.diffTop <= 1.5,
      `小视口溢出滚动状态下指示器与按钮偏差过大: ${smallViewport.diffTop}px`
    );

    // 恢复标准视口 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    const restored = await getAlignment();
    assert(
      restored.navScrollHeight <= restored.navClientHeight,
      '恢复标准视口后导航栏应恢复无滚动状态'
    );

    console.log('\n所有 Playwright 侧边栏对齐测试全部通过！');
  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\nPlaywright 测试失败:', err.message);
  process.exit(1);
});
