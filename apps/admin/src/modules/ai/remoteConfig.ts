export interface AiRemoteConfig {
  remoteUrl: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const SETTINGS_PATH = "/v1/ai/module-settings";

/** 从后端读取 AI 模块设置（实例级持久化）。 */
export async function fetchAiRemoteConfig(): Promise<AiRemoteConfig> {
  const response = await fetch(`${API_BASE}${SETTINGS_PATH}`);
  if (!response.ok) {
    throw new Error(`读取 AI 模块设置失败（HTTP ${response.status}）`);
  }
  const data = (await response.json()) as { remoteUrl?: string };
  return { remoteUrl: data.remoteUrl?.trim() ?? "" };
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
}
