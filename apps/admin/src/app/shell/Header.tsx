import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import { MagneticButton } from "../../shared/components/MagneticButton";
import {
  IconCommand,
  IconChevronDown,
  IconChevronRight,
  IconLogout,
  IconSettings,
  IconActivity,
} from "../../shared/components/Icons";

export type HeaderVariant = "crystal" | "glass" | "transparent" | "floating";

export interface HeaderProps {
  /**
   * 视觉变体:
   * - "crystal" (默认推荐): 超白高透无界晶体 (彻底告别毛玻璃与磨砂模糊，超高透光率，双层镜面切角发丝高光与清澈底感)
   * - "glass": 兼容别名，映射为高透晶体质感
   * - "transparent": 纯透无界模式 (背景完全透明，极简发丝线，与页面背景融为一体)
   * - "floating": 浮岛高透模式 (悬浮胶囊形态，边缘留白内缩，带有晶体微反光与浮岛微影)
   */
  variant?: HeaderVariant;
  /**
   * 是否强制开启纯透明背景 (快捷参数，等价于 variant="transparent")
   */
  transparent?: boolean;
  /**
   * 模糊强度等级 (默认为 "none"，不使用任何毛玻璃模糊)
   */
  blur?: "none" | "subtle" | "base" | "heavy";
  /**
   * 是否显示底部发丝分割线 (默认为 true)
   */
  showBorder?: boolean;
  /**
   * 额外的 CSS 类名
   */
  className?: string;
  /**
   * 行内样式覆盖
   */
  style?: React.CSSProperties;
}

/**
 * Admin 管理控制台顶部高透明 Header 组件
 * 具备极高透光率与双层镜面切角发丝高光（告别毛玻璃磨砂模糊，超清透水漾晶体质感）
 * 严格保持 WCAG AA/AAA 对比度与全功能微交互
 */
