import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { AiRemoteBoundary } from "./AiRemoteBoundary";
import { AiModuleSettings } from "./AiModuleSettings";
import { fetchAiRemoteConfig, type AiRemoteConfig } from "./remoteConfig";
import { loadModuAiRemote } from "./loadModuAiRemote";

export function AiRemoteView() {
  const [config, setConfig] = useState<AiRemoteConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // attempt 变化时重新拉取配置并重建懒加载组件（重试）
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    // 重试/保存后重新拉取配置时保留当前配置，避免设置面板被卸载（丢失「测试链接」结果提示）
    setLoadError(null);
    fetchAiRemoteConfig()
      .then((next) => {
        if (!cancelled) setConfig(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "读取配置失败");
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const RemoteModuAi = useMemo(
    () => (config?.remoteUrl ? lazy(() => loadModuAiRemote(config.remoteUrl)) : null),
    [config?.remoteUrl, attempt],
  );

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">AI 模块（运行时远程加载）</h1>
        <p className="text-sm text-zinc-500">
          由 Module Federation 从 Modu-AI 远程入口加载，代码不在本仓库。
        </p>
      </header>

      {loadError ? (
        <p className="text-sm text-red-600">读取 AI 模块设置失败：{loadError}</p>
      ) : !config ? (
        <p className="text-sm text-zinc-500">正在读取 AI 模块设置…</p>
      ) : config.remoteUrl && RemoteModuAi ? (
        <AiRemoteBoundary resetKey={`${config.remoteUrl}#${attempt}`} onRetry={retry}>
          <Suspense fallback={<p className="text-sm text-zinc-500">正在加载 Modu-AI 远程模块…</p>}>
            <RemoteModuAi
              context={{
                tenantId: "t_modu",
                displayName: "平台管理员",
                themeMode: "light",
              }}
            />
          </Suspense>
        </AiRemoteBoundary>
      ) : (
        <p className="text-sm text-zinc-500">
          尚未配置 Modu-AI 部署链接，请在下方填写部署地址并点击「测试链接」。
        </p>
      )}

      {config && (
        <AiModuleSettings
          config={config}
          onSaved={(next) => {
            setConfig(next);
            setAttempt((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}
