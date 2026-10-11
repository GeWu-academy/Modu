import React, { useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { ParticleCanvas } from "../../shared/components/ParticleCanvas";
import { TiltCard } from "../../shared/components/TiltCard";
import { useToast } from "../../shared/components/Toast";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconEye,
  IconEyeOff,
  IconGoogle,
  IconGithub,
  IconBuilding,
  IconCheck,
  IconShield,
  IconZap,
  IconSparkles,
} from "../../shared/components/Icons";
import { StatusIndicator } from "../../shared/components/StatusIndicator";

interface AuthCenterProps {
  initialInviteToken?: string;
}

export function AuthCenter({ initialInviteToken }: AuthCenterProps) {
  const { login, currentCompany, invitations } = useApp();
  const toast = useToast();

  const [mode, setMode] = useState<"login" | "register">(
    initialInviteToken ? "register" : "login"
  );

  // 表单状态
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [areaCode, setAreaCode] = useState("+86");
  const [showPassword, setShowPassword] = useState(false);

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

  // 密码强度评估 (4段式)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-zA-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthText = (score: number) => {
    if (score === 0) return "";
    if (score <= 1) return "密码强度：弱 (建议增加长度与组合)";
    if (score <= 2) return "密码强度：中等 (含字母与数字)";
    if (score <= 3) return "密码强度：良好 (包含大小写与数字)";
    return "密码强度：极强 (包含特殊字符)";
  };

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
    if (!username || !email || !phone || !password) {
      toast.warning("请填写完整的用户名、工作邮箱、手机号与密码");
      return;
    }
    if (username.length < 3) {
      toast.error("用户名长度至少为 3 个字符");
      return;
    }
    if (password.length < 8) {
      toast.error("密码长度至少为 8 个字符");
      return;
    }

    toast.success("注册成功！已自动绑定当前企业实例与预设角色");
    login(email, activeInvite?.presetRole || "普通业务成员");
  };

  const handleOAuthClick = (provider: "google" | "github") => {
    toast.info(`已发起 ${provider === "google" ? "Google" : "GitHub"} 快捷登录授权...`);
    setTimeout(() => {
      login(`oauth_${provider}@yourcompany.com`, activeInvite?.presetRole);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "var(--canvas-bg)",
      }}
    >
      {/* =========================================================================
          左侧：企业品牌与视觉背书画卷区 (占比 45%，纯白微扩散画布 + 42颗微粒)
          ========================================================================= */}
      <div
        style={{
          width: "45%",
          minHeight: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid var(--zinc-200)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3.5rem 3rem",
        }}
      >
        {/* 背景微漫射与 42 颗纯白冷翠微尘 Canvas */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--gradient-white-ambient)",
            pointerEvents: "none",
          }}
        />
        <ParticleCanvas particleCount={42} interactive={true} enableLinks={true} />

        {/* 顶部：品牌 Logo 与标语 */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <img
              src="/logo.webp"
              alt="Modu Logo"
              style={{
                width: "44px",
                height: "44px",
                objectFit: "contain",
                display: "block",
              }}
            />
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--zinc-950)" }}>
                Modu
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--zinc-500)" }}>
                企业级敏捷自托管 ERP 管理底座
              </div>
            </div>
          </div>

          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--zinc-950)",
              margin: "1.5rem 0 0.5rem 0",
              letterSpacing: "-0.02em",
            }}
          >
            {currentCompany.name}
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "var(--zinc-600)", margin: 0, maxWidth: "420px" }}>
            为单企业量身定制的独立数据主权管理平台，告别多租户数据泄露风险与笨重预制流程。
          </p>
        </div>

        {/* 中部：三大微透悬浮水晶晶片 (Translucent Glass Chips) */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            margin: "2.5rem 0",
          }}
        >
          <TiltCard
            variant="glass"
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              border: "1px solid rgba(228, 228, 231, 0.7)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--brand-50)",
                  color: "var(--brand-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconShield size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  独享本地数据主权
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                  单企业专属实例独立部署，绝无跨租户数据池穿透风险。
                </div>
              </div>
            </div>
          </TiltCard>

          <TiltCard
            variant="glass"
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              border: "1px solid rgba(228, 228, 231, 0.7)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--brand-50)",
                  color: "var(--brand-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconZap size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  渐进式插件无缝热插拔
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                  通用底座不预置死板行业表单，按需启用 CRM、合同与仓储模块。
                </div>
              </div>
            </div>
          </TiltCard>

          <TiltCard
            variant="glass"
            style={{
              padding: "0.875rem 1rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              border: "1px solid rgba(228, 228, 231, 0.7)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "var(--brand-50)",
                  color: "var(--brand-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconSparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--zinc-900)" }}>
                  零信任安全与分域审计
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)", marginTop: "2px" }}>
                  账号维护、平台插件与本人业务分域审计，不可篡改。
                </div>
              </div>
            </div>
          </TiltCard>
        </div>

        {/* 底部：版本与节点状态 */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--zinc-400)",
          }}
        >
          <span>{currentCompany.version} · Release Candidate</span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(240, 253, 244, 0.8)",
              border: "1px solid rgba(187, 247, 208, 0.9)",
              color: "var(--brand-700)",
              fontWeight: 500,
            }}
          >
            <StatusIndicator variant="signal" />
            <span>自托管节点正常运转</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          右侧：核心认证与受邀表单卡片区 (占比 55%，居中 440px 黄金视宽)
          ========================================================================= */}
      <div
        style={{
          width: "55%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          backgroundColor: "#FAFAFA",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid var(--zinc-200)",
            boxShadow: "var(--shadow-elevation-2)",
            padding: "2.25rem",
          }}
        >
          {/* 受邀模式：微透冷杉流光信任横幅 */}
          {activeInvite && (
            <div
              className="glass-spruce"
              style={{
                padding: "0.875rem 1rem",
                borderRadius: "8px",
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
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--zinc-600)",
                    marginTop: "2px",
                  }}
                >
                  邀请人：{activeInvite.creatorName} · 预设：{activeInvite.presetRole}
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  padding: "0.125rem 0.5rem",
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

          {/* 切换 Tab：登录 / 注册 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--zinc-950)",
                  margin: 0,
                }}
              >
                {mode === "login" ? "欢迎回来" : "创建您的企业账号"}
              </h1>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--zinc-500)",
                  margin: "0.25rem 0 0 0",
                }}
              >
                {mode === "login"
                  ? "请输入您的电子邮箱与密码进入控制台"
                  : "完成四项基础资料即可加入本企业实例"}
              </p>
            </div>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="btn-ghost btn-sm"
              style={{
                fontSize: "0.75rem",
                color: "var(--brand-600)",
                fontWeight: 600,
              }}
            >
              {mode === "login" ? "受邀注册 ->" : "已有账号登录 ->"}
            </button>
          </div>

          {/* 表单区域 */}
          {mode === "login" ? (
            /* 登录表单 (仅邮箱 + 密码) */
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="input-label">工作邮箱</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--zinc-400)",
                    }}
                  >
                    <IconMail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input-control"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label className="input-label">登录密码</label>
                </div>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--zinc-400)",
                    }}
                  >
                    <IconLock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="input-control"
                    style={{ paddingLeft: "2.25rem", paddingRight: "2.25rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--zinc-400)",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", height: "42px" }}
              >
                立即登录
              </button>
            </form>
          ) : (
            /* 四字段注册表单 (用户名 + 邮箱 + 手机号 + 密码) */
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label className="input-label">用户名 (3-32位展示标识)</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--zinc-400)",
                    }}
                  >
                    <IconUser size={16} />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名，如 zhangsan"
                    className="input-control"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                  {username.length >= 3 && (
                    <span
                      style={{
                        position: "absolute",
                        right: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--brand-600)",
                      }}
                    >
                      <IconCheck size={16} />
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="input-label">工作邮箱</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--zinc-400)",
                    }}
                  >
                    <IconMail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="input-control"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="input-label">手机号码</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                    className="input-control"
                    style={{ width: "90px", padding: "0.5rem 0.5rem" }}
                  >
                    <option value="+86">+86 中国</option>
                    <option value="+852">+852 中国香港</option>
                    <option value="+1">+1 美国</option>
                    <option value="+65">+65 新加坡</option>
                  </select>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--zinc-400)",
                      }}
                    >
                      <IconPhone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="请输入手机号码"
                      className="input-control"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">设置登录密码 (至少8位)</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--zinc-400)",
                    }}
                  >
                    <IconLock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8-32位字符，需含字母数字"
                    className="input-control"
                    style={{ paddingLeft: "2.25rem", paddingRight: "2.25rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--zinc-400)",
                      padding: 0,
                    }}
                  >
                    {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>

                {/* 动态 4 段式密码强度指示条 */}
                {password && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "4px", height: "3px" }}>
                      {[1, 2, 3, 4].map((step) => {
                        let fillBg = "var(--zinc-200)";
                        if (passwordStrength >= step) {
                          if (passwordStrength <= 1) fillBg = "var(--semantic-danger-fg)";
                          else if (passwordStrength <= 2) fillBg = "var(--semantic-warning-fg)";
                          else fillBg = "var(--brand-500)";
                        }
                        return (
                          <div
                            key={step}
                            style={{
                              flex: 1,
                              backgroundColor: fillBg,
                              borderRadius: "2px",
                              transition: "background-color 200ms ease",
                            }}
                          />
                        );
                      })}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--zinc-500)", marginTop: "4px" }}>
                      {getStrengthText(passwordStrength)}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "0.5rem", height: "42px" }}
              >
                立即注册并加入企业
              </button>
            </form>
          )}

          {/* 分割线与 OAuth 快捷登录 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.5rem 0 1rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--zinc-200)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--zinc-400)" }}>或者</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "var(--zinc-200)" }} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => handleOAuthClick("google")}
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, height: "38px" }}
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
                height: "38px",
                backgroundColor: "var(--zinc-950)",
                color: "#FFFFFF",
                border: "1px solid var(--zinc-950)",
              }}
            >
              <IconGithub size={16} />
              <span>GitHub</span>
            </button>
          </div>

          <div
            style={{
              marginTop: "1.5rem",
              fontSize: "0.75rem",
              color: "var(--zinc-400)",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            进入系统即代表您已同意《企业自托管平台安全准则》与《分域数据审计协议》。
          </div>
        </div>
      </div>
    </div>
  );
}
