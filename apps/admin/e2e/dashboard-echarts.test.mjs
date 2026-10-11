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
    console.error('Dist directory does not exist. Please run pnpm build first.');
    process.exit(1);
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Playwright E2E] Static test server running on ${baseUrl}`);

  const browser = await launchChromium();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('\n--- 1. 访问工作台页面 ---');
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    // 登录或等待工作台加载
    const bannerHeading = page.locator('h1', { hasText: '欢迎回来' });
    await bannerHeading.waitFor({ state: 'visible', timeout: 5000 });
    console.log('工作台欢迎横幅已就绪');

    console.log('\n--- 2. 验证“待办与处理中心”渲染与交互 ---');
    const todoTitle = page.locator('h2', { hasText: '待办与处理中心' });
    assert.ok(await todoTitle.isVisible(), '待办与处理中心标题应可见');

    // 验证待办筛选按钮
    const allTab = page.locator('button', { hasText: '全部' });
    const pendingTab = page.locator('button', { hasText: '待办' });
    const completedTab = page.locator('button', { hasText: '已办结' });
    assert.ok(await allTab.isVisible(), '全部筛选按钮应可见');
    assert.ok(await pendingTab.isVisible(), '待办筛选按钮应可见');
    assert.ok(await completedTab.isVisible(), '已办结筛选按钮应可见');

    // 验证待办列表项存在
    const firstTodoItem = page.locator('text=第三方外部 Skill「智能合同审查助手」导入合规审核');
    assert.ok(await firstTodoItem.isVisible(), '高优先级外部 Skill 审核待办应展示');

    // 验证待办交互：切换分类筛选
    await completedTab.click();
    await page.waitForTimeout(100);
    const completedItem = page.locator('text=自托管独立节点数据库 WAL 日志持久化每日巡检');
    assert.ok(await completedItem.isVisible(), '已办结分类应展示巡检项');

    // 切回全部
    await allTab.click();
    await page.waitForTimeout(100);

    console.log('待办与处理中心分类筛选交互验证通过');

    console.log('\n--- 3. 验证“平台资产全景与资源大盘”渲染 ---');
    const assetTitle = page.locator('h2', { hasText: '平台资产全景与资源大盘' });
    assert.ok(await assetTitle.isVisible(), '平台资产全景标题应可见');

    const pluginAssetCard = page.locator('text=插件生态资产');
    const skillAssetCard = page.locator('text=Skill 规则知识资产');
    const userAssetCard = page.locator('text=组织授权席位资产');
    const storageAssetCard = page.locator('text=自托管数据与存储资产');

    assert.ok(await pluginAssetCard.isVisible(), '插件生态资产卡片应可见');
    assert.ok(await skillAssetCard.isVisible(), 'Skill 规则知识资产卡片应可见');
    assert.ok(await userAssetCard.isVisible(), '组织授权席位资产卡片应可见');
    assert.ok(await storageAssetCard.isVisible(), '自托管存储资产卡片应可见');
    console.log('四大核心平台资产卡片全部就绪');

    console.log('\n--- 4. 验证 ECharts 图表 Canvas 渲染 ---');
    // ECharts 会在容器内生成 canvas 元素
    await page.waitForSelector('canvas', { timeout: 4000 });
    const canvasElements = await page.locator('canvas').all();
    console.log(`页面检测到 ${canvasElements.length} 个 Canvas 图表渲染实例`);
    assert.ok(canvasElements.length >= 3, '应至少有 3 个 ECharts 图表实例 (待办趋势图, 资产分布环形图, 资产周调度图)');

    for (let i = 0; i < canvasElements.length; i++) {
      const box = await canvasElements[i].boundingBox();
      assert.ok(box && box.width > 50 && box.height > 50, `第 ${i + 1} 个图表 Canvas 应有有效渲染尺寸`);
    }
    console.log('ECharts Canvas 图表实例均具有正常长宽并已完成渲染');

    console.log('\n--- 5. 截图保存验证 ---');
    const screenshotDir = '/Users/allure/.gemini/antigravity/brain/178cd496-5094-4cd9-8281-124be1517c5f/scratch';
    fs.mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = path.join(screenshotDir, 'dashboard-echarts-assets-todos.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[截图已保存] ${screenshotPath}`);

    // 控制台无致命错误
    const fatalErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    assert.equal(fatalErrors.length, 0, `页面控制台不应有致命错误: ${fatalErrors.join(', ')}`);

    console.log('\n[PASS] ECharts 待办处理中心与平台资产全景看板 E2E 测试全部通过！\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runTests().catch((err) => {
  console.error('测试失败:', err);
  process.exit(1);
});
