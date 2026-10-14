import { useState } from "react";
import { saveAiRemoteConfig, type AiRemoteConfig } from "./remoteConfig";

interface AiModuleSettingsProps {
  config: AiRemoteConfig;
  onSaved: (config: AiRemoteConfig) => void;
}

export function AiModuleSettings({ config, onSaved }: AiModuleSettingsProps) {
  const [remoteUrl, setRemoteUrl] = useState(config.remoteUrl);
  const [authToken, setAuthToken] = useState(config.authToken);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const next: AiRemoteConfig = { remoteUrl: remoteUrl.trim(), authToken: authToken.trim() };
    try {
      await saveAiRemoteConfig(next);
      onSaved(next);
      setMessage("已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[640px] rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-900">Modu-AI 部署配置</h2>
      <p className="mt-1 text-xs text-zinc-500">
        部署链接持久化到后端实例设置（PostgreSQL）；访问 Token 暂存本地，用于远程模块调用后端。
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
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          onClick={save}
          disabled={saving}
        >
          {saving ? "保存中…" : "保存并连接"}
        </button>
        {message && <span className="text-xs text-zinc-500">{message}</span>}
      </div>
    </div>
  );
}
