import React, { useState } from "react";
import { useApp, PluginItem } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import { Badge } from "../../shared/components/Badge";
import { Drawer } from "../../shared/components/Drawer";
import {
  IconSearch,
  IconPuzzle,
  IconSettings,
  IconAlertTriangle,
  IconPower,
  IconBookOpen,
  IconSparkles,
} from "../../shared/components/Icons";

export function MyPluginsView() {
  const { plugins, toggleMyPlugin, navigate } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [configuringPlugin, setConfiguringPlugin] = useState<PluginItem | null>(null);
  const [personalConfig, setPersonalConfig] = useState({
    pageSize: "20",
    defaultView: "table",
    autoRefresh: true,
  });

  const filtered = plugins.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" ? p.myStatus === "enabled" : p.myStatus === "disabled");
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleToggle = (p: PluginItem) => {
    const res = toggleMyPlugin(p.id);
    if (!res.ok) {
      toast.error(res.message || "启停操作被拒绝");
    } else {
      toast.success(`插件 [${p.name}] 已${p.myStatus === "enabled" ? "停用" : "启用"}`);
    }
  };

  const handleSaveConfig = () => {
    toast.success("个人配置已保存（仅限当前账号生效）");
    setConfiguringPlugin(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 头部标题与说明 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
            我的插件中心
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-0">
            查看平台已开放目录，管理本人插件启用状态与个人偏好配置。业务资产完全限定本人。
          </p>
        </div>

        <button
          onClick={() => navigate("/platform/plugins/install")}
          className="btn btn-secondary text-xs h-9 flex items-center gap-1.5"
        >
          <IconBookOpen size={14} />
          <span>查看插件引入规范</span>
        </button>
      </div>

      {/* 搜索与过滤工具条 */}
      <div className="card p-4 mb-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <IconSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="搜索插件名称、标识或描述..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-control text-xs w-32 py-1 h-8"
          >
            <option value="all">全部本人状态</option>
            <option value="enabled">本人已启用</option>
            <option value="disabled">本人未启用</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-control text-xs w-32 py-1 h-8"
          >
            <option value="all">全部分类</option>
            <option value="erp">ERP 业务</option>
            <option value="system">系统底座</option>
            <option value="tool">实验工具</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          已启用 {plugins.filter((p) => p.myStatus === "enabled").length} / {plugins.length} 个插件
        </div>
      </div>

      {/* 插件卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const isEnabled = p.myStatus === "enabled";
          const isPlatformAvailable = p.platformStatus === "available";

          return (
            <div
              key={p.id}
              className={`card flex flex-col justify-between bg-white border rounded-xl transition-all duration-150 ${
                isEnabled
                  ? "border-brand-200 shadow-elevation-1 hover:shadow-elevation-2"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <div className="p-5">
                {/* 顶部：图标与状态 Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isEnabled
                        ? "bg-brand-50 text-brand-600 border border-brand-200"
                        : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                    }`}
                  >
                    <IconPuzzle size={20} />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isPlatformAvailable ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        平台已开放
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                        平台暂未开放
                      </span>
                    )}

                    {isEnabled ? (
                      <Badge variant="success" pulse={true}>
                        本人已启用
                      </Badge>
                    ) : (
                      <Badge variant="neutral">本人未启用</Badge>
                    )}
                  </div>
                </div>

                {/* 标题与标识 */}
                <h3 className="text-base font-bold text-zinc-950 m-0 tracking-tight">
                  {p.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-1">
                  <span>{p.id}</span>
                  <span>·</span>
                  <span className="px-1.5 py-0.2 bg-zinc-100 rounded text-zinc-600">
                    {p.version}
                  </span>
                </div>

                {/* 描述 */}
                <p className="text-xs text-zinc-600 mt-2.5 mb-3 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* 适用端与依赖项 */}
                <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                  <span className="text-zinc-400">支持端：</span>
                  {p.platforms.map((plat) => (
                    <span
                      key={plat}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-mono"
                    >
                      {plat}
                    </span>
                  ))}

                  {p.dependencies.length > 0 && (
                    <div className="w-full mt-1.5 flex items-center gap-1 text-[11px] text-amber-700">
                      <IconAlertTriangle size={12} className="flex-shrink-0" />
                      <span>前置依赖：{p.dependencies.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className="p-3.5 bg-zinc-50/70 border-t border-zinc-200 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(p)}
                  disabled={!isPlatformAvailable}
                  className={`btn btn-sm text-xs ${
                    isEnabled
                      ? "btn-secondary text-rose-700 border-rose-200 hover:bg-rose-50"
                      : "btn-primary"
                  }`}
                  title={!isPlatformAvailable ? "平台尚未开放该插件" : undefined}
                >
                  <IconPower size={13} />
                  <span>{isEnabled ? "本人停用" : "本人启用"}</span>
                </button>

                <div className="flex items-center gap-2">
                  {isEnabled && (
                    <button
                      onClick={() => setConfiguringPlugin(p)}
                      className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                    >
                      <IconSettings size={13} />
                      <span>个人配置</span>
                    </button>
                  )}

                  {isEnabled && p.id === "plugin_skills" && (
                    <button
                      onClick={() => navigate("/skills")}
                      className="btn-ghost btn-sm text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
                    >
                      <IconSparkles size={13} />
                      <span>打开 Skill</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 抽屉：个人配置抽屉 */}
      <Drawer
        isOpen={!!configuringPlugin}
        onClose={() => setConfiguringPlugin(null)}
        title={`个人配置 · ${configuringPlugin?.name}`}
        description="配置仅保存在当前用户上下文中，不影响其他成员或平台默认配置"
      >
        {configuringPlugin && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
              <div className="text-zinc-500">
                插件标识：<span className="font-mono text-zinc-900">{configuringPlugin.id}</span>
              </div>
              <div className="text-zinc-500">
                当前版本：<span className="font-mono text-zinc-900">{configuringPlugin.version}</span>
              </div>
            </div>

            <div>
              <label className="input-label">默认数据分页大小</label>
              <select
                value={personalConfig.pageSize}
                onChange={(e) =>
                  setPersonalConfig({ ...personalConfig, pageSize: e.target.value })
                }
                className="input-control text-sm"
              >
                <option value="10">10 条 / 页</option>
                <option value="20">20 条 / 页 (默认)</option>
                <option value="50">50 条 / 页</option>
              </select>
            </div>

            <div>
              <label className="input-label">默认展示视图</label>
              <select
                value={personalConfig.defaultView}
                onChange={(e) =>
                  setPersonalConfig({ ...personalConfig, defaultView: e.target.value })
                }
                className="input-control text-sm"
              >
                <option value="table">紧凑表格视图</option>
                <option value="card">卡片卡组视图</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={personalConfig.autoRefresh}
                  onChange={(e) =>
                    setPersonalConfig({ ...personalConfig, autoRefresh: e.target.checked })
                  }
                />
                <span>进入页面时自动同步最新记录 (避免使用旧缓存)</span>
              </label>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setConfiguringPlugin(null)}
                className="btn btn-secondary text-xs"
              >
                取消
              </button>
              <button onClick={handleSaveConfig} className="btn btn-primary text-xs">
                保存个人配置
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
