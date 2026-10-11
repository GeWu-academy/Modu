# Your ERP

面向多租户业务团队的轻量级 ERP，采用前后端分离与插件化业务模块架构。

## 项目结构

- `apps/web`：React + Vite 管理后台
- `apps/api`：Go + Gin API 服务
- `packages`：共享 UI、API 客户端、类型与工程配置
- `plugins`：可独立注册的官方业务插件
- `deploy`：本地与部署环境配置
- `docs`：产品、架构与开发文档

## 开始开发

```bash
pnpm install
pnpm dev
```

API 服务：

```bash
cd apps/api
go run ./cmd/server
```

更多约定见 [`AGENTS.md`](./AGENTS.md) 与 [`docs/development/`](./docs/development/)。
