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

## Docker / 一键启动

本目录可独立构建镜像（Next.js standalone 多阶段构建，构建上下文仅本目录）：

```bash
docker build -t modu-web .
docker run --rm -p 3001:3000 modu-web   # 3000 常被占用，示例改用 3001
```

也可在仓库根目录用一条命令拉起前端 + 后端全栈（web + admin + api）：

```bash
./deploy/scripts/start.sh     # 一键启动，含 Docker 守护进程检查
./deploy/scripts/stop.sh      # 一键停止
```

默认访问 web `http://localhost:3000`、admin `http://localhost:8081`、
api `http://localhost:8080/health`。宿主端口被占用时可用 `WEB_HOST_PORT=3001`
（或 `ADMIN_HOST_PORT` / `API_HOST_PORT`）覆盖。编排文件为 `deploy/compose/full.yaml`，
不含 PostgreSQL / Redis / Asynq。当前官网不调用 API，容器未配置 API 代理、
跨域、SPA 路由回退、生产 TLS 或认证。
