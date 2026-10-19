const TEST_TIMEOUT_MS = 8000;

export interface AiConnectionTestResult {
  ok: boolean;
  message: string;
}

/**
 * 测试 Modu-AI 部署地址是否可达。
 * 以浏览器 fetch 探测 remoteEntry.js：与 Module Federation 动态加载同受 CORS 约束，
 * 探测结果可代表真实远程加载的可达性；不执行远程代码（仅读取响应）。
 */
export async function testModuAiConnection(rawUrl: string): Promise<AiConnectionTestResult> {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { ok: false, message: "请先填写 Modu-AI 部署地址" };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, message: "地址格式不正确，请填写完整 URL（含 http:// 或 https://）" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, message: "仅支持 http:// 或 https:// 地址" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);
  try {
    const response = await fetch(url.href, { signal: controller.signal });
    if (!response.ok) {
      return { ok: false, message: `连接失败：入口返回 HTTP ${response.status}` };
    }
    const body = await response.text();
    if (/^\s*<(?:!doctype|html)/i.test(body)) {
      return { ok: false, message: "该地址返回的是 HTML 页面，请填写远程入口（remoteEntry.js）地址" };
    }
    return { ok: true, message: "连接成功" };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, message: `连接超时（${TEST_TIMEOUT_MS / 1000} 秒内无响应）` };
    }
    return { ok: false, message: "无法访问该地址（网络错误、跨域限制或服务未部署）" };
  } finally {
    clearTimeout(timer);
  }
}
