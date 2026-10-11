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
import { NodeStatusCapsule } from "../../shared/components/StatusIndicator";

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
            transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
          }}
          className="hover:bg-white/65 hover:border-zinc-300"
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

        {/* 2. 企业节点状态晶透胶囊 (微遥测信号格代替传统小绿点) */}
        <NodeStatusCapsule
          statusText={currentCompany.status}
          latencyText="32ms"
          variant="signal"
        />

        {/* 3. 视图切换药丸 (业务视图 / 平台管理视图 - 高透清澈底槽) */}
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
              boxShadow: activeView === "business" ? "0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)" : "none",
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
              boxShadow: activeView === "platform" ? "0 1px 2px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)" : "none",
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
              backgroundColor: userMenuOpen ? "rgba(255, 255, 255, 0.5)" : "transparent",
              border: "1px solid",
              borderColor: userMenuOpen ? "rgba(226, 232, 240, 0.85)" : "transparent",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            className="hover:bg-white/50 hover:border-zinc-200"
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
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)",
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
