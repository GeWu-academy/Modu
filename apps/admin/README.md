# Modu Admin

React + Vite 管理后台，独立于企业官网 web 和普通用户 RN app。

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm test          # 运行全部 E2E 测试 (包含搜索框对齐与侧边栏折叠)
pnpm test:search   # Playwright 搜索框放大镜居中、展开与交互对齐测试
pnpm test:sidebar  # Playwright 侧边栏折叠/展开对齐测试
```

也可在仓库根目录使用 `pnpm install:admin`、`pnpm dev:admin` 等快捷命令。
本目录拥有自己的依赖、锁文件、TypeScript 和 ESLint 配置。
业务模块/插件放在 `src/modules/`，本后台内共享的代码放在 `src/shared/`。
API 客户端、类型和认证状态由本后台自行维护，不从其他应用或根共享包导入。
当前页面为初始化占位页，尚未实现认证与业务 API 调用。

## Docker / 一键启动

本目录可独立构建镜像（Vite 构建 + nginx 静态托管，构建上下文仅本目录）：

```bash
docker build -t modu-admin .
docker run --rm -p 8081:80 modu-admin
```

也可在仓库根目录用一条命令拉起前端 + 后端全栈（web + admin + api）：

```bash
./deploy/scripts/start.sh     # 一键启动，含 Docker 守护进程检查
./deploy/scripts/stop.sh      # 一键停止
```

编排文件 `deploy/compose/full.yaml` 默认把 admin 映射到
`http://localhost:8081`、web 到 `http://localhost:3000`、api 到
`http://localhost:8080/health`；宿主端口被占用时可用 `ADMIN_HOST_PORT`
（或 `WEB_HOST_PORT` / `API_HOST_PORT`）覆盖。该编排不含
PostgreSQL / Redis / Asynq，当前镜像只提供静态占位页，API 地址、代理/跨域
和路由回退尚未配置。
