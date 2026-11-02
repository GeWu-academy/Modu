import React, { useLayoutEffect, useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconGithub,
  IconBuilding,
  IconCheck,
} from "../../shared/components/Icons";

interface AuthCenterProps {
  initialInviteToken?: string;
}

export function AuthCenter({ initialInviteToken }: AuthCenterProps) {
  const { login, register, currentCompany, invitations } = useApp();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register">(
    initialInviteToken ? "register" : "login"
  );

  // 表单状态
  const [companyName, setCompanyName] = useState(currentCompany.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 表单容器高度随当前表单内容平滑变化
  const [formEl, setFormEl] = useState<HTMLDivElement | null>(null);
  const [formHeight, setFormHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!formEl) return;
    const measure = () => setFormHeight(formEl.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(formEl);
    return () => observer.disconnect();
  }, [formEl]);

  // 邀请上下文（若存在）
  const activeInvite = initialInviteToken
    ? invitations.find((inv) => inv.token === initialInviteToken) || {
        token: initialInviteToken,
        presetRole: "普通业务成员",
        expiresAt: "2026-10-18 18:00",
        creatorName: "管理员李明",
        status: "active",
      }
    : null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning("请输入完整的工作邮箱与登录密码");
      return;
    }
    toast.success("身份凭据校验成功，正在进入工作台...");
    login(email);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email) {
      toast.warning("请填写用户名与工作邮箱");
      return;
    }
    if (username.length < 3) {
      toast.error("用户名长度至少为 3 个字符");
      return;
    }

    const assignedRole = activeInvite?.presetRole || "系统超级管理员";
    const trimmedCompany = companyName.trim();

    register({
      username,
      displayName: username,
      email,
      role: assignedRole,
      companyName: activeInvite ? undefined : trimmedCompany,
    });

    if (activeInvite) {
      toast.success("注册成功！已自动绑定当前企业实例与受邀角色");
    } else {
      if (trimmedCompany) {
        toast.success(`管理员注册成功！已登记企业全称：${trimmedCompany}`);
      } else {
        toast.success("管理员注册成功！未填写公司名，系统将以独立底座模式运行");
      }
    }
  };

  const handleOAuthClick = (provider: "google" | "github") => {
    toast.info(`已发起 ${provider === "google" ? "Google" : "GitHub"} 快捷登录授权...`);
    setTimeout(() => {
      login(`oauth_${provider}@yourcompany.com`, activeInvite?.presetRole);
    }, 600);
  };

  // ── 共用样式常量 ──────────────────────────────────────────────────────────
  const inputWrap: React.CSSProperties = { position: "relative" };

  const iconLeft: React.CSSProperties = {
    position: "absolute",
    left: "0.875rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--zinc-400)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  };

  const inputBase: React.CSSProperties = {
    paddingLeft: "2.5rem",
    borderRadius: "10px",
    height: "46px",
    fontSize: "0.9375rem",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--zinc-700)",
    marginBottom: "0.375rem",
  };

  const passwordToggleStyle: React.CSSProperties = {
    position: "absolute",
    right: "0.875rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--zinc-400)",
    padding: 0,
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      style={{
        /* height 固定 100vh，背景不随内容高度变化而位移 */
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
        position: "relative",
        backgroundImage: "url('/login-bg.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* =========================================================================
          右侧：悬浮白卡容器，自身支持纵向平滑滚动，并保证最小屏幕下不截断顶部
          ========================================================================= */}
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          overflowY: "auto",
          padding: "1.5rem 1.25rem",
          marginRight: "clamp(1rem, 7vw, 7rem)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "min(460px, calc(100vw - 2.5rem))",
            margin: "auto 0",
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            border: "1px solid rgba(226, 232, 240, 0.5)",
            boxShadow:
              "0 28px 72px -16px rgba(15, 23, 42, 0.18), 0 10px 28px -6px rgba(15, 23, 42, 0.08)",
            padding: "2.25rem 2.5rem",
          }}
        >
          {/* 受邀模式横幅 */}
          {activeInvite && (
            <div
              className="glass-spruce"
              style={{
                padding: "0.75rem 0.875rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--brand-800)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <IconBuilding size={14} />
                  <span>您已受邀加入当前企业</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--zinc-600)", marginTop: "2px" }}>
                  邀请人：{activeInvite.creatorName} · 预设：{activeInvite.presetRole}
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  padding: "0.2rem 0.625rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(240, 253, 244, 0.9)",
                  border: "1px solid rgba(187, 247, 208, 0.9)",
                  color: "var(--brand-700)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                凭据有效
              </span>
            </div>
          )}

          {/* 标题区与模式切换 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: mode === "login" ? "1.75rem" : "1.25rem",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--zinc-950)",
                  margin: 0,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.2,
                }}
              >
                {mode === "login"
                  ? "欢迎回来"
                  : activeInvite
                  ? "创建受邀账号"
                  : "注册管理员账号"}
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--zinc-500)",
                  margin: "0.375rem 0 0 0",
                  lineHeight: 1.5,
                }}
              >
                {mode === "login"
                  ? "请输入您的电子邮箱与密码进入控制台"
                  : activeInvite
                  ? "完成基础资料即可加入本企业实例"
                  : "设置管理员账号，可指定所属公司名称"}
              </p>
            </div>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="btn-ghost btn-sm"
              style={{
                fontSize: "0.8125rem",
                color: "var(--brand-700)",
                fontWeight: 600,
                flexShrink: 0,
                marginTop: "2px",
                whiteSpace: "nowrap",
                borderRadius: "9999px",
                padding: "0.375rem 0.75rem",
                backgroundColor: "var(--brand-50)",
              }}
            >
              {mode === "login"
                ? activeInvite
                  ? "受邀注册 →"
                  : "管理员注册 →"
                : "已有账号 →"}
            </button>
          </div>

          {/* 表单切换视口：高度随内容平滑过渡，表单本身做淡入 + 位移 */}
          <div
            className="auth-form-viewport"
            style={{ height: formHeight === null ? undefined : `${formHeight}px` }}
          >
            <div
              key={mode}
              ref={setFormEl}
              className={mode === "login" ? "auth-panel--login" : "auth-panel--register"}
            >
              {/* ── 登录表单 ─────────────────────────────────── */}
              {mode === "login" ? (
                <form
                  onSubmit={handleLoginSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}
                >
                  {/* 邮箱 */}
                  <div>
                    <label style={labelStyle}>工作邮箱</label>
                    <div style={inputWrap}>
                      <span style={iconLeft}>
                        <IconMail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="input-control"
                        style={inputBase}
                      />
                    </div>
                  </div>

                  {/* 密码 */}
                  <div>
                    <label style={labelStyle}>登录密码</label>
                    <div style={inputWrap}>
                      <span style={iconLeft}>
                        <IconLock size={16} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="input-control"
                        style={{ ...inputBase, paddingRight: "2.75rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={passwordToggleStyle}
                      >
                        {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* 登录按钮 */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      height: "48px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: "10px",
                      marginTop: "0.125rem",
                      letterSpacing: "0.01em",
                    }}
                  >
                    立即登录
                  </button>
                </form>
              ) : (
                /* ── 注册表单 ── */
                <form
                  onSubmit={handleRegisterSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  {/* 公司名（仅非受邀） */}
                  {!activeInvite && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.375rem",
                        }}
                      >
                        <label style={{ ...labelStyle, marginBottom: 0 }}>所属公司 / 企业名称</label>
                        <span style={{ fontSize: "0.6875rem", color: "var(--zinc-400)" }}>选填</span>
                      </div>
                      <div style={inputWrap}>
                        <span style={iconLeft}>
                          <IconBuilding size={16} />
                        </span>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="例如：智汇未来科技有限公司（选填）"
                          className="input-control"
                          style={inputBase}
                        />
                      </div>
                    </div>
                  )}

                  {/* 用户名 */}
                  <div>
                    <label style={labelStyle}>用户名（3–32 位展示标识）</label>
                    <div style={inputWrap}>
                      <span style={iconLeft}>
                        <IconUser size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名，如 zhangsan"
                        className="input-control"
                        style={inputBase}
                      />
                      {username.length >= 3 && (
                        <span
                          style={{
                            position: "absolute",
                            right: "0.875rem",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--brand-600)",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <IconCheck size={16} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 工作邮箱 */}
                  <div>
                    <label style={labelStyle}>工作邮箱</label>
                    <div style={inputWrap}>
                      <span style={iconLeft}>
                        <IconMail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="input-control"
                        style={inputBase}
                      />
                    </div>
                  </div>

                  {/* 注册按钮 */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      height: "48px",
                      fontSize: "1rem",
                      fontWeight: 600,
                      borderRadius: "10px",
                      letterSpacing: "0.01em",
                      marginTop: "0.125rem",
                    }}
                  >
                    {activeInvite ? "立即注册并加入企业" : "立即创建管理员账号"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 分割线与 OAuth */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: mode === "login" ? "1.5rem 0 1.25rem" : "1.25rem 0 1rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--zinc-200)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--zinc-400)" }}>或者</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--zinc-200)" }} />
          </div>

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              onClick={() => handleOAuthClick("google")}
              type="button"
              className="btn btn-secondary"
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                fontSize: "0.9375rem",
              }}
            >
              <IconGoogle size={16} />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuthClick("github")}
              type="button"
              className="btn"
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                backgroundColor: "var(--zinc-950)",
                color: "#FFFFFF",
                border: "1px solid var(--zinc-950)",
              }}
            >
              <IconGithub size={16} />
              <span>GitHub</span>
            </button>
          </div>

          {/* 协议说明 */}
          <div
            style={{
              marginTop: mode === "login" ? "1.25rem" : "1rem",
              fontSize: "0.6875rem",
              color: "var(--zinc-400)",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            进入系统即代表您已同意《企业自托管平台安全准则》与《分域数据审计协议》。
          </div>
        </div>
      </div>
    </div>
  );
}
