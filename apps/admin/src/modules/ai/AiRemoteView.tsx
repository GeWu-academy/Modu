import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { AiRemoteBoundary } from "./AiRemoteBoundary";
import { AiModuleSettings } from "./AiModuleSettings";
import { readAiRemoteConfig, type AiRemoteConfig } from "./remoteConfig";
import { loadModuAiRemote } from "./loadModuAiRemote";

export function AiRemoteView() {
  const [config, setConfig] = useState<AiRemoteConfig>(() => readAiRemoteConfig());
  // attempt 变化时重建 lazy 组件，使被拒绝的远程 import 能重新发起请求
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const RemoteModuAi = useMemo(
    () => lazy(() => loadModuAiRemote(config.remoteUrl)),
    [config.remoteUrl, attempt],
  );

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">AI 模块（运行时远程加载）</h1>
        <p className="text-sm text-zinc-500">
          由 Module Federation 从 Modu-AI 远程入口加载，代码不在本仓库。
        </p>
      </header>

      {config.remoteUrl ? (
        <AiRemoteBoundary resetKey={`${config.remoteUrl}#${attempt}`} onRetry={retry}>
          <Suspense fallback={<p className="text-sm text-zinc-500">正在加载 Modu-AI 远程模块…</p>}>
            <RemoteModuAi
              context={{
                token: config.authToken || undefined,
                tenantId: "t_modu",
                displayName: "平台管理员",
                themeMode: "light",
              }}
            />
          </Suspense>
        </AiRemoteBoundary>
      ) : (
        <p className="text-sm text-zinc-500">尚未配置 Modu-AI 部署链接，请在下方填写后保存。</p>
      )}

      <AiModuleSettings
        config={config}
        onSaved={(next) => {
          setConfig(next);
          setAttempt((n) => n + 1);
        }}
      />
    </div>
  );
}
