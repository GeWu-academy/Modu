# Development

web 是企业官网，admin 是管理后台，app 是普通用户 RN 客户端，api 是后端。
各端独立安装依赖、构建和发布，没有跨端依赖工作区或根级共享运行时代码。

## 按需开发

在仓库根目录只安装选中的前端：

```bash
pnpm install:web      # 企业官网
pnpm dev:web
pnpm install:admin    # 管理后台
pnpm dev:admin
pnpm install:app      # 普通用户 RN 应用
pnpm dev:app
pnpm dev:api          # Go 后端，与 pnpm 依赖无关
```

根脚本只是快捷命令，也可在前端应用目录直接执行 `pnpm install` / `pnpm dev`。
根级 `pnpm install` 不安装各端依赖。只需要 api + admin 时，仅运行 admin
和 api 的命令，不安装官网或 RN 依赖。

前端分别运行 `pnpm lint:web`、`pnpm typecheck:web`、`pnpm build:web`，
admin、app 使用相应后缀。后端在 `apps/api` 执行 `go test ./...`。
构建一端不能以其他端的构建为前置条件。

## 边界与 API

目录约定见 [架构决策](../../ARCHITECTURE.md)。
API 契约以 `apps/api/api/openapi.yaml` 为准，消费端适配代码和类型留在各端。
权限由 API 校验，RN 普通用户应用不能复用管理员权限或会话。

```bash
pnpm check:boundaries
pnpm test
```

## api + admin 容器示例

```bash
docker compose -f deploy/compose/api-admin.yaml up --build
```

后台占位页访问 `http://localhost:8081`，API 健康检查访问
`http://localhost:8080/health`。构建上下文分别只有 admin 和 api 目录。
当前前端尚无 API 请求；该示例仅运行静态后台与后端，不配置 API 代理、
跨域策略、SPA 深层路由回退、生产 TLS 或认证。实现业务请求时需另行配置
本端 API 地址与相应代理/跨域策略。
