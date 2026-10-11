import React, { useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { ParticleCanvas } from "../../shared/components/ParticleCanvas";
import {
  IconPuzzle,
  IconCheck,
  IconArrowRight,
  IconUserPlus,
  IconActivity,
  IconUpload,
  IconLayers,
  IconZap,
} from "../../shared/components/Icons";
import { StatusIndicator } from "../../shared/components/StatusIndicator";
import { TodoActionCenter } from "./components/TodoActionCenter";
import { PlatformAssetsOverview } from "./components/PlatformAssetsOverview";

export function Workspace() {
  const { user, navigate, currentCompany, activeView } = useApp();
  const [onboardingCollapsed, setOnboardingCollapsed] = useState(false);

  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* =========================================================================
          1. 顶层欢迎横幅与晨雾微尘光幕
          ========================================================================= */}
      <div
        data-animate="banner"
        className="glass-base"
        style={{
          position: "relative",
          borderRadius: "14px",
          padding: "2rem 2.25rem",
          overflow: "hidden",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
          marginBottom: "1.75rem",
        }}
      >
        <ParticleCanvas particleCount={18} interactive={true} enableLinks={false} />

        <div style={{ position: "relative", zIndex: 10 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.2rem 0.625rem",
              borderRadius: "9999px",
              backgroundColor: activeView === "platform" ? "rgba(239, 246, 255, 0.85)" : "rgba(240, 253, 244, 0.85)",
              border: `1px solid ${activeView === "platform" ? "rgba(191, 219, 254, 0.9)" : "rgba(187, 247, 208, 0.9)"}`,
              color: activeView === "platform" ? "var(--brand-700)" : "var(--semantic-success-fg)",
              fontSize: "0.75rem",
              fontWeight: 500,
              marginBottom: "0.75rem",
            }}
          >
            <StatusIndicator variant="signal" />
            <span>
              自托管独立节点 · {currentCompany.instanceId} · {activeView === "platform" ? "平台运维管理视图" : "业务视图"}
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "var(--zinc-950)",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            欢迎回来，{user?.displayName || "管理员"}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--zinc-600)",
              margin: "0.375rem 0 0 0",
              maxWidth: "680px",
              lineHeight: 1.5,
            }}
          >
            {activeView === "platform"
              ? "当前正处于平台管理视图，可集中进行全平台插件目录管控、安装引入规范审查与系统安全分域审计。"
              : "当前正处于业务视图，系统运转平稳，未预置冗余死板行业大屏，按需通过插件插拔业务。"}
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. 管理员待办与处理中心 (Action Items & Todo Center · 含 ECharts 趋势图)
          ========================================================================= */}
      <TodoActionCenter />

      {/* =========================================================================
          3. 平台资产全景与资源大盘 (Platform Assets Overview · 含 ECharts 构成图与吞吐图)
          ========================================================================= */}
      <PlatformAssetsOverview />

      {/* =========================================================================
          4. 新实例开箱向导卡片 (Onboarding Checklist)
          ========================================================================= */}
      {!onboardingCollapsed && (
        <div
          data-animate="checklist"
          className="card"
          style={{
            marginBottom: "1.75rem",
            border: "1px solid var(--border-subtle)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "var(--zinc-50)",
              borderBottom: "1px solid var(--zinc-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--brand-600)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconZap size={14} />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                实例初始化极速向导 (已完成 2/3)
              </span>
            </div>
            <button
              onClick={() => setOnboardingCollapsed(true)}
              className="btn-ghost btn-sm"
              style={{ fontSize: "0.75rem", color: "var(--zinc-500)" }}
            >
              收起向导
            </button>
          </div>

          <div
            style={{
              padding: "1.25rem 1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                padding: "0.875rem",
                borderRadius: "8px",
                border: "1px solid var(--zinc-200)",
                backgroundColor: "var(--zinc-50)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "var(--brand-600)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck size={12} />
                </span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  1. 完善企业基础信息
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--zinc-500)", margin: 0 }}>
                已配置企业名称、实例标识与安全策略。
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                padding: "0.875rem",
                borderRadius: "8px",
                border: "1px solid var(--zinc-200)",
                backgroundColor: "var(--zinc-50)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "var(--brand-600)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck size={12} />
                </span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  2. 生成首批员工邀请链接
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--zinc-500)", margin: 0 }}>
                已生成 Q4 研发批次邀请，成员可免明文注册。
              </p>
            </div>

            {/* Step 3 (待办) */}
            <div
              onClick={() => navigate("/my/plugins")}
              className="interactive-card"
              style={{
                padding: "0.875rem",
                borderRadius: "8px",
                border: "1px solid var(--brand-300)",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--brand-700)" }}>
                  3. 启用首个 ERP 业务插件
                </span>
                <span style={{ fontSize: "0.6875rem", color: "var(--brand-600)" }}>待处理 -&gt;</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--zinc-600)", margin: 0 }}>
                按需启用客户管理或合同管理，验证本人业务资产。
              </p>
            </div>
          </div>
        </div>
      )}



      {/* =========================================================================
          4. 常用快捷入口组
          ========================================================================= */}
      <div data-animate="quick-actions" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--zinc-900)", marginBottom: "0.875rem" }}>
          高频快捷操作
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            onClick={() => navigate("/my/plugins")}
            className="quick-action-card group"
            style={{ width: "100%" }}
          >
            <div className="action-icon text-brand-600 transition-transform duration-150 group-hover:scale-110">
              <IconPuzzle size={20} />
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--zinc-900)" }}>
                管理本人插件
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                启用或配置本地插件
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/skills/import")}
            className="quick-action-card group"
            style={{ width: "100%" }}
          >
            <div className="action-icon text-brand-600 transition-transform duration-150 group-hover:scale-110">
              <IconUpload size={20} />
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--zinc-900)" }}>
                受控导入 Skill
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                导入 Markdown 业务指令
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/system/invites")}
            className="quick-action-card group"
            style={{ width: "100%" }}
          >
            <div className="action-icon text-brand-600 transition-transform duration-150 group-hover:scale-110">
              <IconUserPlus size={20} />
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--zinc-900)" }}>
                邀请新成员加入
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                生成直绑企业的受控链接
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/system/audit")}
            className="quick-action-card group"
            style={{ width: "100%" }}
          >
            <div className="action-icon text-brand-600 transition-transform duration-150 group-hover:scale-110">
              <IconActivity size={20} />
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--zinc-900)" }}>
                分域操作审计
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                查询三域安全审计日志
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. 业务扩展真实空态区 (坚决不展示虚假销售大屏)
          ========================================================================= */}
      <div
        data-animate="empty-state"
        className="card"
        style={{
          padding: "2.5rem 1.5rem",
          textAlign: "center",
          border: "1px dashed var(--zinc-300)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: "var(--zinc-100)",
            color: "var(--zinc-400)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <IconLayers size={24} />
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--zinc-900)", margin: 0 }}>
          通用管理底座已就绪 · 未安装行业业务表单
        </h3>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--zinc-500)",
            maxWidth: "520px",
            margin: "0.5rem auto 1.25rem auto",
            lineHeight: 1.5,
          }}
        >
          平台坚持“底座不预置死板行业表单”理念。当前实例未加载冗余的客户池、合同漏斗或虚假 KPI 指标。具体业务需通过插件按需扩展。
        </p>
        <button
          onClick={() => navigate("/my/plugins")}
          className="btn btn-primary"
          style={{ display: "inline-flex" }}
        >
          <span>浏览插件中心</span>
          <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
