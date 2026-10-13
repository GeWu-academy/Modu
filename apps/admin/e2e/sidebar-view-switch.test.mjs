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

async function getMetrics(page) {
  return await page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="侧边主导航栏"]');
    if (!aside) return null;
    const navContainer = aside.children[0];
    const indicator = aside.querySelector('div[aria-hidden="true"]');
    const buttons = Array.from(aside.querySelectorAll('button')).filter(
      (b) => b.getAttribute('aria-label') !== '收起侧边栏' && b.getAttribute('aria-label') !== '展开侧边栏'
    );
    const activeBtn = buttons.find((b) => b.classList.contains('font-semibold'));
    if (!activeBtn || !indicator) return null;

    const btnRect = activeBtn.getBoundingClientRect();
    const indRect = indicator.getBoundingClientRect();
    const containerRect = navContainer.getBoundingClientRect();

    return {
      activeText: activeBtn.textContent.trim(),
      btnTop: btnRect.top,
      btnHeight: btnRect.height,
      indTop: indRect.top,
      indHeight: indRect.height,
      indTransform: indicator.style.transform,
      indOpacity: indicator.style.opacity,
      containerTop: containerRect.top,
      diffTop: Math.abs(btnRect.top - indRect.top),
      diffHeight: Math.abs(btnRect.height - indRect.height),
    };
  });
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
  const page = await context.newPage();

  try {
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('aside[aria-label="侧边主导航栏"]');
    await page.waitForTimeout(400);

    console.log('\n--- 1. 业务视图初始状态（工作台高亮）---');
    const m1 = await getMetrics(page);
    console.log('初始指标:', m1);
    assert.ok(m1, '必须获取到侧边栏激活指标');
    assert.equal(m1.activeText.includes('工作台'), true, '默认激活项应为工作台');
    assert.ok(m1.diffTop <= 1, `初始指示器与激活按钮 top 差值必须 <= 1px，实际 ${m1.diffTop}`);

    console.log('\n--- 2. 切换至「平台管理」---');
    const platformBtn = page.getByRole('button', { name: '平台管理' });
    await platformBtn.click();
    await page.waitForTimeout(600); // 等待动画或渲染

    const m2 = await getMetrics(page);
    console.log('切换至平台管理后指标:', m2);
    assert.ok(m2, '必须获取到侧边栏激活指标');
    console.log(`目标激活项: ${m2.activeText}, btnTop: ${m2.btnTop}, indTop: ${m2.indTop}, 差异: ${m2.diffTop}px`);
    assert.ok(m2.diffTop <= 1, `切换至平台管理后指示器与激活按钮 top 差值必须 <= 1px，实际 ${m2.diffTop}`);

    console.log('\n--- 3. 切回「业务视图」---');
    const businessBtn = page.getByRole('button', { name: '业务视图' });
    await businessBtn.click();
    await page.waitForTimeout(600);

    const m3 = await getMetrics(page);
    console.log('切回业务视图后指标:', m3);
    assert.ok(m3, '必须获取到侧边栏激活指标');
    assert.equal(m3.activeText.includes('工作台'), true, '应保持激活工作台');
    assert.ok(m3.diffTop <= 1, `切回业务视图后指示器与激活按钮 top 差值必须 <= 1px，实际 ${m3.diffTop}`);

    console.log('\n--- 4. 在平台管理视图中切换至「用户管理」后，再切回业务视图 ---');
    await platformBtn.click();
    await page.waitForTimeout(400);

    const usersBtn = page.locator('aside').getByRole('button', { name: /用户管理/ });
    await usersBtn.click();
    await page.waitForTimeout(400);

    const m4 = await getMetrics(page);
    console.log('平台视图激活用户管理:', m4);
    assert.ok(m4.diffTop <= 1, `平台视图激活用户管理指示器必须对齐，实际 ${m4.diffTop}`);

    // 切回业务视图
    await businessBtn.click();
    await page.waitForTimeout(600);

    const m5 = await getMetrics(page);
    console.log('切回业务视图后用户管理指标:', m5);
    assert.ok(m5.diffTop <= 1, `切回业务视图后用户管理指示器必须对齐，实际 ${m5.diffTop}`);

    console.log('\n--- 5. 侧边栏收起状态下在业务视图与平台管理间切换 ---');
    const toggleCollapseBtn = page.getByRole('button', { name: '收起侧边栏' });
    await toggleCollapseBtn.click();
    await page.waitForTimeout(400);

    // 切换至平台管理
    await platformBtn.click();
    await page.waitForTimeout(600);

    const m6 = await getMetrics(page);
    console.log('收起态切换至平台管理指标:', m6);
    assert.ok(m6.diffTop <= 1, `收起态切换至平台管理后必须精确对齐，实际 ${m6.diffTop}`);

    // 切换至业务视图
    await businessBtn.click();
    await page.waitForTimeout(600);

    const m7 = await getMetrics(page);
    console.log('收起态切回业务视图指标:', m7);
    assert.ok(m7.diffTop <= 1, `收起态切回业务视图后必须精确对齐，实际 ${m7.diffTop}`);

    // 切回展开态
    await page.getByRole('button', { name: '展开侧边栏' }).click();
    await page.waitForTimeout(400);

    console.log('\n--- 6. 验证在「我的插件」点击平台管理，自动切到「平台插件管理」并对齐 ---');
    // 在业务视图点击「我的插件」
    const myPluginsBtn = page.locator('aside').getByRole('button', { name: /我的插件/ });
    await myPluginsBtn.click();
    await page.waitForTimeout(400);

    const m6_pre = await getMetrics(page);
    console.log('业务视图激活我的插件指标:', m6_pre);
    assert.equal(m6_pre.activeText.includes('我的插件'), true);
    assert.ok(m6_pre.diffTop <= 1, `业务视图激活我的插件对齐误差必须 <= 1px，实际 ${m6_pre.diffTop}`);

    // 点击平台管理
    await platformBtn.click();
    await page.waitForTimeout(600);

    const m6_post = await getMetrics(page);
    console.log('自动切到平台插件管理指标:', m6_post);
    assert.equal(m6_post.activeText.includes('平台插件管理'), true, '应自动切换至平台插件管理');
    assert.ok(m6_post.diffTop <= 1, `切换后平台插件管理对齐误差必须 <= 1px，实际 ${m6_post.diffTop}`);

    console.log('\n--- 7. 验证在「平台插件管理」点击业务视图，自动切到「工作台」并对齐 ---');
    await businessBtn.click();
    await page.waitForTimeout(600);

    const m7_post = await getMetrics(page);
    console.log('从平台插件管理切回业务视图指标:', m7_post);
    assert.equal(m7_post.activeText.includes('工作台'), true, '应自动重定向至工作台');
    assert.ok(m7_post.diffTop <= 1, `重定向至工作台后指示器必须对齐，实际 ${m7_post.diffTop}`);

    console.log('\n--- 8. 验证底部「系统与企业设置」在业务视图与平台管理切换时的对齐 ---');
    const settingsBtn = page.locator('aside').getByRole('button', { name: /系统与企业设置/ });
    await settingsBtn.click();
    await page.waitForTimeout(400);

    const m8_biz = await getMetrics(page);
    console.log('业务视图设置项指标:', m8_biz);
    assert.equal(m8_biz.activeText.includes('系统与企业设置'), true);
    assert.ok(m8_biz.diffTop <= 1, `业务视图设置项对齐误差必须 <= 1px，实际 ${m8_biz.diffTop}`);

    // 切换至平台管理
    await platformBtn.click();
    await page.waitForTimeout(600);

    const m8_plat = await getMetrics(page);
    console.log('平台管理视图设置项指标:', m8_plat);
    assert.equal(m8_plat.activeText.includes('系统与企业设置'), true);
    assert.ok(m8_plat.diffTop <= 1, `平台管理视图设置项对齐误差必须 <= 1px，实际 ${m8_plat.diffTop}`);

    // 切回业务视图
    await businessBtn.click();
    await page.waitForTimeout(600);

    const m8_biz_return = await getMetrics(page);
    console.log('切回业务视图设置项指标:', m8_biz_return);
    assert.equal(m8_biz_return.activeText.includes('系统与企业设置'), true);
    assert.ok(m8_biz_return.diffTop <= 1, `切回业务视图设置项对齐误差必须 <= 1px，实际 ${m8_biz_return.diffTop}`);

    console.log('\n✅ 所有视图切换侧边栏指示器对齐测试全部通过！');
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('\n❌ 测试失败:', err);
  process.exit(1);
});