export function Header({
  variant = "crystal",
  transparent = false,
  blur = "none",
  showBorder = true,
  className = "",
  style = {},
}: HeaderProps) {
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
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // 点击外部与按下 Escape 键自动收起用户菜单
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  const isPlatformAdmin = Boolean(user?.role?.includes("管理员"));

  // 面包屑标题映射
  const getBreadcrumb = () => {
    if (currentRoute === "/workspace") return activeView === "platform" ? "工作台 / 平台运维概览" : "工作台 / 业务概览";
    if (currentRoute.startsWith("/system/users") || currentRoute.startsWith("/system/invites"))
      return "用户管理 / 账号与企业邀请";
    if (currentRoute.startsWith("/my/plugins")) return "我的插件 / 启用与配置";
    if (currentRoute.startsWith("/skills")) return "Skill 管理 / 知识底座";
    if (currentRoute.startsWith("/platform/plugins")) return "平台插件管理 / 目录与引入";
    if (currentRoute.startsWith("/system/audit")) return "系统审计 / 分域操作追踪";
    if (currentRoute.startsWith("/settings")) return "系统设置 / 企业与个人偏好";
    return "管理后台";
  };

  const handleSwitchToBusiness = () => {
    if (activeView === "business") return;
    setActiveView("business");
    toast.info("已切换至「业务视图」：聚焦日常业务与个人管理");
    if (currentRoute.startsWith("/platform/plugins")) {
      navigate("/workspace");
    }
  };

  const handleSwitchToPlatform = () => {
    if (activeView === "platform") return;
    setActiveView("platform");
    toast.info("已切换至「平台管理」：已开启平台插件与底座治理");
    if (currentRoute === "/my/plugins") {
      navigate("/platform/plugins");
    }
  };

  // 决定实际使用的视觉变体
  const activeVariant: HeaderVariant = transparent ? "transparent" : variant;

  // 根据变体与模糊配置计算容器样式
  const getContainerStyles = (): React.CSSProperties => {
    const blurFilterMap: Record<string, string> = {
      none: "none",
      subtle: "blur(8px) saturate(140%)",
      base: "blur(16px) saturate(160%)",
      heavy: "blur(24px) saturate(180%)",
    };
    const activeBlur = blurFilterMap[blur] || "none";

    const baseStyles: React.CSSProperties = {
      position: "sticky",
      top: 0,
      zIndex: 50,
      height: "56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      transition: "all 200ms cubic-bezier(0.16, 1, 0.3, 1)",
    };

    if (activeVariant === "transparent") {
      return {
        ...baseStyles,
        backgroundColor: "transparent",
        backdropFilter: activeBlur,
        WebkitBackdropFilter: activeBlur,
        borderBottom: showBorder ? "1px solid rgba(226, 232, 240, 0.55)" : "none",
        boxShadow: "none",
      };
    }

    if (activeVariant === "floating") {
      return {
        ...baseStyles,
        margin: "0.5rem 1rem 0 1rem",
        borderRadius: "12px",
        height: "52px",
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.18) 100%)",
        backdropFilter: activeBlur,
        WebkitBackdropFilter: activeBlur,
        border: "1px solid rgba(226, 232, 240, 0.65)",
        boxShadow: "0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.45)",
      };
    }

    // 默认高透明晶体模式 (crystal 或 glass): 彻底告别毛玻璃，呈现高透光、切面双层发丝高光与极简微边界
    return {
      ...baseStyles,
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.14) 100%)",
      backdropFilter: activeBlur,
      WebkitBackdropFilter: activeBlur,
      borderBottom: showBorder ? "1px solid rgba(226, 232, 240, 0.6)" : "none",
      boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.45), 0 1px 2px rgba(15, 23, 42, 0.015)",
    };
  };

  return (
    <header
      className={`admin-top-header ${className}`}
      style={{
        ...getContainerStyles(),
        ...style,
      }}
    >
      {/* 左侧：实例 Logo 与面包屑导航 */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            padding: "0.25rem 0.375rem",
            borderRadius: "6px",
            transition: "background-color 150ms ease",
          }}
          className="hover:bg-zinc-100/50"
          onClick={() => navigate("/workspace")}
          title="返回工作台概览"
        >
          <img
            src="/logo.webp"
            alt="Modu Logo"
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              display: "block",
            }}
          />
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
              {currentCompany.name?.trim() ? (
                <>
                  <span style={{ color: "var(--zinc-400)", fontWeight: 400 }}>/</span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--zinc-700)" }}>
                    {currentCompany.name.trim()}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div
          style={{
            height: "16px",
            width: "1px",
            backgroundColor: "rgba(228, 228, 231, 0.8)",
            margin: "0 0.25rem",
          }}
        />

        <div style={{ fontSize: "0.8125rem", color: "var(--zinc-600)", fontWeight: 500 }}>
          {getBreadcrumb()}
        </div>
      </div>

      {/* 右侧：微透快捷指令药丸、视图切换与账号菜单 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* 1. Cmd+K 快捷指令药丸 (GSAP 磁力吸附 + 高透水漾晶体，彻底消除毛玻璃模糊) */}
        <MagneticButton
          onClick={() => setCmdKOpen(true)}
          strength={0.24}
          maxOffset={5}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.3125rem 0.625rem",
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            border: "1px solid rgba(226, 232, 240, 0.75)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(15, 23, 42, 0.02)",
            color: "var(--zinc-700)",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          className="hover:bg-white/80 hover:border-zinc-300 hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.97]"
          title="按下 Cmd+K 搜索页面或执行快捷指令"
        >
          <IconCommand size={13} />
          <span>快捷指令</span>
          <kbd
            style={{
              padding: "0.0625rem 0.25rem",
              borderRadius: "4px",
              backgroundColor: "rgba(241, 245, 249, 0.55)",
              border: "1px solid rgba(226, 232, 240, 0.8)",
              fontSize: "0.6875rem",
              color: "var(--zinc-500)",
              fontFamily: "monospace",
            }}
          >
            Cmd K
          </kbd>
        </MagneticButton>

        {/* 2. 视图切换药丸 (业务视图 / 平台管理视图 - 仅管理员可用，高透清澈底槽) */}
        {isPlatformAdmin && (
          <div
            style={{
              display: "inline-flex",
              backgroundColor: "rgba(241, 245, 249, 0.45)",
              padding: "2px",
              borderRadius: "6px",
              border: "1px solid rgba(226, 232, 240, 0.7)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            }}
          >
            <button
              onClick={handleSwitchToBusiness}
              className="hover:text-zinc-950 active:scale-[0.96]"
              title="切换至业务视图：聚焦日常业务、通用底座与个人配置"
              style={{
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: activeView === "business" ? 600 : 400,
                color: activeView === "business" ? "var(--brand-700)" : "var(--zinc-600)",
                backgroundColor: activeView === "business" ? "rgba(255, 255, 255, 0.92)" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: activeView === "business" ? "0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)" : "none",
                transition: "all 120ms ease",
              }}
            >
              业务视图
            </button>
            <button
              onClick={handleSwitchToPlatform}
              className="hover:text-zinc-950 active:scale-[0.96]"
              title="切换至平台管理：管理全平台插件、安装规范与运维审计"
              style={{
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: activeView === "platform" ? 600 : 400,
                color: activeView === "platform" ? "var(--brand-700)" : "var(--zinc-600)",
                backgroundColor: activeView === "platform" ? "rgba(255, 255, 255, 0.92)" : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: activeView === "platform" ? "0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)" : "none",
                transition: "all 120ms ease",
              }}
            >
              平台管理
            </button>
          </div>
        )}

        {/* 3. 账号信息与下拉菜单 */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            style={{
              padding: "0.25rem 0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "8px",
              backgroundColor: userMenuOpen ? "rgba(255, 255, 255, 0.75)" : "transparent",
              border: "1px solid",
              borderColor: userMenuOpen ? "rgba(226, 232, 240, 0.9)" : "transparent",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            className="hover:bg-white/70 hover:border-zinc-300 hover:shadow-xs hover:-translate-y-0.5 active:scale-[0.97]"
            title="点击展开账户管理与退出登录"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "rgba(226, 232, 240, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--zinc-700)",
                fontSize: "0.75rem",
                fontWeight: 600,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
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
            <IconChevronDown
              size={14}
              className={`text-zinc-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180 text-zinc-700" : ""}`}
            />
          </button>

          {/* 下拉面板 */}
          {userMenuOpen && (
            <div
              className="absolute top-[calc(100%+8px)] right-0 w-64 rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-200/90 shadow-elevation-3 p-2 z-[100] animate-in fade-in zoom-in-95 duration-150"
              style={{
                boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 8px 12px -6px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
              }}
            >
              {/* 用户信息卡片 */}
              <div className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100/90 mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                      {user?.displayName ? user.displayName.slice(0, 1) : "A"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-zinc-900 truncate">
                        {user?.displayName || "管理员"}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200/60 shrink-0">
                        {user?.role ? (user.role.length > 5 ? user.role.slice(0, 5) : user.role) : "管理员"}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5" title={user?.email}>
                      {user?.email || "liming@yourcompany.com"}
                    </div>
                  </div>
                </div>
              </div>

              {/* 操作菜单项列表 */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="group flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-150 cursor-pointer w-full text-left"
                >
                  <IconSettings size={15} className="text-zinc-400 group-hover:text-zinc-700 transition-colors shrink-0" />
                  <span className="flex-1">个人与企业设置</span>
                  <IconChevronRight size={13} className="text-zinc-400/70 group-hover:text-zinc-600 transition-colors shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/system/audit");
                  }}
                  className="group flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-150 cursor-pointer w-full text-left"
                >
                  <IconActivity size={15} className="text-zinc-400 group-hover:text-zinc-700 transition-colors shrink-0" />
                  <span className="flex-1">我的操作审计</span>
                  <IconChevronRight size={13} className="text-zinc-400/70 group-hover:text-zinc-600 transition-colors shrink-0" />
                </button>
              </div>

              {/* 分割线 */}
              <div className="h-px bg-zinc-100 my-1.5 mx-1" />

              {/* 退出登录 */}
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="group flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-150 cursor-pointer w-full text-left"
              >
                <IconLogout size={15} className="text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
                <span className="flex-1 font-semibold">退出登录</span>
                <span className="text-[10px] text-rose-400 group-hover:text-rose-500 font-normal">退出控制台</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
