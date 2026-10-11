# Plugin Development

插件是应用内业务扩展，不是 web、admin、app 共用的运行时包。
web 为企业官网，admin 为管理后台，app 为普通用户 RN 应用；各端入口与权限
不同，只通过后端 API 协议连接，不共用 UI 或管理员会话。

- 后端业务模块：`apps/api/internal/modules/<module>`。
- 后台插件：`apps/admin/src/modules/<module>`。
- RN 业务扩展：`apps/app/src/modules/<module>`。
- 官网业务扩展（按需）：`apps/web/modules/<module>`。

各端维护本地注册元数据，接入本端导航、权限、路由和页面。模块依赖本地公开
契约，不依赖其他模块内部实现；共享代码仅放在所属应用内。

## 产品需求文档

- [Skill 管理插件 PRD](./PRD-Skill管理插件.md)：Skill 资产管理能力，与插件中心、业务插件和后续执行能力明确解耦，独立规划与验收。
