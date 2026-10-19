import type { ComponentType } from "react";
import { loadRemote, registerRemotes } from "@module-federation/runtime";

export interface ModuAiHostContext {
  token?: string;
  userId?: string;
  tenantId?: string;
  displayName?: string;
  themeMode?: "light" | "dark";
  apiBaseUrl?: string;
}

export interface ModuAiRemoteProps {
  context?: ModuAiHostContext;
}

export type ModuAiRemoteComponent = ComponentType<ModuAiRemoteProps>;

let registeredUrl: string | null = null;

/**
 * 运行时动态注册 remote：用前端配置的地址覆盖 MF 运行时中的 remote 条目。
 * 这样无需重新构建 admin 即可切换 Modu-AI 的部署地址。
 */
export function registerModuAiRemote(remoteUrl: string): void {
  if (registeredUrl === remoteUrl) {
    return;
  }
  registerRemotes([{ name: "moduAi", type: "module", entry: remoteUrl }], { force: true });
  registeredUrl = remoteUrl;
}

export async function loadModuAiRemote(
  remoteUrl: string,
): Promise<{ default: ModuAiRemoteComponent }> {
  registerModuAiRemote(remoteUrl);
  const mod = await loadRemote<{ default: ModuAiRemoteComponent }>("moduAi/ModuAiRemote");
  if (!mod?.default) {
    throw new Error("远程模块未导出默认组件（./ModuAiRemote）");
  }
  return { default: mod.default };
}
