import React, { useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import {
  IconBuilding,
  IconUser,
  IconShieldCheck,
  IconLock,
} from "../../shared/components/Icons";
import { StatusIndicator } from "../../shared/components/StatusIndicator";

export function SettingsView() {
  const { user, currentCompany, updateUserProfile } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"profile" | "company">("profile");

  // 个人资料修改
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [density, setDensity] = useState("comfortable");

  // 修改密码模拟
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      updateUserProfile(user.id, { displayName, phone });
      toast.success("个人偏好设置已更新");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.warning("请输入当前密码与新密码");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次输入的新密码不一致");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("新密码长度至少需要 8 个字符");
      return;
    }
    toast.success("登录密码已更新（下次登录生效）");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
          系统设置与企业配置
        </h1>
        <p className="text-sm text-zinc-500 mt-1 mb-0">
          维护个人账号资料与当前自托管企业实例的基础参数。
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-brand-50 text-brand-700 border border-brand-200 font-semibold"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconUser size={14} />
          <span>个人偏好与安全</span>
        </button>

        <button
          onClick={() => setActiveTab("company")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "company"
              ? "bg-brand-50 text-brand-700 border border-brand-200 font-semibold"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconBuilding size={14} />
          <span>企业实例基础信息</span>
        </button>
      </div>

      {/* Tab 1: 个人偏好与安全 */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* 基础资料 */}
          <form
            onSubmit={handleSaveProfile}
            className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 space-y-4"
          >
            <h2 className="text-base font-bold text-zinc-950 m-0">基础显示资料</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">账号标识 (唯一 Username)</label>
                <input
                  type="text"
                  disabled
                  value={user?.username || ""}
                  className="input-control text-sm bg-zinc-100 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="input-label">显示名称</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-control text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">工作邮箱 (登录标识)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="input-control text-sm bg-zinc-100 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="input-label">联系电话</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-control text-sm"
                />
              </div>
            </div>

            <div>
              <label className="input-label">界面视觉密度</label>
              <select
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                className="input-control text-sm max-w-xs"
              >
                <option value="compact">紧凑工控模式 (Compact)</option>
                <option value="comfortable">标准舒适模式 (Comfortable)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <button type="submit" className="btn btn-primary text-xs">
                保存个人资料
              </button>
            </div>
          </form>

          {/* 修改登录密码 */}
          <form
            onSubmit={handlePasswordSubmit}
            className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 space-y-4"
          >
            <h2 className="text-base font-bold text-zinc-950 m-0 flex items-center gap-2">
              <IconLock size={16} className="text-zinc-700" />
              <span>修改登录密码</span>
            </h2>

            <div className="max-w-md space-y-3">
              <div>
                <label className="input-label">当前旧密码</label>
                <input
                  type="password"
                  placeholder="请输入当前密码"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="input-control text-sm"
                />
              </div>

              <div>
                <label className="input-label">设置新密码 (至少8位，包含字母与数字)</label>
                <input
                  type="password"
                  placeholder="请输入新密码"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-control text-sm"
                />
              </div>

              <div>
                <label className="input-label">再次确认新密码</label>
                <input
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-control text-sm"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <button type="submit" className="btn btn-secondary text-xs">
                更新密码
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: 企业实例基础信息 */}
      {activeTab === "company" && (
        <div className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 space-y-6">
          <div>
            <h2 className="text-base font-bold text-zinc-950 m-0">单企业自托管实例档案</h2>
            <p className="text-xs text-zinc-500 mt-1 mb-0">
              单企业部署架构，实例独享本地数据库与存储，不提供多租户切换入口。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
              <div className="text-zinc-500">企业注册全称</div>
              <div className="text-sm font-semibold text-zinc-900">{currentCompany.name}</div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
              <div className="text-zinc-500">自托管实例标识</div>
              <div className="text-sm font-mono font-semibold text-zinc-900">
                {currentCompany.instanceId}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
              <div className="text-zinc-500">当前底座版本</div>
              <div className="text-sm font-mono font-semibold text-zinc-900">
                {currentCompany.version}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1">
              <div className="text-zinc-500">实例自治运转状态</div>
              <div className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                <StatusIndicator variant="signal" />
                <span>{currentCompany.status}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-brand-50/50 border border-brand-200 rounded-lg text-xs text-brand-900 flex items-start gap-2.5">
            <IconShieldCheck size={16} className="text-brand-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>数据主权与架构边界声明：</strong>
              本实例不连接任何中心化遥测平台或多租户母站。所有组织成员、业务插件、Skill 及分域审计记录均权威保存在本地 PostgreSQL 数据库中。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
