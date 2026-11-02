import React from "react";
import { useApp } from "../providers/AppContext";
import { Header } from "../shell/Header";
import { Sidebar } from "../shell/Sidebar";
import { CommandPalette } from "../shell/CommandPalette";

import { PageTransition } from "../../shared/components/PageTransition";
import { ModuleSkeletonRouter } from "../../shared/components/ModuleSkeletons";

// 页面组件按需代码分割懒加载
const AuthCenter = React.lazy(() => import("../../platform/auth/AuthCenter").then((m) => ({ default: m.AuthCenter })));
const Workspace = React.lazy(() => import("../../platform/workspace/Workspace").then((m) => ({ default: m.Workspace })));
const UsersView = React.lazy(() => import("../../platform/users/UsersView").then((m) => ({ default: m.UsersView })));
const MyPluginsView = React.lazy(() => import("../../platform/my-plugins/MyPluginsView").then((m) => ({ default: m.MyPluginsView })));
const PlatformPluginsView = React.lazy(() => import("../../platform/plugin-management/PlatformPluginsView").then((m) => ({ default: m.PlatformPluginsView })));
const PluginInstallGuide = React.lazy(() => import("../../platform/plugin-management/PluginInstallGuide").then((m) => ({ default: m.PluginInstallGuide })));
const SkillsView = React.lazy(() => import("../../modules/skills/SkillsView").then((m) => ({ default: m.SkillsView })));
const SkillImportView = React.lazy(() => import("../../modules/skills/SkillImportView").then((m) => ({ default: m.SkillImportView })));
const AuditView = React.lazy(() => import("../../platform/audit/AuditView").then((m) => ({ default: m.AuditView })));
const SettingsView = React.lazy(() => import("../../platform/settings/SettingsView").then((m) => ({ default: m.SettingsView })));

export function AppRouter() {
  const { user, currentRoute } = useApp();
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  // 侧边栏/模块切换时，主内容视口立即重置回顶部，消除与切页动效并发的滚动抖动
  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [currentRoute]);

  // 1. 检查邀请专属落地页 /invite/:token
  if (currentRoute.startsWith("/invite/")) {
    const token = currentRoute.replace("/invite/", "");
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
        <AuthCenter initialInviteToken={token} />
      </React.Suspense>
    );
  }

  // 2. 未登录守卫：如果未登录且访问受保护页面，统一渲染认证中心
  if (!user || currentRoute === "/login") {
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
        <AuthCenter />
      </React.Suspense>
    );
  }

  // 3. 登录态下的主应用外壳与内容路由
  const renderCurrentPage = () => {
    let content: React.ReactNode = <Workspace />;

    if (currentRoute === "/workspace") content = <Workspace />;
    else if (currentRoute === "/system/users") content = <UsersView initialTab="users" />;
    else if (currentRoute === "/system/invites") content = <UsersView initialTab="invites" />;
    else if (currentRoute.startsWith("/my/plugins")) content = <MyPluginsView />;
    else if (currentRoute === "/platform/plugins") content = <PlatformPluginsView />;
    else if (currentRoute === "/platform/plugins/install") content = <PluginInstallGuide />;
    else if (currentRoute === "/skills") content = <SkillsView />;
    else if (currentRoute === "/skills/import") content = <SkillImportView />;
    else if (currentRoute === "/system/audit") content = <AuditView />;
    else if (currentRoute === "/settings") content = <SettingsView />;

    return <PageTransition routeKey={currentRoute}>{content}</PageTransition>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto min-w-0 bg-zinc-50"
        >
          <React.Suspense fallback={<ModuleSkeletonRouter routeKey={currentRoute} />}>
            {renderCurrentPage()}
          </React.Suspense>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
