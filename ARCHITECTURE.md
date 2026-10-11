# ADR 0001：四个应用独立，代码仅在应用内共享

- 日期：2026-10-11
- 状态：已采纳

## 需求与定位

企业可以只使用 api + admin，不能因为某个入口存在而必须安装、构建或部署
另外几个入口。四个应用不是同一个前端的不同布局：

- web：企业官网，负责对外展示；需要动态能力时才访问 API。
- admin：管理后台，提供管理操作。
- app：React Native 普通用户客户端，不默认拥有管理权限。
- api：后端，提供业务能力并统一执行身份、租户与权限校验。

## 决策

保留单仓库，不使用跨应用 pnpm workspace 或根级共享运行时代码。
各级 pnpm-workspace.yaml 仅包含自身目录（`.`），避免意外加入父目录的工作区；
根工作区不包含任何应用，安装各端仍需进入对应应用目录。
每个前端拥有独立 package.json、pnpm-lock.yaml、依赖和工具配置；后端独立
使用 go.mod / go.sum。复制其中一个应用目录即可独立安装与构建。
根脚本只转发命令；docs、deploy、tooling 是仓库协调设施，不是运行时依赖。

```text
企业官网 web ───────┐
管理后台 admin ────┼── HTTP API ── api 后端 ── 数据/业务能力
普通用户 RN app ───┘
```

连线表示按需协议调用，不是源码依赖。web、admin、app 彼此没有依赖。
api + admin 交付不包含 web 或 app；官网也可以独立展示。

## 代码边界

| 应用 | 组合入口 | 业务模块/插件 | 应用内共享 |
| --- | --- | --- | --- |
| web | `app/`（Next.js App Router） | `modules/` | `shared/` |
| admin | `src/main.tsx` | `src/modules/` | `src/shared/` |
| app | `App.tsx`、`index.ts` | `src/modules/` | `src/shared/` |
| api | `cmd/server/`、`internal/transport/` | `internal/modules/` | `internal/platform/` |

`web/app/` 是官网路由目录，不代表 `apps/app` 移动应用。
业务模块只通过本地公开契约协作，不导入其他模块内部实现。
插件注册元数据、页面、菜单与权限映射归对应应用所有，不设全端共用插件包。

UI、hooks、类型、API 客户端、认证状态、配置只在所属应用内部复用。
不引入根级 packages/shared-types/api-client/ui，不通过相对路径、workspace、
file/link 依赖或 TypeScript 路径映射连接不同应用。
`apps/api/api/openapi.yaml` 是后端公开协议；消费端自行维护或生成本地适配层。
协议相同不代表客户端实现共用；当前脚手架尚无客户端适配层。

普通用户 app 的权限由 API 验证，不能共享管理员会话或自动获得管理权限。
隐藏菜单不能代替后端授权；当前认证授权尚未实现，此处是后续开发约束。

## 独立交付与权衡

- 各端只安装自己的依赖、修改自己的锁文件，允许采用不同版本。
- 构建/部署只针对所选应用，不串联其他应用的构建；故障互不阻塞发布。
- 接口变更需同步 OpenAPI，并验证受影响消费端的本地适配层。
- 接受少量实现和配置重复，换取独立交付、权限隔离与按需组合。
- 目前没有跨端共享实现需要拆迁，仅移除共享目录占位并调整工程边界。

`pnpm check:boundaries` 检查本地依赖、常规字面量导入与配置路径是否越过
应用边界；`pnpm test` 验证检查器。它不是完整语义分析器，不解析计算型导入
或任意构建配置，不能替代代码审查。各端 lint、类型检查与测试分别运行。
