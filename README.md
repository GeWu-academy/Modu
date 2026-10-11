# Your ERP

面向多租户业务团队的轻量级 ERP。采用 Monorepo 管理，四个应用独立维护、按需组合。

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

前端使用 TypeScript；目标后端基础为 Go + Gin + GORM + PostgreSQL + Redis +
Asynq。TanStack Query 管理前端的服务端数据状态，Zustand 管理客户端共享状态。
这些是选型基线，不代表所有依赖和能力已经接入；上表描述当前应用框架。

## 持续集成与交付（GitHub Actions）

`.github/workflows/` 下有两个仓库级工作流：

- `ci.yml`（检测与测试）：在 PR、`main`/`dev` 推送与手动触发时运行。作业包括根工具
  （`pnpm check:boundaries`、`pnpm test`）、前端矩阵（`web`/`admin`/`app` 各自安装依赖后
  执行 `lint`、`typecheck`、`build`）和后端（`gofmt -l` 校验、`go build ./...`、
  `go vet ./...`、`go test ./...`）。每个作业只在自己的应用目录安装依赖。
- `cd.yml`（交付）：在 `main` 推送与 `v*` tag（及手动触发）时，用各应用既有 Dockerfile
  构建镜像并推送到 GHCR（`ghcr.io/<owner>/modu-<web|admin|api>`）。它只产出镜像，不部署
  任何环境；`apps/app` 需要模拟器/设备，不在镜像矩阵内。

本地等效命令（在各端目录执行）：

| 端 | 本地等效检查 |
| --- | --- |
| 根工具 | `pnpm check:boundaries`、`pnpm test` |
| web / admin / app | `pnpm --dir apps/<app> install --frozen-lockfile`，再 `pnpm lint`、`pnpm typecheck`、`pnpm build` |
| api | `cd apps/api && gofmt -l . && go build ./... && go vet ./... && go test ./...` |

工作流只在 GitHub runner 上真实执行；本地验证覆盖 YAML 结构、命令与各端脚本一致，
以及上述命令的本地等效执行。

每个独立任务按小 MVP 推进，在 `changes/YYYY-MM-DD-NN-short-topic/` 中先建立
`plan.md` 与 `result.md`，持续记录计划、文件变更、checklist 和验证结果。
同一任务的追问与修复更新原记录，不按每条消息拆分。

更多约定见 [架构决策](./ARCHITECTURE.md)、
[技术栈选型](./docs/architecture/tech-stack.md)、
[开发说明](./docs/development/README.md) 和 [AGENTS.md](./AGENTS.md)。
