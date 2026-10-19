import { useState } from "react";
import { saveAiRemoteConfig, type AiRemoteConfig } from "./remoteConfig";
import { testModuAiConnection } from "./testModuAiConnection";

interface AiModuleSettingsProps {
  config: AiRemoteConfig;
  onSaved: (config: AiRemoteConfig) => void;
}

interface SettingsMessage {
  kind: "ok" | "error";
  text: string;
}

export function AiModuleSettings({ config, onSaved }: AiModuleSettingsProps) {
  const [remoteUrl, setRemoteUrl] = useState(config.remoteUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<SettingsMessage | null>(null);

  const testAndSave = async () => {
    setBusy(true);
    setMessage(null);
    const next: AiRemoteConfig = { remoteUrl: remoteUrl.trim() };
    try {
      const result = await testModuAiConnection(next.remoteUrl);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.message });
        return;
      }
      await saveAiRemoteConfig(next);
      onSaved(next);
      setMessage({ kind: "ok", text: "连接成功，已保存并加载远程模块" });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "保存失败" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[640px] rounded-xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-zinc-900">Modu-AI 部署配置</h2>
      <p className="mt-1 text-xs text-zinc-500">
        只需填入 Modu-AI 部署地址（remoteEntry.js）；点击「测试链接」，连通成功后自动保存并加载远程模块。
      </p>
      <label className="mt-4 block text-xs font-medium text-zinc-600">
        Modu-AI 部署地址（remoteEntry.js）
        <input
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          value={remoteUrl}
          onChange={(event) => setRemoteUrl(event.target.value)}
          placeholder="https://your-modu-ai.example.com/remoteEntry.js"
        />
      </label>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          onClick={testAndSave}
          disabled={busy || !remoteUrl.trim()}
        >
          {busy ? "测试中…" : "测试链接"}
        </button>
        {message && (
          <span
            className={`text-xs ${message.kind === "ok" ? "text-emerald-600" : "text-red-600"}`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
