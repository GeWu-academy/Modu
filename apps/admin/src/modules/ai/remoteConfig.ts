export interface AiRemoteConfig {
  remoteUrl: string;
  authToken: string;
}

const STORAGE_KEY = "modu-ai.remote-config";
const EMPTY: AiRemoteConfig = { remoteUrl: "", authToken: "" };

/**
 * 阶段 A：以浏览器本地存储作为配置来源的临时实现。
 * 阶段 B 将替换为读写 apps/api 的实例设置接口（保持本模块读写签名不变，便于切换）。
 */
export function readAiRemoteConfig(): AiRemoteConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as Partial<AiRemoteConfig>;
    return { remoteUrl: parsed.remoteUrl?.trim() ?? "", authToken: parsed.authToken ?? "" };
  } catch {
    return EMPTY;
  }
}

export function writeAiRemoteConfig(config: AiRemoteConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
