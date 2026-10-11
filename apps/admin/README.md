# Modu Admin

React + Vite 管理后台，独立于企业官网 web 和普通用户 RN app。

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

也可在仓库根目录使用 `pnpm install:admin`、`pnpm dev:admin` 等快捷命令。
本目录拥有自己的依赖、锁文件、TypeScript 和 ESLint 配置。
业务模块/插件放在 `src/modules/`，本后台内共享的代码放在 `src/shared/`。
API 客户端、类型和认证状态由本后台自行维护，不从其他应用或根共享包导入。
当前页面为初始化占位页，尚未实现认证与业务 API 调用。

Docker 构建只需要本目录：`docker build -t modu-admin .`。
当前镜像提供静态占位页；API 地址、代理/跨域和路由回退尚未配置。
