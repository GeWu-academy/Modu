export interface AiRemoteConfig {
  remoteUrl: string;
  authToken: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const SETTINGS_PATH = "/v1/ai/module-settings";
const AUTH_TOKEN_KEY = "modu-ai.auth-token";

/** 从后端读取 AI 模块设置（实例级持久化）。 */
export async function fetchAiRemoteConfig(): Promise<AiRemoteConfig> {
  const response = await fetch(`${API_BASE}${SETTINGS_PATH}`);
  if (!response.ok) {
    throw new Error(`读取 AI 模块设置失败（HTTP ${response.status}）`);
  }
  const data = (await response.json()) as { remoteUrl?: string };
  return { remoteUrl: data.remoteUrl?.trim() ?? "", authToken: readAuthToken() };
}

/** 保存 AI 模块设置到后端。 */
export async function saveAiRemoteConfig(config: AiRemoteConfig): Promise<void> {
  const response = await fetch(`${API_BASE}${SETTINGS_PATH}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ remoteUrl: config.remoteUrl }),
  });
  if (!response.ok) {
    throw new Error(`保存 AI 模块设置失败（HTTP ${response.status}）`);
  }
  writeAuthToken(config.authToken);
}

/**
 * 访问 Token 暂存浏览器本地。
 * 注：真正的签发/下发由平台认证负责（Phase C），届时改为后端下发。
 */
export function readAuthToken(): string {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? "";
}

export function writeAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}
