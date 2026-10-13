import { Suspense, lazy } from "react";

const RemoteModuAi = lazy(() => import("moduAi/ModuAiRemote"));

export function AiRemoteView() {
  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-zinc-900">AI 模块（运行时远程加载）</h1>
        <p className="text-sm text-zinc-500">
          由 Module Federation 从 Modu-AI 远程入口加载，代码不在本仓库。
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-zinc-500">正在加载 Modu-AI 远程模块…</p>}>
        <RemoteModuAi
          context={{ tenantId: "t_modu", displayName: "平台管理员", themeMode: "light" }}
        />
      </Suspense>
    </div>
  );
}
