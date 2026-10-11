# 结果：docs 全目录仅保留本地

- 状态：completed

## 清单

- [x] 检查现有规则与 docs 跟踪状态，创建计划和结果记录。
- [x] 将忽略规则统一为 `/docs/`，移除技术栈文档例外；在仓库规范中禁止提交、添加例外或强制添加 docs 文件。
- [x] 取消 7 个 docs 文件的 Git 跟踪；通过 SHA-256 与文件清单比对确认全部 10 个本地文件保持原样。
- [x] 验证 docs 索引为空、现有全部文件及模拟多层路径被忽略，边界检查通过。
- [x] 核对实际变更与计划一致，未改动应用或既有任务记录。

## 实际变更

- 修改 `.gitignore`、`AGENTS.md`；新增本目录 `plan.md`、`result.md`。
- 仅从索引删除、本地保留：
  - `docs/MVP-PRD-轻量级ERP最小可行产品需求文档.md`
  - `docs/PRD-轻量级ERP产品需求文档.md`
  - `docs/architecture/.gitkeep`
  - `docs/development/README.md`
  - `docs/plugins/PRD-Skill管理插件.md`
  - `docs/plugins/README.md`
  - `docs/product/.gitkeep`
- 其他已有工作区变更保留；没有执行 git add、commit 或 push。

## 验证命令与结果

- `git rm -r --cached -- docs`：成功取消 7 个文件的跟踪；产生的暂存删除是实现本任务要求所必需，不是自动暂存任务记录。
- `git ls-files -z -- docs`：通过，无输出。
- Python 前后遍历 docs 并比对文件路径与 SHA-256：通过，10 个本地文件未变。
- `git check-ignore --stdin -z`（通过 Python 调用，核对完整输出）：通过，全部现有文件、技术栈文档、模拟新文件及多层嵌套路径均被忽略。
- `pnpm check:boundaries`：通过，Application boundaries OK。
- `git diff --check`、`git diff --cached --check`：通过。
- 应用专项检查：不适用，没有修改应用代码、配置或依赖。

## 偏差、阻塞与剩余问题

- 无偏差或阻塞。既有技术栈任务的忽略例外已被本任务的新要求取代；保留其历史记录不重写。
- `.gitignore` 不属于强制安全机制，人为使用 `git add -f` 仍可绕过；仓库规范明确禁止，本任务未扩展 hook / CI。
- 历史提交中的 docs 仍存在，未清理历史；当前暂存删除待用户后续提交，届时版本库不再跟踪这些文件。
