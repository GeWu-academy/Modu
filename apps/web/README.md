# Modu Web

Next.js 企业官网，用于企业对外展示；**不是管理后台**。
管理后台位于 `apps/admin`，普通用户 RN 应用位于 `apps/app`。

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

本目录独立维护依赖、锁文件和工程配置；不要求安装 admin 或 app。
`app/` 是 Next.js App Router 路由目录，`modules/` 是官网业务模块，
`shared/` 仅用于官网内共享，不供其他应用导入。
需要后端数据时使用本端本地 API 适配层，不复用后台会话或客户端。
当前官网仍是 Next.js 模板页，尚未实现企业展示内容。
