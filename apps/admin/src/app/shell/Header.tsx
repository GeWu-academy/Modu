import React, { useState } from "react";
import { useApp } from "../providers/AppContext";
import { MagneticButton } from "../../shared/components/MagneticButton";
import {
  IconBuilding,
  IconCommand,
  IconUser,
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconShield,
  IconActivity,
} from "../../shared/components/Icons";

export function Header() {
  const {
    user,
    currentCompany,
    activeView,
    setActiveView,
    logout,
    navigate,
    currentRoute,
    setCmdKOpen,
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // 面包屑标题映射
  const getBreadcrumb = () => {
    if (currentRoute === "/workspace") return "工作台 / 概览";
    if (currentRoute.startsWith("/system/users") || currentRoute.startsWith("/system/invites"))
      return "用户管理 / 账号与企业邀请";
    if (currentRoute.startsWith("/my/plugins")) return "我的插件 / 启用与配置";
    if (currentRoute.startsWith("/skills")) return "Skill 管理 / 知识底座";
    if (currentRoute.startsWith("/platform/plugins")) return "平台插件管理 / 目录与引入";
    if (currentRoute.startsWith("/system/audit")) return "系统审计 / 分域操作追踪";
    if (currentRoute.startsWith("/settings")) return "系统设置 / 企业与个人偏好";
    return "管理后台";
  };

  return (
    <header
      className="glass-base"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        borderBottom: "1px solid var(--glass-border-base)",
      }}
    >
      {/* 左侧：实例 Logo 与面包屑 */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
          onClick={() => navigate("/workspace")}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "var(--brand-600)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
              boxShadow: "0 1px 2px rgba(13, 92, 77, 0.2)",
            }}
          >
            M
          </div>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--zinc-950)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              <span>Modu</span>
              <span style={{ color: "var(--zinc-400)", fontWeight: 400 }}>/</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--zinc-700)" }}>
                {currentCompany.name}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            height: "16px",
            width: "1px",
            backgroundColor: "var(--zinc-200)",
            margin: "0 0.25rem",
          }}
        />

        <div style={{ fontSize: "0.8125rem", color: "var(--zinc-500)", fontWeight: 500 }}>
          {getBreadcrumb()}
        </div>
      </div>

      {/* 右侧：微透药丸指令胶囊、状态胶囊、视图切换与账号菜单 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* 1. Cmd+K 快捷指令药丸 (GSAP 磁力吸附) */}
        <MagneticButton
          onClick={() => setCmdKOpen(true)}
          className="glass-subtle"
          strength={0.24}
          maxOffset={5}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3125rem 0.625rem",
            borderRadius: "9999px",
            border: "1px solid var(--zinc-200)",
            color: "var(--zinc-600)",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "border-color 120ms ease, background-color 120ms ease",
          }}
          title="按下 Cmd+K 搜索页面或执行快捷指令"
        >
          <IconCommand size={13} />
          <span>快捷指令</span>
          <kbd
            style={{
              padding: "0.0625rem 0.25rem",
              borderRadius: "4px",
              backgroundColor: "var(--zinc-100)",
              border: "1px solid var(--zinc-300)",
              fontSize: "0.6875rem",
              color: "var(--zinc-500)",
              fontFamily: "monospace",
            }}
          >
            Cmd K
          </kbd>
        </MagneticButton>

        {/* 2. 企业节点状态晶透胶囊 */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.25rem 0.625rem",
            borderRadius: "9999px",
            backgroundColor: "rgba(240, 253, 244, 0.7)",
            border: "1px solid rgba(187, 247, 208, 0.8)",
            color: "var(--brand-700)",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <span className="pulse-green" />
          <span>{currentCompany.status}</span>
        </div>

        {/* 3. 视图切换药丸 (业务视图 / 平台管理视图) */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "var(--zinc-100)",
            padding: "2px",
            borderRadius: "6px",
            border: "1px solid var(--zinc-200)",
          }}
        >
          <button
            onClick={() => setActiveView("business")}
            style={{
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: activeView === "business" ? 600 : 400,
              color: activeView === "business" ? "var(--brand-700)" : "var(--zinc-600)",
              backgroundColor: activeView === "business" ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: activeView === "business" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              transition: "all 120ms ease",
            }}
          >
            业务视图
          </button>
          <button
            onClick={() => setActiveView("platform")}
            style={{
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: activeView === "platform" ? 600 : 400,
              color: activeView === "platform" ? "var(--brand-700)" : "var(--zinc-600)",
              backgroundColor: activeView === "platform" ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: activeView === "platform" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              transition: "all 120ms ease",
            }}
          >
            平台管理
          </button>
        </div>

        {/* 4. 账号信息与下拉菜单 */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="btn-ghost"
            style={{
              padding: "0.25rem 0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "var(--zinc-200)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--zinc-700)",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {user?.displayName ? user.displayName.slice(0, 1) : "A"}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--zinc-900)" }}>
                {user?.displayName || "管理员"}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--zinc-500)" }}>
                {user?.role || "访客"}
              </div>
            </div>
            <IconChevronDown size={14} className="text-zinc-400" />
          </button>

          {/* 下拉面板 */}
          {userMenuOpen && (
            <div
              className="glass-heavy"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: "220px",
                borderRadius: "8px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--zinc-200)",
                boxShadow: "var(--shadow-elevation-3)",
                padding: "0.375rem",
                zIndex: 100,
                animation: "fadeIn 120ms ease",
              }}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div
                style={{
                  padding: "0.5rem 0.625rem",
                  borderBottom: "1px solid var(--zinc-100)",
                  marginBottom: "0.25rem",
                }}
              >
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  {user?.displayName}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                  {user?.email}
                </div>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/settings");
                }}
                className="btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: "0.8125rem",
                  padding: "0.375rem 0.625rem",
                  borderRadius: "4px",
                }}
              >
                <IconSettings size={14} />
                <span>个人与企业设置</span>
              </button>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate("/system/audit");
                }}
                className="btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: "0.8125rem",
                  padding: "0.375rem 0.625rem",
                  borderRadius: "4px",
                }}
              >
                <IconActivity size={14} />
                <span>我的操作审计</span>
              </button>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--zinc-100)",
                  margin: "0.25rem 0",
                }}
              />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="btn-ghost"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  fontSize: "0.8125rem",
                  padding: "0.375rem 0.625rem",
                  borderRadius: "4px",
                  color: "var(--semantic-danger-fg)",
                }}
              >
                <IconLogout size={14} />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
