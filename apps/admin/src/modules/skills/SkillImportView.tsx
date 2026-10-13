import React, { useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import {
  IconArrowLeft,
  IconUpload,
  IconAlertTriangle,
  IconSparkles,
} from "../../shared/components/Icons";

export function SkillImportView() {
  const { addSkill, skills, navigate } = useApp();
  const toast = useToast();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("法务风控");
  const [tags, setTags] = useState("合规, 审计");
  const [content, setContent] = useState("");

  // 冲突检测
  const existingSkill = skills.find((s) => s.code === code.trim());

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !content) {
      toast.warning("请填写完整的 Skill 标识、名称与 Markdown 正文");
      return;
    }

    // 安全校验：检测是否存在危险脚本标签
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(content)) {
      toast.error("安全防御拦截：Markdown 中检测到危险的 <script> 注入代码，禁止导入！");
      return;
    }

    addSkill({
      code: code.trim(),
      name: name.trim(),
      version: existingSkill ? "v2.0-draft" : "v1.0",
      hasDraftChanges: true,
      status: "active",
      category,
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      content,
    });

    toast.success(`Skill [${name}] 已成功以草稿形式受控导入！`);
    navigate("/skills");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 顶部返回 */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/skills")}
          className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
        >
          <IconArrowLeft size={14} />
          <span>返回 Skill 列表</span>
        </button>
      </div>

      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
          受控导入业务 Skill
        </h1>
        <p className="text-sm text-zinc-500 mt-1 mb-0">
          以结构化草稿方式导入 Markdown 业务指令规范。导入成功不等于已发布，须经显式版本发布确认。
        </p>
      </div>

      {/* 安全声明横幅 */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl mb-6 flex items-start gap-3 text-xs text-zinc-600 leading-relaxed">
        <IconSparkles size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>零脚本注入安全沙盒：</strong>
          导入的内容仅作为大模型与 Agent 意图识别的提示词与领域规则，系统禁止解析任何可执行脚本，白名单字段过滤，不影响他人业务。
        </div>
      </div>

      {/* 导入表单 */}
      <form onSubmit={handleImportSubmit} className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Skill 唯一代码标识 (Code)</label>
            <input
              type="text"
              required
              placeholder="例如：procurement-price-verify"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-control text-sm"
            />
            {existingSkill ? (
              <p className="input-hint text-amber-700 flex items-center gap-1">
                <IconAlertTriangle size={12} />
                <span>检测到已有相同标识，导入将作为该 Skill 的新草稿版本</span>
              </p>
            ) : (
              <p className="input-hint">全局唯一英文字符串，用于 Agent 命令调用映射</p>
            )}
          </div>

          <div>
            <label className="input-label">展示名称</label>
            <input
              type="text"
              required
              placeholder="例如：采购比价与浮动异常核验"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-control text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">业务分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-control text-sm"
            >
              <option value="法务风控">法务风控</option>
              <option value="客户协同">客户协同</option>
              <option value="仓储物流">仓储物流</option>
              <option value="采购比价">采购比价</option>
            </select>
          </div>

          <div>
            <label className="input-label">标签清单 (以逗号分隔)</label>
            <input
              type="text"
              placeholder="例如：采购, 价格, 预警"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-control text-sm"
            />
          </div>
        </div>

        <div>
          <label className="input-label">Markdown 指令规范正文</label>
          <textarea
            required
            rows={8}
            placeholder={`# 指令规范标题\n\n- 目标：描述本 Skill 的执行目的\n- 约束条件：禁止越权读取非本人数据\n\n## 校验逻辑\n1. 规则一...\n2. 规则二...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-control text-xs font-mono p-3 leading-relaxed"
          />
        </div>

        {/* 底部确认操作 */}
        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            导入后将自动生成独立审计记录
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/skills")}
              className="btn btn-secondary text-xs"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              <IconUpload size={14} />
              <span>确认受控导入草稿</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
