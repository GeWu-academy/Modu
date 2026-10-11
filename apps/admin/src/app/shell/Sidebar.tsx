import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../providers/AppContext";
import {
  IconDashboard,
  IconUsers,
  IconPuzzle,
  IconSparkles,
  IconShield,
  IconSettings,
  IconActivity,
  IconBookOpen,
  IconPlus,
  IconPanelLeft,
} from "../../shared/components/Icons";
import { gsap, GSAP_EASINGS, GSAP_DURATIONS, isPrefersReducedMotion } from "../../shared/animation/gsap";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  platformOnly?: boolean;
  disabled?: boolean;
}

interface NavGroupProps {
  title: string;
  items: NavItem[];
  currentRoute: string;
  navigate: (path: string) => void;
  isCollapsed: boolean;
}

/**
 * 带有平滑滚动与滑动高亮胶囊（Sliding Indicator Pill）的导航组组件
 * 点击或切换路由时，活动指示器以 Apple/Linear 级物理缓动平滑滑动至目标项，
 * 并在需要时将选中项平滑滚动进入视野。
 */
function NavGroup({ title, items, currentRoute, navigate, isCollapsed }: NavGroupProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const isItemActive = (item: NavItem) =>
    currentRoute === item.path ||
    (item.path !== "/workspace" && currentRoute.startsWith(item.path));

  useEffect(() => {
    const activeItem = items.find((item) => isItemActive(item));

    if (activeItem && buttonRefs.current[activeItem.id] && indicatorRef.current) {
      const btn = buttonRefs.current[activeItem.id]!;
      const targetTop = btn.offsetTop;
      const targetHeight = btn.offsetHeight;

      if (isPrefersReducedMotion()) {
        gsap.set(indicatorRef.current, {
          y: targetTop,
          height: targetHeight,
          opacity: 1,
        });
      } else {
        gsap.to(indicatorRef.current, {
          y: targetTop,
          height: targetHeight,
          opacity: 1,
          duration: GSAP_DURATIONS.normal,
          ease: GSAP_EASINGS.outExpo,
          force3D: true,
          overwrite: "auto",
        });
      }

      // 平滑滚动至视口内（容器出现纵向滚动条时触发）
      btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        opacity: 0,
        duration: GSAP_DURATIONS.fast,
        ease: GSAP_EASINGS.smooth,
        overwrite: "auto",
      });
    }
  }, [currentRoute, isCollapsed, items]);

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      {/* 分组标题（折叠状态下平滑收起） */}
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--zinc-400)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: isCollapsed ? "0 0.25rem 0.375rem 0.25rem" : "0 0.75rem 0.375rem 0.75rem",
          textAlign: isCollapsed ? "center" : "left",
          maxHeight: isCollapsed ? "0" : "24px",
          opacity: isCollapsed ? 0 : 1,
          overflow: "hidden",
          transition: "max-height 200ms ease, opacity 180ms ease, padding 200ms ease",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </div>

      {/* 相对定位导航列表容器与平滑移动高亮背景胶囊 */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {/* GSAP 硬件加速平滑滑动指示器 (Sliding Indicator Pill) */}
        <div
          ref={indicatorRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "34px",
            borderRadius: "6px",
            backgroundColor: "var(--brand-50)",
            border: "1px solid rgba(20, 122, 102, 0.18)",
            boxShadow: "0 1px 3px rgba(13, 92, 77, 0.05)",
            pointerEvents: "none",
            opacity: 0,
            zIndex: 0,
            willChange: "transform, height, opacity",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* 左侧翡翠冷杉微导轨高亮指示条 */}
          {!isCollapsed && (
            <div
              style={{
                width: "3px",
                height: "16px",
                backgroundColor: "var(--brand-600)",
                borderRadius: "2px",
                marginLeft: "3px",
              }}
            />
          )}
        </div>

        {items.map((item) => {
          const isActive = isItemActive(item);

          if (item.disabled) {
            return (
              <div
                key={item.id}
                title={isCollapsed ? `${item.label} (暂不可用)` : undefined}
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "space-between",
                  padding: isCollapsed ? "0.4375rem 0.25rem" : "0.4375rem 0.75rem",
                  borderRadius: "6px",
                  color: "var(--zinc-400)",
                  fontSize: "0.8125rem",
                  cursor: "not-allowed",
                  transition: "padding 200ms ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <span>{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
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
              ref={(el) => {
                buttonRefs.current[item.id] = el;
              }}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : undefined}
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between",
                padding: isCollapsed ? "0.4375rem 0.25rem" : "0.4375rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--brand-700)" : "var(--zinc-700)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "color 150ms ease, padding 200ms ease",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isCollapsed ? 0 : "0.625rem",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    color: isActive ? "var(--brand-600)" : "var(--zinc-500)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    maxWidth: isCollapsed ? 0 : "140px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    transition: "opacity 180ms ease, max-width 240ms ease",
                  }}
                >
                  {item.label}
                </span>
              </div>
              {!isCollapsed && item.badge && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    padding: "0.0625rem 0.375rem",
                    borderRadius: "9999px",
                    backgroundColor: "var(--zinc-100)",
                    color: "var(--zinc-600)",
                    flexShrink: 0,
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
}

export function Sidebar() {
  const { currentRoute, navigate, activeView, user } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      icon: <IconBookOpen size={16} />,
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

  return (
    <aside
      aria-label="侧边主导航栏"
      style={{
        width: isCollapsed ? "68px" : "232px",
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid var(--zinc-200)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: isCollapsed ? "1rem 0.5rem" : "1rem 0.75rem",
        height: "calc(100vh - 56px)",
        position: "sticky",
        top: "56px",
        overflowY: "auto",
        overflowX: "hidden",
        scrollBehavior: "smooth",
        transition: "width 280ms cubic-bezier(0.16, 1, 0.3, 1), padding 240ms ease",
      }}
    >
      <div>
        <NavGroup
          title="管理底座"
          items={mainNav}
          currentRoute={currentRoute}
          navigate={navigate}
          isCollapsed={isCollapsed}
        />

        {/* 平台管理专属组（仅在平台视图展示，或管理员可见） */}
        {(activeView === "platform" || user?.role.includes("管理员")) && (
          <NavGroup
            title="平台中心"
            items={platformNav}
            currentRoute={currentRoute}
            navigate={navigate}
            isCollapsed={isCollapsed}
          />
        )}

        {/* 业务扩展（真实空态原则） */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--zinc-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: isCollapsed ? "0 0.25rem 0.375rem 0.25rem" : "0 0.75rem 0.375rem 0.75rem",
              textAlign: isCollapsed ? "center" : "left",
              maxHeight: isCollapsed ? "0" : "24px",
              opacity: isCollapsed ? 0 : 1,
              overflow: "hidden",
              transition: "max-height 200ms ease, opacity 180ms ease, padding 200ms ease",
              whiteSpace: "nowrap",
            }}
          >
            业务扩展
          </div>
          <div
            onClick={() => navigate("/my/plugins")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "space-between",
              padding: isCollapsed ? "0.4375rem 0.25rem" : "0.4375rem 0.75rem",
              borderRadius: "6px",
              color: "var(--zinc-400)",
              fontSize: "0.8125rem",
              backgroundColor: "var(--zinc-50)",
              border: "1px dashed var(--zinc-200)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            title={
              isCollapsed
                ? "业务扩展：暂无业务表单，点击引入"
                : "底座未预置行业表单，点击前往插件中心启用"
            }
          >
            {isCollapsed ? (
              <span style={{ color: "var(--brand-600)" }}>
                <IconPlus size={16} />
              </span>
            ) : (
              <>
                <span style={{ fontSize: "0.75rem" }}>暂无业务表单</span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--brand-600)",
                    fontWeight: 500,
                  }}
                >
                  按需引入
                </span>
              </>
            )}
          </div>
        </div>

        <NavGroup
          title="偏好与安全"
          items={systemNav}
          currentRoute={currentRoute}
          navigate={navigate}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* 底部：自部署实例说明与折叠切换按钮 */}
      <div>
        {isCollapsed ? (
          <div
            title="自托管实例主权 · 单租户本地部署模式，数据 100% 独享隔离"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.5rem",
              borderRadius: "8px",
              backgroundColor: "var(--zinc-50)",
              border: "1px solid var(--zinc-200)",
              color: "var(--brand-700)",
              cursor: "default",
            }}
          >
            <IconShield size={16} />
          </div>
        ) : (
          <div
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              backgroundColor: "var(--zinc-50)",
              border: "1px solid var(--zinc-200)",
              fontSize: "0.75rem",
              color: "var(--zinc-500)",
              transition: "opacity 200ms ease",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--zinc-800)", marginBottom: "2px" }}>
              自托管实例主权
            </div>
            <div>单租户本地部署模式，数据 100% 独享隔离。</div>
          </div>
        )}

        {/* 侧边栏折叠/展开平滑切换控制按钮 */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="btn-ghost"
          title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: "0.625rem",
            padding: isCollapsed ? "0.5rem 0.25rem" : "0.5rem 0.75rem",
            borderRadius: "6px",
            fontSize: "0.8125rem",
            color: "var(--zinc-500)",
            cursor: "pointer",
            border: "none",
            backgroundColor: "transparent",
            marginTop: "0.5rem",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--zinc-100)";
            e.currentTarget.style.color = "var(--zinc-900)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--zinc-500)";
          }}
        >
          <span
            style={{
              display: "inline-flex",
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <IconPanelLeft size={16} />
          </span>
          {!isCollapsed && <span>收起侧边栏</span>}
        </button>
      </div>
    </aside>
  );
}
