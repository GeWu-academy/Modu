import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminDir = path.resolve(__dirname, '..');
const distDir = path.join(adminDir, 'dist');

const label = process.argv[2] || 'before';
const outputDir = path.resolve(
  __dirname,
  '../../../changes/2026-10-11-30-admin-color-palette-optimization/screenshots',
  label
);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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

async function captureScreenshots() {
  if (!fs.existsSync(distDir)) {
    console.error('apps/admin/dist does not exist. Please run build first.');
    process.exit(1);
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Screenshot Script] Static server running on http://localhost:${port}`);

  const browser = await launchChromium();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const routes = [
    { name: '01-workspace', path: '/#/workspace' },
    { name: '02-users', path: '/#/system/users' },
    { name: '03-settings', path: '/#/settings' },
    { name: '04-plugins', path: '/#/platform/plugins' },
    { name: '05-audit', path: '/#/system/audit' },
  ];

  try {
    for (const r of routes) {
      console.log(`Capturing ${r.name} (${r.path})...`);
      await page.goto(`http://localhost:${port}${r.path}`);
      await page.waitForSelector('aside');
      await page.waitForTimeout(600); // Wait for transition animations
      const screenshotPath = path.join(outputDir, `${r.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot: ${screenshotPath}`);
    }
    console.log(`\nAll screenshots saved successfully in: ${outputDir}`);
  } finally {
    await browser.close();
    server.close();
  }
}

captureScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
