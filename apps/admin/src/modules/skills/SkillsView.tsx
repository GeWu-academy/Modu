import React, { useState } from "react";
import { useApp, SkillItem } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import { Badge } from "../../shared/components/Badge";
import { Drawer } from "../../shared/components/Drawer";
import {
  IconSearch,
  IconSparkles,
  IconPlus,
  IconUpload,
  IconFileText,
  IconCheck,
  IconEdit,
  IconPower,
} from "../../shared/components/Icons";

export function SkillsView() {
  const { skills, toggleSkillStatus, navigate } = useApp();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const filtered = skills.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "all" || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleToggle = (s: SkillItem) => {
    toggleSkillStatus(s.id);
    toast.success(`Skill [${s.name}] 已${s.status === "active" ? "停用" : "启用"}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 头部标题与操作 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
            Skill 知识与指令底座
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-0">
            管理可供 AI 与业务 Agent 复用的专业 Markdown 指令。内容仅限本人资产白名单，不自动执行远程脚本。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/skills/import")}
            className="btn btn-primary text-xs h-9"
          >
            <IconUpload size={14} />
            <span>受控导入 Skill</span>
          </button>
        </div>
      </div>

      {/* 搜索过滤条 */}
      <div className="card p-4 mb-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <IconSearch size={15} />
            </span>
            <input
              type="text"
              placeholder="搜索 Skill 名称、代码标识或标签..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-control text-xs w-36 py-1 h-8"
          >
            <option value="all">全部分类</option>
            <option value="法务风控">法务风控</option>
            <option value="客户协同">客户协同</option>
            <option value="仓储物流">仓储物流</option>
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          有效资产：{skills.filter((s) => s.status === "active").length} / {skills.length} 项
        </div>
      </div>

      {/* 数据表格 */}
      <div className="card bg-white border border-zinc-200 rounded-xl shadow-elevation-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4">Skill 名称与唯一标识</th>
              <th className="py-3 px-4">分类与标签</th>
              <th className="py-3 px-4">发布版本</th>
              <th className="py-3 px-4">草稿状态</th>
              <th className="py-3 px-4">生命周期状态</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-800">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-zinc-950 flex items-center gap-2">
                    <IconSparkles size={14} className="text-brand-600" />
                    <span>{s.name}</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono mt-0.5">{s.code}</div>
                </td>

                <td className="py-3.5 px-4 text-xs">
                  <span className="font-medium text-zinc-800 mr-2">{s.category}</span>
                  <div className="flex gap-1 inline-flex mt-0.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded text-[11px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {s.version}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-xs">
                  {s.hasDraftChanges ? (
                    <span className="text-amber-700 font-medium">有未发布草稿</span>
                  ) : (
                    <span className="text-zinc-400">与发布一致</span>
                  )}
                </td>

                <td className="py-3.5 px-4">
                  {s.status === "active" ? (
                    <Badge variant="success">[状态: 已启用]</Badge>
                  ) : (
                    <Badge variant="neutral">[状态: 已停用]</Badge>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedSkill(s)}
                      className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                    >
                      <IconFileText size={13} />
                      <span>查看详情</span>
                    </button>

                    <button
                      onClick={() => handleToggle(s)}
                      className={`btn-ghost btn-sm text-xs ${
                        s.status === "active"
                          ? "text-rose-600 hover:text-rose-800"
                          : "text-brand-600 hover:text-brand-800"
                      }`}
                    >
                      {s.status === "active" ? "停用" : "启用"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 抽屉：Skill 详情与只读 Markdown 预览 */}
      <Drawer
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
        title={selectedSkill?.name || "Skill 详情"}
        description={`标识：${selectedSkill?.code} · 当前版本：${selectedSkill?.version}`}
        width="560px"
      >
        {selectedSkill && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
              <div>
                分类：<span className="font-semibold text-zinc-900">{selectedSkill.category}</span>
              </div>
              <div>
                标签：
                <span className="text-zinc-700">{selectedSkill.tags.join(", ")}</span>
              </div>
              <div>
                最后更新：<span className="font-mono text-zinc-600">{selectedSkill.updatedAt}</span>
              </div>
            </div>

            <div>
              <label className="input-label">指令规范正文 (只读安全预览)</label>
              <div className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                {selectedSkill.content}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedSkill(null)}
                className="btn btn-secondary text-xs"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
