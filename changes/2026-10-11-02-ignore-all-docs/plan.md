# 计划：docs 全目录仅保留本地

- 日期：2026-10-11（Asia/Taipei）。
- 背景：用户要求 docs 内所有文件（含嵌套文件）均不允许提交；当前忽略规则对技术栈文档留有例外，且已有 7 个 docs 文件被跟踪。
- 目标 / 最小交付：递归忽略根目录 docs，取消已有 docs 文件的 Git 跟踪，保留本地原文件，并在仓库规范中明确禁止强制添加。
- 包含：Git 忽略配置、仓库规范、docs 索引状态及本任务记录。
- 排除：应用代码、依赖、文档正文修改、历史提交清理、Git hook / CI 扩展、提交或推送。
- 已确认：没有任何 docs 文件例外；取消跟踪使用 git rm --cached，不删除本地文件。不修改既有任务记录。
- 开放问题：无。gitignore 可被人为强制添加绕过，规范明确禁止；本任务不引入额外强制机制。

## 预期文件变更

- 修改 `.gitignore`：用 `/docs/` 替换 docs 例外规则。
- 修改 `AGENTS.md`：新增 docs 本地专用、禁止强制添加的规则。
- 新增本目录 `plan.md`、`result.md`：记录计划和结果。
- 仅从索引删除（本地保留）：`docs/MVP-PRD-轻量级ERP最小可行产品需求文档.md`、`docs/PRD-轻量级ERP产品需求文档.md`、`docs/architecture/.gitkeep`、`docs/development/README.md`、`docs/plugins/PRD-Skill管理插件.md`、`docs/plugins/README.md`、`docs/product/.gitkeep`。

## 实施步骤

1. 保存 docs 本地文件清单和内容摘要用于前后核验。
2. 最小修改忽略规则和仓库规范，取消 docs 跟踪。
3. 核验所有本地文件未变、docs 索引为空、现有及模拟深层新文件均被忽略。
4. 运行边界检查，核对实际变更并完成结果记录。

## 验收及验证方式

- `git ls-files docs` 无输出：没有被跟踪的 docs 文件。
- `git check-ignore` 检查现有全部 docs 文件及模拟多层路径：递归忽略生效，无例外。
- 前后清单及 SHA-256 一致：本地 docs 内容完整保留。
- `pnpm check:boundaries` 通过。
- 应用专项检查不适用：没有修改应用代码、配置或依赖。
- 不执行 git add / commit / push；唯一索引变更是按本任务要求取消 docs 跟踪产生的暂存删除。
