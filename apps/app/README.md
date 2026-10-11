# Modu App

面向普通用户权限的 React Native + Expo + TypeScript 客户端脚手架，
不是移动管理后台。使用官方
`expo-template-blank-typescript@57.0.29` 初始化（Expo SDK 57）。
当前只有启动页，不包含路由、认证、后端请求或业务插件。

## 本地开发

在仓库根目录执行：

```bash
pnpm install:app
pnpm dev:app
```

使用支持 SDK 57 的 Expo Go 扫描终端二维码，手机与开发机需网络互通。
如 Expo Go 版本不匹配，使用兼容客户端或后续配置 development build。

也可从根目录直接启动目标平台：

```bash
pnpm ios:app      # 需要 macOS、Xcode 和已安装的 iOS Simulator
pnpm android:app  # 需要 Android SDK 和已启动的模拟器/已连接设备
pnpm web:app      # 浏览器预览，不替代真机测试
```

## 检查与导出

```bash
pnpm typecheck:app
pnpm lint:app
pnpm build:app
```

`build:app` 使用 `expo export` 导出 iOS / Android 的 JavaScript bundle 与资源到
本目录的 `dist/`，**不生成 APK、AAB 或 IPA**。
原生构建、签名与上架流程尚未配置。

## 目录与边界

- `index.ts`：注册 React Native 根组件。
- `App.tsx`：应用组合入口与最小启动页。
- `app.json`：应用名称、平台配置与静态资源引用。
- `assets/`：官方模板占位图标，正式发布前替换。
- `tsconfig.json`：继承 Expo 配置并开启严格类型检查。
- `eslint.config.js`：Expo ESLint flat config。

本目录独立维护依赖、pnpm 锁文件和工程配置，不依赖 web、admin 或根级共享包。
也可以直接在本目录执行 `pnpm install` 和 `pnpm dev`。保持 Metro 默认配置。

业务模块和插件放在 `src/modules/`，本客户端内共享的类型、API 适配层和逻辑
放在 `src/shared/`，不得跨端复用管理后台会话或权限。普通用户权限由 API 校验。
目前不生成或提交 `ios/`、`android/` 原生目录；需要原生构建时再按实际需求
配置 Expo Prebuild / development build。
