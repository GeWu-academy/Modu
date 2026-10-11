import React, { useState } from "react";
import { useApp } from "../providers/AppContext";
import { MagneticButton } from "../../shared/components/MagneticButton";
import {
  IconCommand,
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconActivity,
} from "../../shared/components/Icons";

export type HeaderVariant = "glass" | "transparent" | "floating";

export interface HeaderProps {
  /**
   * 视觉变体:
   * - "glass" (默认): 高透液态微晶磨砂 (晶莹通透，增强模糊、发丝镜面高光与微透底色)
   * - "transparent": 纯透无界模式 (背景完全透明，极简发丝线，与页面背景无缝一体)
   * - "floating": 浮岛微透模式 (悬浮胶囊形态，边缘留白内缩，带有优雅立体漫射光)
   */
  variant?: HeaderVariant;
  /**
   * 是否强制开启纯透明背景 (快捷参数，等价于 variant="transparent")
   */
  transparent?: boolean;
  /**
   * 模糊强度等级
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
 * Admin 管理控制台顶部透明 Header 组件
 * 支持高透微晶磨砂 (glass)、纯透无界 (transparent) 及浮岛微透 (floating) 多种形态
 * 严格保持 WCAG AA/AAA 对比度与全功能微交互
 */
export function Header({
  variant = "glass",
  transparent = false,
  blur = "base",
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

  // 决定实际使用的视觉变体
  const activeVariant: HeaderVariant = transparent ? "transparent" : variant;

  // 根据变体与模糊配置计算容器样式
  const getContainerStyles = (): React.CSSProperties => {
    const blurFilterMap = {
      none: "none",
      subtle: "blur(8px) saturate(160%)",
      base: "blur(16px) saturate(190%)",
      heavy: "blur(24px) saturate(200%)",
    };
    const activeBlur = blurFilterMap[blur] || blurFilterMap.base;

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
        backdropFilter: blur === "none" ? "none" : "blur(6px) saturate(140%)",
        WebkitBackdropFilter: blur === "none" ? "none" : "blur(6px) saturate(140%)",
        borderBottom: showBorder ? "1px solid rgba(228, 228, 231, 0.45)" : "none",
        boxShadow: "none",
      };
    }

    if (activeVariant === "floating") {
      return {
        ...baseStyles,
        margin: "0.5rem 1rem 0 1rem",
        borderRadius: "12px",
        height: "52px",
        backgroundColor: "rgba(255, 255, 255, 0.65)",
        backdropFilter: activeBlur,
        WebkitBackdropFilter: activeBlur,
        border: "1px solid rgba(228, 228, 231, 0.65)",
        boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
      };
    }

    // 默认 "glass"：精工高透液态微晶磨砂
    return {
      ...baseStyles,
      backgroundColor: "rgba(255, 255, 255, 0.52)",
      backdropFilter: activeBlur,
      WebkitBackdropFilter: activeBlur,
      borderBottom: showBorder ? "1px solid rgba(228, 228, 231, 0.55)" : "none",
      boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.65), 0 1px 3px rgba(0, 0, 0, 0.02)",
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
            backgroundColor: "rgba(228, 228, 231, 0.8)",
            margin: "0 0.25rem",
          }}
        />

        <div style={{ fontSize: "0.8125rem", color: "var(--zinc-600)", fontWeight: 500 }}>
          {getBreadcrumb()}
        </div>
      </div>

      {/* 右侧：微透快捷药丸、状态胶囊、视图切换与账号菜单 */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* 1. Cmd+K 快捷指令药丸 (GSAP 磁力吸附 + 微透晶体) */}
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
            backgroundColor: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(228, 228, 231, 0.65)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.02)",
            color: "var(--zinc-700)",
            fontSize: "0.75rem",
            cursor: "pointer",
            transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
          }}
          className="hover:bg-white/80 hover:border-zinc-300"
          title="按下 Cmd+K 搜索页面或执行快捷指令"
        >
          <IconCommand size={13} />
          <span>快捷指令</span>
          <kbd
            style={{
              padding: "0.0625rem 0.25rem",
              borderRadius: "4px",
              backgroundColor: "rgba(244, 244, 245, 0.75)",
              border: "1px solid rgba(228, 228, 231, 0.8)",
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
            backgroundColor: "rgba(240, 253, 244, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(187, 247, 208, 0.8)",
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            color: "var(--brand-700)",
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        >
          <span className="pulse-green" />
          <span>{currentCompany.status}</span>
        </div>

        {/* 3. 视图切换药丸 (业务视图 / 平台管理视图 - 微透滑块底槽) */}
        <div
          style={{
            display: "inline-flex",
            backgroundColor: "rgba(244, 244, 245, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            padding: "2px",
            borderRadius: "6px",
            border: "1px solid rgba(228, 228, 231, 0.65)",
          }}
        >
          <button
            onClick={() => setActiveView("business")}
            style={{
              padding: "0.2rem 0.5rem",
              fontSize: "0.75rem",
              fontWeight: activeView === "business" ? 600 : 400,
              color: activeView === "business" ? "var(--brand-700)" : "var(--zinc-600)",
              backgroundColor: activeView === "business" ? "rgba(255, 255, 255, 0.92)" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: activeView === "business" ? "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)" : "none",
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
              backgroundColor: activeView === "platform" ? "rgba(255, 255, 255, 0.92)" : "transparent",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: activeView === "platform" ? "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)" : "none",
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
            style={{
              padding: "0.25rem 0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "6px",
              backgroundColor: userMenuOpen ? "rgba(255, 255, 255, 0.65)" : "transparent",
              border: "1px solid",
              borderColor: userMenuOpen ? "rgba(228, 228, 231, 0.8)" : "transparent",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            className="hover:bg-white/60 hover:border-zinc-200"
          >
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: "rgba(228, 228, 231, 0.8)",
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
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: "220px",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.94)",
                backdropFilter: "blur(20px) saturate(200%)",
                WebkitBackdropFilter: "blur(20px) saturate(200%)",
                border: "1px solid rgba(228, 228, 231, 0.85)",
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
