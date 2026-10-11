import React from "react";
import { useApp } from "../providers/AppContext";
import { Header } from "../shell/Header";
import { Sidebar } from "../shell/Sidebar";
import { CommandPalette } from "../shell/CommandPalette";

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
    if (currentRoute === "/workspace") return <Workspace />;
    if (currentRoute === "/system/users") return <UsersView initialTab="users" />;
    if (currentRoute === "/system/invites") return <UsersView initialTab="invites" />;
    if (currentRoute.startsWith("/my/plugins")) return <MyPluginsView />;
    if (currentRoute === "/platform/plugins") return <PlatformPluginsView />;
    if (currentRoute === "/platform/plugins/install") return <PluginInstallGuide />;
    if (currentRoute === "/skills") return <SkillsView />;
    if (currentRoute === "/skills/import") return <SkillImportView />;
    if (currentRoute === "/system/audit") return <AuditView />;
    if (currentRoute === "/settings") return <SettingsView />;

    // 默认回退到工作台
    return <Workspace />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-w-0 bg-zinc-50">
          {renderCurrentPage()}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
