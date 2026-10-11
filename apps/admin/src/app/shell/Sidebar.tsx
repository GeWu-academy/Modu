import React from "react";
import { useApp } from "../providers/AppContext";
import {
  IconDashboard,
  IconUsers,
  IconPuzzle,
  IconSparkles,
  IconShield,
  IconSettings,
  IconActivity,
  IconBuilding,
  IconFileText,
  IconPlus,
} from "../../shared/components/Icons";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  platformOnly?: boolean;
  disabled?: boolean;
}

export function Sidebar() {
  const { currentRoute, navigate, activeView, user } = useApp();

  const mainNav: NavItem[] = [
    {
      id: "workspace",
      label: "工作台",
      path: "/workspace",
      icon: <IconDashboard size={16} />,
    },
    {
      id: "users",
      label: "用户管理",
      path: "/system/users",
      icon: <IconUsers size={16} />,
    },
    {
      id: "my-plugins",
      label: "我的插件",
      path: "/my/plugins",
      icon: <IconPuzzle size={16} />,
    },
    {
      id: "skills",
      label: "Skill 管理",
      path: "/skills",
      icon: <IconSparkles size={16} />,
    },
  ];

  const platformNav: NavItem[] = [
    {
      id: "platform-plugins",
      label: "平台插件管理",
      path: "/platform/plugins",
      icon: <IconShield size={16} />,
      platformOnly: true,
    },
    {
      id: "plugins-install",
      label: "插件引入说明",
      path: "/platform/plugins/install",
      icon: <IconFileText size={16} />,
      platformOnly: true,
    },
  ];

  const systemNav: NavItem[] = [
    {
      id: "audit",
      label: "分域操作审计",
      path: "/system/audit",
      icon: <IconActivity size={16} />,
    },
    {
      id: "settings",
      label: "系统与企业设置",
      path: "/settings",
      icon: <IconSettings size={16} />,
    },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => {
    return (
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--zinc-400)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "0 0.75rem 0.375rem 0.75rem",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item) => {
            const isActive =
              currentRoute === item.path ||
              (item.path !== "/workspace" && currentRoute.startsWith(item.path));

            if (item.disabled) {
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.4375rem 0.75rem",
                    borderRadius: "6px",
                    color: "var(--zinc-400)",
                    fontSize: "0.8125rem",
                    cursor: "not-allowed",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.0625rem 0.375rem",
                        borderRadius: "9999px",
                        backgroundColor: "var(--zinc-100)",
                        color: "var(--zinc-400)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.4375rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--brand-700)" : "var(--zinc-700)",
                  backgroundColor: isActive ? "var(--brand-50)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "var(--zinc-100)";
                    e.currentTarget.style.color = "var(--zinc-900)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--zinc-700)";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span style={{ color: isActive ? "var(--brand-600)" : "var(--zinc-500)" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.0625rem 0.375rem",
                      borderRadius: "9999px",
                      backgroundColor: "var(--zinc-100)",
                      color: "var(--zinc-600)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      style={{
        width: "232px",
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid var(--zinc-200)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1rem 0.75rem",
        height: "calc(100vh - 56px)",
        position: "sticky",
        top: "56px",
        overflowY: "auto",
      }}
    >
      <div>
        {renderNavGroup("管理底座", mainNav)}

        {/* 平台管理专属组（仅在平台视图展示，或管理员可见） */}
        {(activeView === "platform" || user?.role.includes("管理员")) &&
          renderNavGroup("平台中心", platformNav)}

        {/* 业务扩展（真实空态原则） */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--zinc-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "0 0.75rem 0.375rem 0.75rem",
            }}
          >
            业务扩展
          </div>
          <div
            onClick={() => navigate("/my/plugins")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.4375rem 0.75rem",
              borderRadius: "6px",
              color: "var(--zinc-400)",
              fontSize: "0.8125rem",
              backgroundColor: "var(--zinc-50)",
              border: "1px dashed var(--zinc-200)",
              cursor: "pointer",
            }}
            title="底座未预置行业表单，点击前往插件中心启用"
          >
            <span style={{ fontSize: "0.75rem" }}>暂无业务表单</span>
            <span style={{ fontSize: "0.6875rem", color: "var(--brand-600)", fontWeight: 500 }}>
              按需引入
            </span>
          </div>
        </div>

        {renderNavGroup("偏好与安全", systemNav)}
      </div>

      {/* 底部：自部署实例说明 */}
      <div
        style={{
          padding: "0.75rem",
          borderRadius: "8px",
          backgroundColor: "var(--zinc-50)",
          border: "1px solid var(--zinc-200)",
          fontSize: "0.75rem",
          color: "var(--zinc-500)",
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--zinc-800)", marginBottom: "2px" }}>
          自托管实例主权
        </div>
        <div>单租户本地部署模式，数据 100% 独享隔离。</div>
      </div>
    </aside>
  );
}
