import { useState } from "react";
import { writeAiRemoteConfig, type AiRemoteConfig } from "./remoteConfig";

interface AiModuleSettingsProps {
  config: AiRemoteConfig;
  onSaved: (config: AiRemoteConfig) => void;
}

export function AiModuleSettings({ config, onSaved }: AiModuleSettingsProps) {
  const [remoteUrl, setRemoteUrl] = useState(config.remoteUrl);
  const [authToken, setAuthToken] = useState(config.authToken);

  const save = () => {
    const next: AiRemoteConfig = { remoteUrl: remoteUrl.trim(), authToken: authToken.trim() };
    writeAiRemoteConfig(next);
    onSaved(next);
  };

  return (
    <div className="max-w-[640px] rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-900">Modu-AI 部署配置</h2>
      <p className="mt-1 text-xs text-zinc-500">
        阶段 A：配置暂存于浏览器本地；阶段 B 将持久化到后端实例设置。
      </p>
      <label className="mt-4 block text-xs font-medium text-zinc-600">
        Modu-AI 部署链接（remoteEntry.js）
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={remoteUrl}
          onChange={(event) => setRemoteUrl(event.target.value)}
          placeholder="https://your-modu-ai.example.com/remoteEntry.js"
        />
      </label>
      <label className="mt-3 block text-xs font-medium text-zinc-600">
        访问 Token（用于调用后端）
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          type="password"
          value={authToken}
          onChange={(event) => setAuthToken(event.target.value)}
          placeholder="token（可选）"
        />
      </label>
      <button
        type="button"
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        onClick={save}
      >
        保存并连接
      </button>
    </div>
  );
}
