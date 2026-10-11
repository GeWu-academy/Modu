import React from "react";
import { useApp } from "../providers/AppContext";
import { Header } from "../shell/Header";
import { Sidebar } from "../shell/Sidebar";
import { CommandPalette } from "../shell/CommandPalette";

import { PageTransition } from "../../shared/components/PageTransition";

// 页面组件
import { AuthCenter } from "../../platform/auth/AuthCenter";
import { Workspace } from "../../platform/workspace/Workspace";
import { UsersView } from "../../platform/users/UsersView";
import { MyPluginsView } from "../../platform/my-plugins/MyPluginsView";
import { PlatformPluginsView } from "../../platform/plugin-management/PlatformPluginsView";
import { PluginInstallGuide } from "../../platform/plugin-management/PluginInstallGuide";
import { SkillsView } from "../../modules/skills/SkillsView";
import { SkillImportView } from "../../modules/skills/SkillImportView";
import { AuditView } from "../../platform/audit/AuditView";
import { SettingsView } from "../../platform/settings/SettingsView";

export function AppRouter() {
  const { user, currentRoute } = useApp();
  const mainScrollRef = React.useRef<HTMLElement | null>(null);

  // 侧边栏/路由切换时，主内容视口平滑滚动回顶部
  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentRoute]);

  // 1. 检查邀请专属落地页 /invite/:token
  if (currentRoute.startsWith("/invite/")) {
    const token = currentRoute.replace("/invite/", "");
    return <AuthCenter initialInviteToken={token} />;
  }

  // 2. 未登录守卫：如果未登录且访问受保护页面，统一渲染认证中心
  if (!user || currentRoute === "/login") {
    return <AuthCenter />;
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
          className="flex-1 overflow-y-auto min-w-0 bg-zinc-50 scroll-smooth"
        >
          {renderCurrentPage()}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
