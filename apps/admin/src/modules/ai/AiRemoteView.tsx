import { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { AiRemoteBoundary } from "./AiRemoteBoundary";

export function AiRemoteView() {
  // attempt 变化时重建 lazy 组件，使被拒绝的远程 import 能重新发起请求
  const [attempt, setAttempt] = useState(0);
  const RemoteModuAi = useMemo(() => lazy(() => import("moduAi/ModuAiRemote")), [attempt]);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">AI 模块（运行时远程加载）</h1>
        <p className="text-sm text-zinc-500">
          由 Module Federation 从 Modu-AI 远程入口加载，代码不在本仓库。
        </p>
      </header>
      <AiRemoteBoundary resetKey={attempt} onRetry={retry}>
        <Suspense fallback={<p className="text-sm text-zinc-500">正在加载 Modu-AI 远程模块…</p>}>
          <RemoteModuAi
            context={{ tenantId: "t_modu", displayName: "平台管理员", themeMode: "light" }}
          />
        </Suspense>
      </AiRemoteBoundary>
    </div>
  );
}
