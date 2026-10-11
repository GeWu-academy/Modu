import React, { useState } from "react";
import { useApp, PluginItem } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import { Badge } from "../../shared/components/Badge";
import { Modal } from "../../shared/components/Modal";
import {
  IconSearch,
  IconAlertTriangle,
  IconBookOpen,
  IconPower,
} from "../../shared/components/Icons";

export function PlatformPluginsView() {
  const { plugins, togglePlatformPlugin, navigate } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const [confirmingPlugin, setConfirmingPlugin] = useState<PluginItem | null>(null);

  const filtered = plugins.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      platformFilter === "all" ||
      (platformFilter === "available"
        ? p.platformStatus === "available"
        : p.platformStatus === "unavailable");
    return matchSearch && matchFilter;
  });

  const handleToggleClick = (p: PluginItem) => {
    if (p.platformStatus === "available") {
      // 平台下架触发二次确认
      setConfirmingPlugin(p);
    } else {
      const res = togglePlatformPlugin(p.id);
      if (!res.ok) {
        toast.error(res.message || "开放操作被拒绝");
      } else {
        toast.success(`插件 [${p.name}] 已向全平台成员开放`);
      }
    }
  };

  const handleConfirmDisable = () => {
    if (!confirmingPlugin) return;
    const res = togglePlatformPlugin(confirmingPlugin.id);
    if (!res.ok) {
      toast.error(res.message || "停用操作失败");
    } else {
      toast.success(`插件 [${confirmingPlugin.name}] 已在平台层下架停用`);
      setConfirmingPlugin(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 头部标题 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
            平台插件管理
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-0">
            平台管理员专属入口。负责插件全平台开放控制、兼容性核对与依赖冲突防范。不因平台管理获得他人业务资产。
          </p>
        </div>

        <button
          onClick={() => navigate("/platform/plugins/install")}
          className="btn btn-primary text-xs h-9"
        >
          <IconBookOpen size={14} />
          <span>插件引入与构建说明</span>
        </button>
      </div>

      {/* 筛选工具栏 */}
      <div className="card p-4 mb-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="搜索插件标识或名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="input-control text-xs w-36 shrink-0 py-1 h-8"
          >
            <option value="all">全部平台状态</option>
            <option value="available">平台已开放</option>
            <option value="unavailable">平台已下架</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          已登记插件：{plugins.length} 个
        </div>
      </div>

      {/* 插件表格 */}
      <div className="card bg-white border border-zinc-200 rounded-xl shadow-elevation-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4">插件标识与名称</th>
              <th className="py-3 px-4">发布版本</th>
              <th className="py-3 px-4">适用客户端</th>
              <th className="py-3 px-4">依赖项</th>
              <th className="py-3 px-4">平台开放状态</th>
              <th className="py-3 px-4 text-right">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-800">
            {filtered.map((p) => {
              const isAvailable = p.platformStatus === "available";

              return (
                <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-950">{p.name}</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">{p.id}</div>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {p.version}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    <div className="flex gap-1">
                      {p.platforms.map((plat) => (
                        <span
                          key={plat}
                          className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono"
                        >
                          {plat}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs">
                    {p.dependencies.length > 0 ? (
                      <span className="text-amber-700 font-mono">
                        {p.dependencies.join(", ")}
                      </span>
                    ) : (
                      <span className="text-zinc-400">无依赖</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {isAvailable ? (
                      <Badge variant="success" pulse={true}>
                        [平台开放]
                      </Badge>
                    ) : (
                      <Badge variant="neutral">[已下架/停用]</Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleClick(p)}
                      className={`btn btn-sm text-xs ${
                        isAvailable
                          ? "btn-secondary text-rose-700 border-rose-200 hover:bg-rose-50"
                          : "btn-primary"
                      }`}
                    >
                      <IconPower size={13} />
                      <span>{isAvailable ? "平台下架" : "开放给全员"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 对话框：平台停用二次确认 */}
      <Modal
        isOpen={!!confirmingPlugin}
        onClose={() => setConfirmingPlugin(null)}
        title="平台插件下架确认"
        description="请确认对全平台成员的受控影响范围"
      >
        {confirmingPlugin && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <IconAlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>操作影响范围：</strong>
                下架插件 <strong>{confirmingPlugin.name} ({confirmingPlugin.id})</strong> 后，
                所有成员的对应功能入口将自动隐藏，但<strong>所有成员已产生的数据资产与历史配置将被完整保留</strong>。
                此操作不等于卸载与抹除数据库记录。
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmingPlugin(null)}
                className="btn btn-secondary text-xs"
              >
                放弃
              </button>
              <button
                onClick={handleConfirmDisable}
                className="btn btn-danger text-xs"
              >
                确认下架停用
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
