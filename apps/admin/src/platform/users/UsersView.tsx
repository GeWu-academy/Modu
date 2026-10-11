import React, { useState } from "react";
import "./UsersView.css";
import { useApp, UserAccount, Invitation } from "../../app/providers/AppContext";
import { useToast } from "../../shared/components/Toast";
import { Badge } from "../../shared/components/Badge";
import { Drawer } from "../../shared/components/Drawer";
import { Modal } from "../../shared/components/Modal";
import { TactileBurst } from "../../shared/components/TactileBurst";
import {
  IconSearch,
  IconPlus,
  IconUserPlus,
  IconCopy,
  IconQrCode,
  IconFileText,
  IconUsers,
  IconMail,
  IconPhone,
  IconShield,
  IconAlertTriangle,
  IconCheck,
  IconEdit,
} from "../../shared/components/Icons";

export function UsersView({ initialTab = "users" }: { initialTab?: "users" | "invites" }) {
  const {
    users,
    invitations,
    currentCompany,
    updateUserStatus,
    updateUserProfile,
    createUser,
    createInvitation,
    revokeInvitation,
    user: currentUser,
  } = useApp();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"users" | "invites">(initialTab);

  // 用户列表过滤与搜索
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("all");

  // 邀请列表过滤与搜索
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteStatusFilter, setInviteStatusFilter] = useState<string>("all");

  // 抽屉与弹窗状态
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("普通业务成员");

  // 创建邀请抽屉
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState("普通业务成员");
  const [inviteDays, setInviteDays] = useState(7);
  const [inviteLimitType, setInviteLimitType] = useState<"single" | "multi" | "unlimited">("single");
  const [inviteLimitCount, setInviteLimitCount] = useState(10);
  const [inviteWhitelist, setInviteWhitelist] = useState("");
  const [inviteNote, setInviteNote] = useState("");

  // 邀请生成成功面板与触觉粒子微爆
  const [generatedInvite, setGeneratedInvite] = useState<Invitation | null>(null);
  const [burstActive, setBurstActive] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // 作废确认弹窗
  const [revokingInvite, setRevokingInvite] = useState<Invitation | null>(null);

  // 1. 过滤用户数据
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchStatus = userStatusFilter === "all" || u.status === userStatusFilter;
    const matchRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  // 2. 过滤邀请数据
  const filteredInvites = invitations.filter((inv) => {
    const matchSearch =
      inv.note.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      inv.creatorName.toLowerCase().includes(inviteSearch.toLowerCase()) ||
      inv.token.toLowerCase().includes(inviteSearch.toLowerCase());
    const matchStatus = inviteStatusFilter === "all" || inv.status === inviteStatusFilter;
    return matchSearch && matchStatus;
  });

  // 提交编辑用户资料
  const handleSaveUserProfile = () => {
    if (!selectedUser) return;
    updateUserProfile(selectedUser.id, {
      displayName: editDisplayName,
      phone: editPhone,
    });
    toast.success("用户资料已成功保存");
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  // 切换用户启停
  const handleToggleUserStatus = (u: UserAccount) => {
    const targetStatus = u.status === "active" ? "disabled" : "active";
    const result = updateUserStatus(u.id, targetStatus);
    if (!result.ok) {
      toast.error(result.message || "操作被拒绝");
    } else {
      toast.success(`账号已成功${targetStatus === "active" ? "启用" : "停用"}`);
    }
  };

  // 提交手动创建用户
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) {
      toast.warning("用户名与工作邮箱为必填项");
      return;
    }
    createUser({
      username: newUsername,
      displayName: newDisplayName || newUsername,
      email: newEmail,
      phone: newPhone || "+86 13800000000",
      role: newRole,
      status: "active",
    });
    toast.success("系统账号已成功创建");
    setIsCreateUserOpen(false);
    setNewUsername("");
    setNewDisplayName("");
    setNewEmail("");
    setNewPhone("");
  };

  // 提交创建邀请链接
  const handleCreateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + inviteDays);
    const expiresAt = expiresDate.toISOString().replace("T", " ").substring(0, 16);

    let usageLimit = 1;
    if (inviteLimitType === "multi") usageLimit = inviteLimitCount;
    if (inviteLimitType === "unlimited") usageLimit = -1;

    const newInv = createInvitation({
      presetRole: inviteRole,
      usageLimit,
      creatorName: currentUser?.displayName || "系统管理员",
      creatorId: currentUser?.id || "usr_admin",
      expiresAt,
      note: inviteNote || `邀请加入企业 (${inviteRole})`,
      whitelistEmail: inviteWhitelist || undefined,
    });

    // 触发 14 颗冷杉晨露微粒微爆
    setBurstActive(true);
    setGeneratedInvite(newInv);
    toast.success("企业专属受邀注册链接已生成！");
  };

  // 复制链接
  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/#/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("邀请链接已复制到剪贴板");
  };

  // 复制邀请模板
  const copyInviteTemplate = (inv: Invitation) => {
    const url = `${window.location.origin}/#/invite/${inv.token}`;
    const companyPrefix = currentCompany.name?.trim() ? `【${currentCompany.name.trim()}】` : "【Modu】";
    const text = `${companyPrefix}${inv.creatorName} 邀请您加入管理系统，预设角色为 [${inv.presetRole}]。请点击以下安全链接完成受邀注册：${url}`;
    navigator.clipboard.writeText(text);
    toast.success("企业邀请话术模板已复制");
  };

  return (
    <div className="admin-users-view p-8 max-w-7xl mx-auto">
      {/* 粒子触觉绽放组件 */}
      <TactileBurst active={burstActive} onComplete={() => setBurstActive(false)} />

      {/* 顶部标题与核心操作栏 */}
      <div className="users-page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
            用户与成员
          </h1>
          <p className="text-sm text-zinc-500 mt-1 mb-0">
            管理企业账号、角色权限与成员邀请。
          </p>
        </div>

        <div className="users-page-actions flex items-center gap-3">
          <button
            onClick={() => setIsCreateUserOpen(true)}
            className="btn btn-secondary text-xs h-9 px-3.5"
          >
            <IconPlus size={14} />
            <span>手动创建账号</span>
          </button>

          <button
            onClick={() => {
              setGeneratedInvite(null);
              setIsInviteDrawerOpen(true);
            }}
            className="btn btn-primary text-xs h-9 px-3.5 transition-all group"
          >
            <IconUserPlus size={14} className="text-brand-600 transition-transform group-hover:scale-110" />
            <span>邀请成员加入</span>
          </button>
        </div>
      </div>

      {/* 主视图 Tab 切换器 */}
      <div className="users-tabs flex items-center gap-2 border-b border-zinc-200 mb-6 pb-2" role="tablist" aria-label="用户管理视图">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "users"}
          onClick={() => setActiveTab("users")}
          className={`users-tab px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "users"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconUsers size={14} />
          <span>现有系统用户</span>
          <span className="users-tab-count">{users.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "invites"}
          onClick={() => setActiveTab("invites")}
          className={`users-tab px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === "invites"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconUserPlus size={14} />
          <span>邀请链接</span>
          <span className="users-tab-count">{invitations.length}</span>
        </button>
      </div>

      {/* =========================================================================
          Tab 1: 现有系统用户列表
          ========================================================================= */}
      {activeTab === "users" && (
        <div className="users-panel card bg-white border border-zinc-200 rounded-xl shadow-elevation-1">
          {/* 筛选过滤工具条 */}
          <div className="users-toolbar p-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="users-search relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <IconSearch size={15} />
                </span>
                <input
                  type="text"
                  placeholder="搜索用户名、显示名或工作邮箱..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
                />
              </div>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="input-control text-xs w-32 py-1 h-8"
              >
                <option value="all">全部状态</option>
                <option value="active">生效中</option>
                <option value="disabled">已停用</option>
              </select>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="input-control text-xs w-36 py-1 h-8"
              >
                <option value="all">全部预设角色</option>
                <option value="系统超级管理员">系统超级管理员</option>
                <option value="平台运维管理员">平台运维管理员</option>
                <option value="核心业务人员">核心业务人员</option>
                <option value="财务审计员">财务审计员</option>
                <option value="普通业务成员">普通业务成员</option>
              </select>
            </div>

            <div className="users-result-count text-xs text-zinc-500 font-medium">
              共查询到 {filteredUsers.length} 个账号
            </div>
          </div>

          {/* 数据表格 */}
          <div className="overflow-x-auto">
            <table className="users-data-table w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">账号标识 / 显示名称</th>
                  <th className="py-3 px-4">联系凭证 (邮箱/电话)</th>
                  <th className="py-3 px-4">角色权限摘要</th>
                  <th className="py-3 px-4">当前状态</th>
                  <th className="py-3 px-4">创建与最后活跃</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 text-sm">
                      没有符合条件的账号记录
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700">
                            {u.displayName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-950 flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {u.isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 font-normal">
                                  本人
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 font-mono mt-0.5">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div className="text-zinc-800 flex items-center gap-1">
                          <IconMail size={12} className="text-zinc-400" />
                          <span>{u.email}</span>
                        </div>
                        <div className="text-zinc-500 mt-1 flex items-center gap-1">
                          <IconPhone size={12} className="text-zinc-400" />
                          <span>{u.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 font-medium border border-zinc-200">
                          <IconShield size={12} className="text-zinc-500" />
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.status === "active" ? (
                          <Badge variant="success" pulse={true}>
                            生效中
                          </Badge>
                        ) : (
                          <Badge variant="danger">已停用</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-zinc-500 font-mono">
                        <div>注册：{u.createdAt}</div>
                        {u.lastLoginAt && (
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            活跃：{u.lastLoginAt}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditDisplayName(u.displayName);
                              setEditPhone(u.phone);
                              setIsEditUserOpen(true);
                            }}
                            className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                          >
                            <IconEdit size={13} />
                            <span>资料</span>
                          </button>

                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`btn-ghost btn-sm text-xs ${
                              u.status === "active"
                                ? "text-rose-600 hover:text-rose-800"
                                : "text-brand-600 hover:text-brand-800"
                            }`}
                            disabled={u.isCurrentUser}
                            title={u.isCurrentUser ? "防锁死：当前登录账号无法自我停用" : undefined}
                          >
                            {u.status === "active" ? "停用" : "启用"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 2: 邀请链接管理
          ========================================================================= */}
      {activeTab === "invites" && (
        <div className="users-panel card bg-white border border-zinc-200 rounded-xl shadow-elevation-1">
          {/* 工具栏 */}
          <div className="users-toolbar p-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="users-search relative flex-1 max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <IconSearch size={15} />
                </span>
                <input
                  type="text"
                  placeholder="搜索邀请备注、创建人或 Token..."
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                  className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
                />
              </div>

              <select
                value={inviteStatusFilter}
                onChange={(e) => setInviteStatusFilter(e.target.value)}
                className="input-control text-xs w-32 py-1 h-8"
              >
                <option value="all">全部状态</option>
                <option value="active">生效中</option>
                <option value="consumed">已核销</option>
                <option value="expired">已过期</option>
                <option value="revoked">已作废</option>
              </select>
            </div>

            <div className="users-result-count text-xs text-zinc-500 font-medium">
              共查询到 {filteredInvites.length} 批次邀请
            </div>
          </div>

          {/* 表格 */}
          <div className="overflow-x-auto">
            <table className="users-data-table users-invites-table w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-4">邀请备注 / Token</th>
                  <th className="py-3 px-4">预设角色</th>
                  <th className="py-3 px-4">加入进度 (已用/上限)</th>
                  <th className="py-3 px-4">创建人</th>
                  <th className="py-3 px-4">有效期截止</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400 text-sm">
                      没有符合条件的邀请链接记录
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-950">{inv.note}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {inv.token}
                          {inv.whitelistEmail && (
                            <span className="ml-2 text-zinc-400 text-[11px]">
                              (限定: {inv.whitelistEmail})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium">
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {inv.presetRole}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div className="font-semibold text-zinc-900">
                          {inv.usageLimit === -1
                            ? `${inv.usageCount} 人 (无上限)`
                            : `${inv.usageCount} / ${inv.usageLimit} 人`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-zinc-600">
                        {inv.creatorName}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-zinc-500 font-mono">
                        {inv.expiresAt}
                      </td>

                      <td className="py-3.5 px-4">
                        {inv.status === "active" && (
                          <Badge variant="success">生效中</Badge>
                        )}
                        {inv.status === "consumed" && (
                          <Badge variant="neutral">已核销</Badge>
                        )}
                        {inv.status === "expired" && (
                          <Badge variant="warning">已过期</Badge>
                        )}
                        {inv.status === "revoked" && (
                          <Badge variant="danger">已作废</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyInviteLink(inv.token)}
                            className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                            title="复制专属邀请链接"
                          >
                            <IconCopy size={13} />
                            <span>链接</span>
                          </button>

                          <button
                            onClick={() => copyInviteTemplate(inv)}
                            className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                            title="复制邀请话术"
                          >
                            <IconFileText size={13} />
                            <span>话术</span>
                          </button>

                          {inv.status === "active" && (
                            <button
                              onClick={() => setRevokingInvite(inv)}
                              className="btn-ghost btn-sm text-xs text-rose-600 hover:text-rose-800"
                            >
                              作废
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          抽屉：创建企业邀请链接 (480px 宽)
          ========================================================================= */}
      <Drawer
        isOpen={isInviteDrawerOpen}
        onClose={() => {
          setIsInviteDrawerOpen(false);
          setGeneratedInvite(null);
        }}
        title={generatedInvite ? "邀请链接生成完毕" : "邀请新成员加入企业"}
        description={
          generatedInvite
            ? "新成员访问此专属链接即可免明文密码直接注册并绑定当前企业"
            : "生成专属安全链接，新成员注册后自动归属本实例企业并赋予预设角色"
        }
        width="480px"
      >
        {generatedInvite ? (
          /* 生成成功结果展示卡片 */
          <div className="space-y-5 animate-fade-in-up">
            <div className="glass-spruce p-4 rounded-xl border border-brand-200">
              <div className="text-xs font-semibold text-brand-800 flex items-center gap-1.5 mb-1">
                <IconCheck size={14} />
                <span>凭据已成功入库生效</span>
              </div>
              <div className="text-xs text-zinc-600">
                预设角色：<strong className="text-zinc-900">{generatedInvite.presetRole}</strong> ·
                有效期至：{generatedInvite.expiresAt}
              </div>
            </div>

            {/* 链接展示卡片 */}
            <div>
              <label className="input-label">专属加密受邀链接</label>
              <div className="glass-base p-3 rounded-lg border border-zinc-200 flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-zinc-700 truncate select-all">
                  {`${window.location.origin}/#/invite/${generatedInvite.token}`}
                </div>
                <button
                  onClick={() => copyInviteLink(generatedInvite.token)}
                  className="btn btn-primary btn-sm flex-shrink-0"
                >
                  <IconCopy size={13} />
                  <span>复制</span>
                </button>
              </div>
            </div>

            {/* 快捷操作组 */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => copyInviteTemplate(generatedInvite)}
                className="btn btn-secondary text-xs"
              >
                <IconFileText size={14} />
                <span>复制通知模板</span>
              </button>

              <button
                onClick={() => setShowQrCode(!showQrCode)}
                className="btn btn-secondary text-xs"
              >
                <IconQrCode size={14} />
                <span>{showQrCode ? "收起二维码" : "扫码加入"}</span>
              </button>
            </div>

            {showQrCode && (
              <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 text-center">
                <div className="w-36 h-36 bg-white border border-zinc-300 rounded-lg mx-auto flex items-center justify-center p-2 mb-2">
                  <IconQrCode size={110} className="text-zinc-800" />
                </div>
                <span className="text-xs text-zinc-500">
                  支持企业微信或移动扫码直接打开落地页
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => {
                  setGeneratedInvite(null);
                  setIsInviteDrawerOpen(false);
                }}
                className="btn btn-secondary text-xs"
              >
                完成并返回列表
              </button>
            </div>
          </div>
        ) : (
          /* 配置表单 */
          <form onSubmit={handleCreateInviteSubmit} className="space-y-4">
            <div>
              <label className="input-label">1. 预分配角色权限 (Role)</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-control text-sm"
              >
                <option value="普通业务成员">普通业务成员 (推荐)</option>
                <option value="核心业务人员">核心业务人员</option>
                <option value="财务审计员">财务审计员</option>
                <option value="临时查看者">临时查看者</option>
              </select>
              <p className="input-hint">防自我提权约束：仅能授予等于或低于您管辖范围的角色。</p>
            </div>

            <div>
              <label className="input-label">2. 链接有效期限</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "1 天", val: 1 },
                  { label: "7 天 (荐)", val: 7 },
                  { label: "30 天", val: 30 },
                  { label: "90 天", val: 90 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setInviteDays(item.val)}
                    className={`py-2 text-xs font-medium rounded-md border transition-all ${
                      inviteDays === item.val
                        ? "tab-pill-active"
                        : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">3. 使用次数上限</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
                  <input
                    type="radio"
                    name="limitType"
                    checked={inviteLimitType === "single"}
                    onChange={() => setInviteLimitType("single")}
                  />
                  <span>单次有效 (1人核销即作废，高安全性)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
                  <input
                    type="radio"
                    name="limitType"
                    checked={inviteLimitType === "multi"}
                    onChange={() => setInviteLimitType("multi")}
                  />
                  <span>指定上限人数：</span>
                  {inviteLimitType === "multi" && (
                    <input
                      type="number"
                      min={2}
                      max={200}
                      value={inviteLimitCount}
                      onChange={(e) => setInviteLimitCount(parseInt(e.target.value) || 10)}
                      className="input-control text-xs w-20 py-0.5 px-2 h-7"
                    />
                  )}
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-800 cursor-pointer">
                  <input
                    type="radio"
                    name="limitType"
                    checked={inviteLimitType === "unlimited"}
                    onChange={() => setInviteLimitType("unlimited")}
                  />
                  <span>无限次加入 (适合企业全员大群广播)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="input-label">4. 限定受邀邮箱 (选填白名单)</label>
              <input
                type="email"
                placeholder="选填，例如 employee@company.com"
                value={inviteWhitelist}
                onChange={(e) => setInviteWhitelist(e.target.value)}
                className="input-control text-sm"
              />
              <p className="input-hint">填写后，仅限该电子邮箱能够核销此 Token 进行注册。</p>
            </div>

            <div>
              <label className="input-label">5. 邀请备注说明</label>
              <input
                type="text"
                required
                placeholder="例如：2026年Q4研发二部新入职批次"
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                className="input-control text-sm"
              />
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInviteDrawerOpen(false)}
                className="btn btn-secondary text-xs"
              >
                取消
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                生成邀请链接
              </button>
            </div>
          </form>
        )}
      </Drawer>

      {/* =========================================================================
          抽屉：查看与编辑用户资料
          ========================================================================= */}
      <Drawer
        isOpen={isEditUserOpen}
        onClose={() => {
          setIsEditUserOpen(false);
          setSelectedUser(null);
        }}
        title="用户资料维护与受权审计"
        description="管理指定账号的白名单展示字段及状态"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
              <div className="text-zinc-500">
                用户 ID：<span className="font-mono text-zinc-900">{selectedUser.id}</span>
              </div>
              <div className="text-zinc-500">
                用户名：<span className="font-mono text-zinc-900">@{selectedUser.username}</span>
              </div>
              <div className="text-zinc-500">
                登录邮箱：<span className="text-zinc-900">{selectedUser.email}</span>
              </div>
            </div>

            <div>
              <label className="input-label">显示名称</label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="input-control text-sm"
              />
            </div>

            <div>
              <label className="input-label">联系电话</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="input-control text-sm"
              />
            </div>

            <div>
              <label className="input-label">所属角色 (只读摘要)</label>
              <input
                type="text"
                disabled
                value={selectedUser.role}
                className="input-control text-sm bg-zinc-100 text-zinc-500 cursor-not-allowed"
              />
              <p className="input-hint">首版仅支持展示预设角色，完整 RBAC 权限配置后续迭代开放。</p>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditUserOpen(false)}
                className="btn btn-secondary text-xs"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveUserProfile}
                className="btn btn-primary text-xs"
              >
                保存资料
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* =========================================================================
          对话框：手动创建系统账号
          ========================================================================= */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="手动录入新账号"
        description="用于管理员线下创建内部账号（推荐优先采用邀请链接注册）"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
          <div>
            <label className="input-label">账号标识 (Username)</label>
            <input
              type="text"
              required
              placeholder="3-32位英文或数字"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="input-control text-sm"
            />
          </div>

          <div>
            <label className="input-label">真实显示名称</label>
            <input
              type="text"
              placeholder="例如：张三"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="input-control text-sm"
            />
          </div>

          <div>
            <label className="input-label">工作邮箱</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input-control text-sm"
            />
          </div>

          <div>
            <label className="input-label">手机号码</label>
            <input
              type="tel"
              placeholder="+86 13800000000"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="input-control text-sm"
            />
          </div>

          <div>
            <label className="input-label">预设角色</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="input-control text-sm"
            >
              <option value="普通业务成员">普通业务成员</option>
              <option value="核心业务人员">核心业务人员</option>
              <option value="财务审计员">财务审计员</option>
              <option value="平台运维管理员">平台运维管理员</option>
            </select>
          </div>

          <div className="pt-3 border-t border-zinc-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(false)}
              className="btn btn-secondary text-xs"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary text-xs">
              确认创建
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          对话框：作废邀请确认
          ========================================================================= */}
      <Modal
        isOpen={!!revokingInvite}
        onClose={() => setRevokingInvite(null)}
        title="作废企业邀请链接确认"
        description="此操作不可撤销，已生效的注册链接将立即被阻断"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <IconAlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              确定要作废批次 <strong>{revokingInvite?.note}</strong> 吗？
              作废后，任何尚未完成注册提交的成员将无法再加入企业（HTTP 410 失效）。
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setRevokingInvite(null)}
              className="btn btn-secondary text-xs"
            >
              放弃
            </button>
            <button
              onClick={() => {
                if (revokingInvite) {
                  revokeInvitation(revokingInvite.id);
                  toast.success("邀请链接已作废");
                  setRevokingInvite(null);
                }
              }}
              className="btn btn-danger text-xs"
            >
              确认作废
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
