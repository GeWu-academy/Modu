# Your ERP

面向多租户业务团队的轻量级 ERP。单仓库管理，四个应用独立维护、按需组合。

## 应用定位

| 应用 | 用途 | 技术 | 本地共享代码 |
| --- | --- | --- | --- |
| `apps/web` | 企业官网，不是管理后台 | Next.js | `shared/` |
| `apps/admin` | 管理后台 | React + Vite | `src/shared/` |
| `apps/app` | 面向普通用户权限的 RN 应用，不是移动管理后台 | React Native + Expo | `src/shared/` |
| `apps/api` | 后端服务 | Go + Gin | `internal/platform/` |

各应用拥有自己的依赖、锁文件和配置，不互相导入源码。不存在根级共享
`packages/` 或运行时 `plugins/`；业务插件在各自应用内实现与注册。
客户端只通过 API 协议访问后端，权限由后端校验。

## 按需开发

例如只使用 **api + admin**：

```bash
pnpm install:admin
pnpm dev:admin
# 在另一个终端启动后端
pnpm dev:api
```

无需安装或构建 web、app。也可直接进入 `apps/admin` 执行 `pnpm install`
和 `pnpm dev`，后端在 `apps/api` 执行 `go run ./cmd/server`。

其他应用分别使用 `pnpm install:web` / `pnpm dev:web` 和
`pnpm install:app` / `pnpm dev:app`。根级 `pnpm dev`、`pnpm build`、
`pnpm lint`、`pnpm typecheck` 是 **企业官网** 命令的兼容快捷入口，
并不运行所有应用；根级 `pnpm install` 也不会安装各端依赖。

检查使用 `pnpm lint:<app>`、`pnpm typecheck:<app>`、`pnpm build:<app>`。
`pnpm build:app` 仅导出移动端 JavaScript bundle 和资源，不生成安装包。

更多约定见 [架构决策](./ARCHITECTURE.md)、
[开发说明](./docs/development/README.md) 和 [AGENTS.md](./AGENTS.md)。
