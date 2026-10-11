import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  platformOnly?: boolean;
  disabled?: boolean;
}

const MAIN_NAV: NavItem[] = [
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

const PLATFORM_NAV: NavItem[] = [
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

const SYSTEM_NAV: NavItem[] = [
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

/**
 * 精确计算全局唯一的激活项 ID
 * 避免前缀包含关系（如 /platform/plugins 与 /platform/plugins/install）导致多个激活项无法卸载
 */
function getActiveItemId(route: string, items: NavItem[]): string | null {
  if (!route) return "workspace";

  // 1. 优先完全一致匹配
  const exact = items.find((item) => item.path === route);
  if (exact) return exact.id;

  // 2. 特殊子路由定向映射
  if (route.startsWith("/system/users") || route.startsWith("/system/invites")) {
    return "users";
  }
  if (route.startsWith("/skills")) {
    return "skills";
  }
  if (route.startsWith("/my/plugins")) {
    return "my-plugins";
  }
  if (route === "/platform/plugins/install") {
    return "plugins-install";
  }
  if (route.startsWith("/platform/plugins")) {
    return "platform-plugins";
  }
  if (route.startsWith("/system/audit")) {
    return "audit";
  }
  if (route.startsWith("/settings")) {
    return "settings";
  }
  if (route === "/workspace" || route === "/" || route === "") {
    return "workspace";
  }

  // 3. 兜底最长前缀匹配
  const prefixMatches = items
    .filter((item) => item.path !== "/workspace" && route.startsWith(item.path + "/"))
    .sort((a, b) => b.path.length - a.path.length);

  if (prefixMatches.length > 0) {
    return prefixMatches[0].id;
  }

  return null;
}

export function Sidebar() {
  const { currentRoute, navigate, activeView, user } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const asideRef = useRef<HTMLElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevActiveIdRef = useRef<string | null>(null);

  // 汇总所有当前可视的导航项
  const showPlatform = activeView === "platform" || Boolean(user?.role.includes("管理员"));
  const allNavItems = useMemo(() => {
    return [...MAIN_NAV, ...(showPlatform ? PLATFORM_NAV : []), ...SYSTEM_NAV];
  }, [showPlatform]);

  // 全局唯一激活项 ID（严格单一映射，彻底杜绝激活状态未卸载）
  const activeItemId = useMemo(() => {
    return getActiveItemId(currentRoute, allNavItems);
  }, [currentRoute, allNavItems]);

  // 指示器精确对齐计算函数
  const syncIndicator = useCallback(
    (immediate = false) => {
      const indicator = indicatorRef.current;
      const navContainer = navContainerRef.current;
      if (!indicator || !navContainer) return;

      if (activeItemId && buttonRefs.current[activeItemId]) {
        const activeBtn = buttonRefs.current[activeItemId]!;
        const btnRect = activeBtn.getBoundingClientRect();
        const containerRect = navContainer.getBoundingClientRect();
        const targetTop = btnRect.top - containerRect.top + navContainer.scrollTop;
        const targetHeight = btnRect.height;

        if (immediate || isPrefersReducedMotion()) {
          gsap.killTweensOf(indicator);
          gsap.set(indicator, {
            y: targetTop,
            height: targetHeight,
            opacity: 1,
          });
        } else {
          gsap.to(indicator, {
            y: targetTop,
            height: targetHeight,
            opacity: 1,
            duration: GSAP_DURATIONS.normal,
            ease: GSAP_EASINGS.outExpo,
            force3D: true,
            overwrite: "auto",
          });
        }
      } else {
        gsap.to(indicator, {
          opacity: 0,
          duration: GSAP_DURATIONS.fast,
          ease: GSAP_EASINGS.smooth,
          overwrite: "auto",
        });
      }
    },
    [activeItemId]
  );

  // 1. 当激活菜单项发生改变时，平滑滑动定位；仅在真正切换路由且内容溢出装不下时将目标菜单滚动入视口
  useEffect(() => {
    syncIndicator(false);

    if (activeItemId && activeItemId !== prevActiveIdRef.current) {
      const isInitialMount = prevActiveIdRef.current === null;
      prevActiveIdRef.current = activeItemId;
      const activeBtn = buttonRefs.current[activeItemId];
      if (activeBtn && !isInitialMount) {
        const navContainer = navContainerRef.current;
        if (navContainer && navContainer.scrollHeight > navContainer.clientHeight) {
          activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  }, [activeItemId, syncIndicator]);

  // 2. 当侧边栏收起/展开时，在 CSS 过渡期间启动 requestAnimationFrame 持续帧同步，彻底消除几何偏移
  useEffect(() => {
    let rafId: number;
    const startTime = performance.now();
    const transitionDuration = 360;

    const frameTick = (now: number) => {
      syncIndicator(true);
      if (now - startTime < transitionDuration) {
        rafId = requestAnimationFrame(frameTick);
      } else {
        syncIndicator(true);
      }
    };

    rafId = requestAnimationFrame(frameTick);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isCollapsed, syncIndicator]);

  // 3. 监听侧边栏 transitionend，确保 CSS 动画结束瞬间 100% 精确对齐
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target === aside) {
        syncIndicator(true);
      }
    };

    aside.addEventListener("transitionend", handleTransitionEnd);
    return () => {
      aside.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [syncIndicator]);

  // 4. 监听容器与视口尺寸变化（ResizeObserver 与 window resize）
  useEffect(() => {
    const navContainer = navContainerRef.current;
    const aside = asideRef.current;
    if (!navContainer || !aside) return;

    const handleResize = () => {
      syncIndicator(true);
    };

    window.addEventListener("resize", handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        syncIndicator(true);
      });
      ro.observe(navContainer);
      ro.observe(aside);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro) {
        ro.disconnect();
      }
    };
  }, [syncIndicator]);

  // 卸载时清理 GSAP 补间
  useEffect(() => {
    return () => {
      if (indicatorRef.current) {
        gsap.killTweensOf(indicatorRef.current);
      }
    };
  }, []);

  const renderNavGroup = (title: string, items: NavItem[]) => {
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
            padding: isCollapsed ? "0" : "0 0.75rem 0.375rem 0.75rem",
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

        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item) => {
            const isActive = item.id === activeItemId;

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
                className={`group relative z-[1] w-full flex items-center ${
                  isCollapsed ? "justify-center px-1 py-1.5" : "justify-between px-3 py-1.5"
                } rounded-md text-[0.8125rem] text-left border-0 cursor-pointer transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? "font-semibold text-brand-700 bg-transparent"
                    : "font-medium text-zinc-700 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 hover:translate-x-0.5 active:bg-zinc-200/70"
                }`}
                style={{
                  backgroundColor: "transparent",
                  color: isActive ? "var(--brand-700)" : undefined,
                  fontWeight: isActive ? 600 : 500,
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
                    className="group-hover:scale-110"
                    style={{
                      color: isActive ? "var(--brand-600)" : "var(--zinc-500)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "color 150ms ease, transform 150ms ease",
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
  };

  return (
    <aside
      ref={asideRef}
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
      {/* 相对定位的导航主容器：承载全局唯一的 GSAP 平滑滑动高亮胶囊 */}
      <div
        ref={navContainerRef}
        style={{
          position: "relative",
          minHeight: "100%",
        }}
      >
        {/* 全侧边栏唯一 GSAP 平滑滑动指示器 (Single Global Sliding Indicator) */}
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
            backgroundColor: "rgba(37, 99, 235, 0.05)",
            border: "1px solid rgba(37, 99, 235, 0.12)",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            pointerEvents: "none",
            opacity: 0,
            zIndex: 0,
            willChange: "transform, height, opacity",
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* 左侧极简烟波蓝微导轨高亮指示条 */}
          {!isCollapsed && (
            <div
              style={{
                width: "2.5px",
                height: "16px",
                backgroundColor: "var(--brand-600)",
                borderRadius: "2px",
                marginLeft: "3px",
              }}
            />
          )}
        </div>

        {renderNavGroup("管理底座", MAIN_NAV)}

        {/* 平台管理专属组（仅在平台视图展示，或管理员可见） */}
        {showPlatform && renderNavGroup("平台中心", PLATFORM_NAV)}

        {/* 业务扩展（真实空态原则） */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--zinc-400)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: isCollapsed ? "0" : "0 0.75rem 0.375rem 0.75rem",
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

        {renderNavGroup("偏好与安全", SYSTEM_NAV)}
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
          className="btn-ghost active:scale-[0.97]"
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
