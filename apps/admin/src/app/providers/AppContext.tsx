import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt?: string;
  isCurrentUser?: boolean;
}

export interface Invitation {
  id: string;
  token: string;
  presetRole: string;
  usageCount: number;
  usageLimit: number; // 1 for single, >1 for multi, -1 for unlimited
  creatorName: string;
  creatorId: string;
  expiresAt: string;
  status: "active" | "consumed" | "expired" | "revoked";
  note: string;
  whitelistEmail?: string;
  createdAt: string;
}

export interface PluginItem {
  id: string;
  name: string;
  version: string;
  description: string;
  category: "erp" | "system" | "tool";
  platforms: ("web" | "admin" | "app")[];
  dependencies: string[];
  platformStatus: "available" | "unavailable";
  myStatus: "enabled" | "disabled";
  author: string;
}

export interface SkillItem {
  id: string;
  code: string;
  name: string;
  version: string;
  hasDraftChanges: boolean;
  status: "active" | "disabled";
  category: string;
  tags: string[];
  content: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  domain: "my" | "platform" | "account";
  operator: string;
  action: string;
  target: string;
  result: "success" | "denied" | "failed";
  timestamp: string;
  ip: string;
  details: string;
}

export interface CompanyInfo {
  name: string;
  instanceId: string;
  version: string;
  status: string;
}

interface AppContextValue {
  // 认证与身份
  user: UserAccount | null;
  currentCompany: CompanyInfo;
  updateCompanyName: (name: string) => void;
  register: (data: {
    username: string;
    displayName?: string;
    email: string;
    phone: string;
    role: string;
    companyName?: string;
  }) => void;
  activeView: "business" | "platform";
  setActiveView: (view: "business" | "platform") => void;
  login: (email: string, role?: string) => void;
  logout: () => void;

  // 路由
  currentRoute: string;
  navigate: (path: string) => void;

  // 全局快捷指令
  isCmdKOpen: boolean;
  setCmdKOpen: (open: boolean) => void;

  // 数据集管理
  users: UserAccount[];
  updateUserStatus: (id: string, status: "active" | "disabled") => { ok: boolean; message?: string };
  updateUserProfile: (id: string, data: Partial<UserAccount>) => void;
  createUser: (data: Omit<UserAccount, "id" | "createdAt">) => void;

  invitations: Invitation[];
  createInvitation: (inv: Omit<Invitation, "id" | "token" | "usageCount" | "status" | "createdAt">) => Invitation;
  revokeInvitation: (id: string) => void;

  plugins: PluginItem[];
  toggleMyPlugin: (id: string) => { ok: boolean; message?: string };
  togglePlatformPlugin: (id: string) => { ok: boolean; message?: string };

  skills: SkillItem[];
  addSkill: (skill: Omit<SkillItem, "id" | "updatedAt">) => void;
  toggleSkillStatus: (id: string) => void;

  auditLogs: AuditLog[];
  addAuditLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const COMPANY_STORAGE_KEY = "modu_admin_company_info";

function getInitialCompany(): CompanyInfo {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(COMPANY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === "string") {
          return {
            name: parsed.name,
            instanceId: parsed.instanceId || "inst_modu_prod_01",
            version: parsed.version || "v1.0.0-rc2",
            status: parsed.status || "节点就绪",
          };
        }
      }
    } catch {
      // ignore
    }
  }
  return {
    name: "", // 默认不预置硬编码公司名，未填写时系统不展示公司名
    instanceId: "inst_modu_prod_01",
    version: "v1.0.0-rc2",
    status: "节点就绪",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. 当前登录账号（初始登录状态为系统管理员）
  const [user, setUser] = useState<UserAccount | null>({
    id: "usr_admin_001",
    username: "liming_admin",
    displayName: "李明",
    email: "liming@yourcompany.com",
    phone: "+86 13800138000",
    role: "系统超级管理员",
    status: "active",
    createdAt: "2026-09-01",
    isCurrentUser: true,
  });

  const [currentCompany, setCurrentCompany] = useState<CompanyInfo>(getInitialCompany);

  const [activeView, setActiveView] = useState<"business" | "platform">("business");
  const [isCmdKOpen, setCmdKOpen] = useState(false);

  // 2. 路由控制 (基于 location.hash 兼容开发与直接浏览)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || "/workspace";
  });

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // 3. 用户数据集
  const [users, setUsers] = useState<UserAccount[]>([
    {
      id: "usr_admin_001",
      username: "liming_admin",
      displayName: "李明",
      email: "liming@yourcompany.com",
      phone: "+86 13800138000",
      role: "系统超级管理员",
      status: "active",
      createdAt: "2026-09-01 10:00",
      lastLoginAt: "2026-10-11 16:50",
      isCurrentUser: true,
    },
    {
      id: "usr_ops_002",
      username: "wangfang_ops",
      displayName: "王芳",
      email: "wangfang@yourcompany.com",
      phone: "+86 13911223344",
      role: "平台运维管理员",
      status: "active",
      createdAt: "2026-09-05 14:20",
      lastLoginAt: "2026-10-10 18:30",
    },
    {
      id: "usr_biz_003",
      username: "zhangsan_dev",
      displayName: "张三",
      email: "zhangsan@yourcompany.com",
      phone: "+86 13788990011",
      role: "核心业务人员",
      status: "active",
      createdAt: "2026-09-12 09:15",
      lastLoginAt: "2026-10-11 11:45",
    },
    {
      id: "usr_biz_004",
      username: "lisi_audit",
      displayName: "李四",
      email: "lisi@yourcompany.com",
      phone: "+86 13622334455",
      role: "财务审计员",
      status: "disabled",
      createdAt: "2026-09-15 16:00",
      lastLoginAt: "2026-10-01 14:10",
    },
    {
      id: "usr_biz_005",
      username: "zhaoliu_analyst",
      displayName: "赵六",
      email: "zhaoliu@yourcompany.com",
      phone: "+86 13566778899",
      role: "普通业务成员",
      status: "active",
      createdAt: "2026-10-02 11:00",
      lastLoginAt: "2026-10-09 17:20",
    },
  ]);

  // 4. 邀请链接数据集
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: "inv_001",
      token: "inv_sec_9bf294a8e2",
      presetRole: "普通业务成员",
      usageCount: 4,
      usageLimit: 10,
      creatorName: "李明 (管理员)",
      creatorId: "usr_admin_001",
      expiresAt: "2026-10-18 18:00",
      status: "active",
      note: "Q4研发与业务协同新员工批次",
      createdAt: "2026-10-11 09:00",
    },
    {
      id: "inv_002",
      token: "inv_sec_8ca110bc55",
      presetRole: "财务审计员",
      usageCount: 1,
      usageLimit: 1,
      creatorName: "李明 (管理员)",
      creatorId: "usr_admin_001",
      expiresAt: "2026-10-15 12:00",
      status: "consumed",
      note: "财务专员专属单次绑定",
      whitelistEmail: "finance_lead@yourcompany.com",
      createdAt: "2026-10-08 15:30",
    },
    {
      id: "inv_003",
      token: "inv_sec_77ff129a00",
      presetRole: "临时查看者",
      usageCount: 0,
      usageLimit: 50,
      creatorName: "王芳 (运维)",
      creatorId: "usr_ops_002",
      expiresAt: "2026-10-08 00:00",
      status: "expired",
      note: "展会临时协同测试链接",
      createdAt: "2026-10-01 10:00",
    },
    {
      id: "inv_004",
      token: "inv_sec_10bb4e3391",
      presetRole: "普通业务成员",
      usageCount: 0,
      usageLimit: 1,
      creatorName: "李明 (管理员)",
      creatorId: "usr_admin_001",
      expiresAt: "2026-10-14 18:00",
      status: "revoked",
      note: "误填参数废弃批次",
      createdAt: "2026-10-07 14:15",
    },
  ]);

  // 5. 插件数据集
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: "plugin_crm",
      name: "客户与线索管理",
      version: "v0.4.2",
      description: "通用 ERP 客户主数据、商机漏斗与触达档案（独立资产存储）。",
      category: "erp",
      platforms: ["web", "admin", "app"],
      dependencies: [],
      platformStatus: "available",
      myStatus: "enabled",
      author: "Modu Official",
    },
    {
      id: "plugin_contracts",
      name: "合同与履约审计",
      version: "v0.3.1",
      description: "合同结构化归档、履约节点跟踪与审批流，依赖客户主数据。",
      category: "erp",
      platforms: ["web", "admin"],
      dependencies: ["plugin_crm"],
      platformStatus: "available",
      myStatus: "enabled",
      author: "Modu Official",
    },
    {
      id: "plugin_payments",
      name: "收付款与资金核对",
      version: "v0.2.8",
      description: "收付款计划排程、资金流水核对与开票绑定，依赖合同履约。",
      category: "erp",
      platforms: ["web", "admin"],
      dependencies: ["plugin_contracts"],
      platformStatus: "available",
      myStatus: "disabled",
      author: "Modu Official",
    },
    {
      id: "plugin_skills",
      name: "AI Skill 知识底座",
      version: "v1.0.0",
      description: "受控企业级 Skill 导入、生命周期发布与 Agent 对话指令映射。",
      category: "system",
      platforms: ["admin"],
      dependencies: [],
      platformStatus: "available",
      myStatus: "enabled",
      author: "Modu Platform",
    },
    {
      id: "plugin_analytics",
      name: "工业数据主权看板",
      version: "v0.1.0",
      description: "自托管实例资源开销、数据库事务吞吐量与审计聚合（开发中）。",
      category: "tool",
      platforms: ["admin"],
      dependencies: [],
      platformStatus: "unavailable",
      myStatus: "disabled",
      author: "Community Lab",
    },
  ]);

  // 6. Skill 数据集
  const [skills, setSkills] = useState<SkillItem[]>([
    {
      id: "sk_001",
      code: "contract-compliance-check",
      name: "合同条款合规性预审",
      version: "v2.1",
      hasDraftChanges: true,
      status: "active",
      category: "法务风控",
      tags: ["合规", "合同", "风控"],
      content: `# 合同条款合规性预审指令规范\n\n- 目标：自动审查合同草案中付款节点、违约金上限与管辖法院条款。\n- 限制：禁止访问未授权第三方外网，遵循单企业资产隔离。\n\n## 检查规则\n1. 逾期违约金比例不得超过日万分之五；\n2. 约定争议解决方式必须为合同履行地或本企业所在地法院。`,
      updatedAt: "2026-10-10 14:30",
    },
    {
      id: "sk_002",
      code: "crm-lead-enrichment",
      name: "客户线索智能清洗与归类",
      version: "v1.4",
      hasDraftChanges: false,
      status: "active",
      category: "客户协同",
      tags: ["CRM", "数据清洗"],
      content: `# 客户线索智能清洗规范\n\n提取非结构化邮件与名片信息，映射至 ERP 客户标准字段（公司全称、纳税人识别号、业务对接人）。`,
      updatedAt: "2026-10-09 11:20",
    },
    {
      id: "sk_003",
      code: "inventory-anomaly-detect",
      name: "库存盘点损耗预警计算",
      version: "v1.0",
      hasDraftChanges: false,
      status: "disabled",
      category: "仓储物流",
      tags: ["库存", "预警"],
      content: `# 仓储损耗预警计算规则\n\n比对实际入库与系统理论结存，超过 1.5% 自动生成内部复核待办。`,
      updatedAt: "2026-09-28 17:00",
    },
  ]);

  // 7. 分域审计数据集
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "aud_001",
      domain: "account",
      operator: "李明 (usr_admin_001)",
      action: "生成企业邀请链接",
      target: "批次: Q4研发与业务协同新员工批次",
      result: "success",
      timestamp: "2026-10-11 09:00:22",
      ip: "192.168.1.100",
      details: "生成预设角色 [普通业务成员]，限额 10 人，有效至 2026-10-18",
    },
    {
      id: "aud_002",
      domain: "platform",
      operator: "王芳 (usr_ops_002)",
      action: "平台开放插件",
      target: "AI Skill 知识底座 (v1.0.0)",
      result: "success",
      timestamp: "2026-10-10 16:45:10",
      ip: "192.168.1.104",
      details: "完成平台层依赖扫描无冲突，已变更为平台可用状态",
    },
    {
      id: "aud_003",
      domain: "account",
      operator: "李明 (usr_admin_001)",
      action: "停用系统账号",
      target: "李四 (usr_biz_004)",
      result: "success",
      timestamp: "2026-10-10 15:10:02",
      ip: "192.168.1.100",
      details: "财务审计员离职移交，阻断现有会话与后续请求，资产保留",
    },
    {
      id: "aud_004",
      domain: "my",
      operator: "李明 (usr_admin_001)",
      action: "编辑 Skill 草稿",
      target: "合同条款合规性预审 (v2.1)",
      result: "success",
      timestamp: "2026-10-10 14:30:19",
      ip: "192.168.1.100",
      details: "更新争议解决条款白名单与违约金上限规则",
    },
    {
      id: "aud_005",
      domain: "account",
      operator: "王芳 (usr_ops_002)",
      action: "尝试停用最后一个超管账号",
      target: "李明 (usr_admin_001)",
      result: "denied",
      timestamp: "2026-10-09 18:22:45",
      ip: "192.168.1.104",
      details: "触发防锁死保护机制：系统必须保留至少一个具备账号管理权限的活动管理员",
    },
  ]);

  // 方法实现
  const login = (email: string, role = "系统超级管理员") => {
    setUser({
      id: "usr_login_new",
      username: email.split("@")[0],
      displayName: email.split("@")[0],
      email,
      phone: "+86 13800138000",
      role,
      status: "active",
      createdAt: "2026-10-11",
      isCurrentUser: true,
    });
    navigate("/workspace");
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  const updateUserStatus = (id: string, status: "active" | "disabled") => {
    // 防锁死保护：不能停用本人或最后一个有效管理员
    const target = users.find((u) => u.id === id);
    if (!target) return { ok: false, message: "用户不存在" };

    if (target.isCurrentUser && status === "disabled") {
      return { ok: false, message: "安全防锁死保护：当前登录账号无法自我停用" };
    }

    const activeAdmins = users.filter((u) => u.role.includes("管理员") && u.status === "active");
    if (activeAdmins.length <= 1 && target.role.includes("管理员") && status === "disabled") {
      return { ok: false, message: "防锁死拒绝：系统必须保留至少一个处于活动状态的管理账号" };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );

    addAuditLog({
      domain: "account",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: status === "active" ? "启用账号" : "停用账号",
      target: `${target.displayName} (${target.id})`,
      result: "success",
      ip: "127.0.0.1",
      details: `账号状态变更为 [${status === "active" ? "生效中" : "已停用"}]`,
    });

    return { ok: true };
  };

  const updateUserProfile = (id: string, data: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    addAuditLog({
      domain: "account",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: "修改用户资料",
      target: `用户 ID: ${id}`,
      result: "success",
      ip: "127.0.0.1",
      details: `更新资料字段: ${Object.keys(data).join(", ")}`,
    });
  };

  const createUser = (data: Omit<UserAccount, "id" | "createdAt">) => {
    const newUser: UserAccount = {
      ...data,
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setUsers((prev) => [newUser, ...prev]);
    addAuditLog({
      domain: "account",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: "手动创建账号",
      target: `${newUser.displayName} (${newUser.username})`,
      result: "success",
      ip: "127.0.0.1",
      details: `赋予角色: [${newUser.role}]，邮箱: ${newUser.email}`,
    });
  };

  const createInvitation = (
    invData: Omit<Invitation, "id" | "token" | "usageCount" | "status" | "createdAt">
  ): Invitation => {
    const token = `inv_sec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
    const newInv: Invitation = {
      ...invData,
      id: `inv_${Math.random().toString(36).substring(2, 7)}`,
      token,
      usageCount: 0,
      status: "active",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setInvitations((prev) => [newInv, ...prev]);
    addAuditLog({
      domain: "account",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: "生成企业邀请链接",
      target: `备注: ${newInv.note}`,
      result: "success",
      ip: "127.0.0.1",
      details: `预设角色: [${newInv.presetRole}]，限额: ${newInv.usageLimit} 人，Token: ${token}`,
    });
    return newInv;
  };

  const revokeInvitation = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "revoked" } : inv))
    );
    addAuditLog({
      domain: "account",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: "作废企业邀请链接",
      target: `邀请 ID: ${id}`,
      result: "success",
      ip: "127.0.0.1",
      details: "管理员主动作废，Token 即刻失效，后续请求将返回 410",
    });
  };

  const toggleMyPlugin = (id: string) => {
    const p = plugins.find((item) => item.id === id);
    if (!p) return { ok: false, message: "插件未找到" };

    if (p.platformStatus === "unavailable") {
      return { ok: false, message: "该插件平台尚未开放，本人无法启用" };
    }

    if (p.myStatus === "disabled") {
      // 检查依赖插件是否本人已启用
      for (const depId of p.dependencies) {
        const depPlugin = plugins.find((item) => item.id === depId);
        if (!depPlugin || depPlugin.myStatus !== "enabled") {
          return {
            ok: false,
            message: `依赖前置插件 [${depPlugin?.name || depId}] 尚未启用，请先启用依赖项`,
          };
        }
      }
    } else {
      // 检查是否有其他已启用插件依赖于我
      const dependents = plugins.filter(
        (item) => item.myStatus === "enabled" && item.dependencies.includes(p.id)
      );
      if (dependents.length > 0) {
        return {
          ok: false,
          message: `无法停用：插件 [${dependents.map((d) => d.name).join(", ")}] 依赖于此插件，请先停用下游插件`,
        };
      }
    }

    const nextStatus = p.myStatus === "enabled" ? "disabled" : "enabled";
    setPlugins((prev) =>
      prev.map((item) => (item.id === id ? { ...item, myStatus: nextStatus } : item))
    );
    addAuditLog({
      domain: "my",
      operator: `${user?.displayName || "本人"}`,
      action: nextStatus === "enabled" ? "启用个人插件" : "停用个人插件",
      target: `${p.name} (${p.id})`,
      result: "success",
      ip: "127.0.0.1",
      details: `插件本人状态变更为 [${nextStatus === "enabled" ? "已启用" : "已停用"}]`,
    });
    return { ok: true };
  };

  const togglePlatformPlugin = (id: string) => {
    const p = plugins.find((item) => item.id === id);
    if (!p) return { ok: false, message: "插件未找到" };

    if (p.platformStatus === "available") {
      // 平台停用检查依赖
      const dependents = plugins.filter(
        (item) => item.platformStatus === "available" && item.dependencies.includes(p.id)
      );
      if (dependents.length > 0) {
        return {
          ok: false,
          message: `平台无法停用：[${dependents.map((d) => d.name).join(", ")}] 依赖此插件`,
        };
      }
    }

    const nextStatus = p.platformStatus === "available" ? "unavailable" : "available";
    setPlugins((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              platformStatus: nextStatus,
              // 如果平台停用，本人自动失活
              myStatus: nextStatus === "unavailable" ? "disabled" : item.myStatus,
            }
          : item
      )
    );
    addAuditLog({
      domain: "platform",
      operator: `${user?.displayName || "管理员"}`,
      action: nextStatus === "available" ? "平台开放插件" : "平台停用插件",
      target: `${p.name} (${p.id})`,
      result: "success",
      ip: "127.0.0.1",
      details: `平台开放状态变更为 [${nextStatus === "available" ? "已开放" : "已下架"}]`,
    });
    return { ok: true };
  };

  const addSkill = (newSkill: Omit<SkillItem, "id" | "updatedAt">) => {
    const skill: SkillItem = {
      ...newSkill,
      id: `sk_${Math.random().toString(36).substring(2, 7)}`,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    setSkills((prev) => [skill, ...prev]);
    addAuditLog({
      domain: "my",
      operator: `${user?.displayName || "本人"}`,
      action: "导入 Skill 资产",
      target: `${skill.name} (${skill.code})`,
      result: "success",
      ip: "127.0.0.1",
      details: `分类: ${skill.category}，版本: ${skill.version}，生成内容草稿`,
    });
  };

  const toggleSkillStatus = (id: string) => {
    setSkills((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "disabled" : "active" }
          : s
      )
    );
  };

  const addAuditLog = (logData: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...logData,
      id: `aud_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateCompanyName = (name: string) => {
    const trimmed = name.trim();
    setCurrentCompany((prev) => {
      const next = { ...prev, name: trimmed };
      try {
        localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    addAuditLog({
      domain: "platform",
      operator: `${user?.displayName || "系统"} (${user?.id || ""})`,
      action: "更新企业全称",
      target: trimmed ? `企业名称: ${trimmed}` : "清空企业名称",
      result: "success",
      ip: "127.0.0.1",
      details: trimmed
        ? `管理员更新企业注册全称为 [${trimmed}]`
        : "管理员清空企业名称，系统全局转为不展示企业名模式",
    });
  };

  const register = (data: {
    username: string;
    displayName?: string;
    email: string;
    phone: string;
    role: string;
    companyName?: string;
  }) => {
    const newUser: UserAccount = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      username: data.username,
      displayName: data.displayName || data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: "active",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      lastLoginAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      isCurrentUser: true,
    };

    if (data.companyName !== undefined) {
      const trimmed = data.companyName.trim();
      setCurrentCompany((prev) => {
        const next = { ...prev, name: trimmed };
        try {
          localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }

    setUser(newUser);
    setUsers((prev) => [newUser, ...prev]);

    addAuditLog({
      domain: "account",
      operator: `${newUser.displayName} (${newUser.id})`,
      action: data.role.includes("管理员") ? "注册管理员账号" : "受邀注册账号",
      target: `${newUser.displayName} (${newUser.email})`,
      result: "success",
      ip: "127.0.0.1",
      details: data.companyName?.trim()
        ? `完成注册并绑定角色 [${data.role}]，登记企业全称 [${data.companyName.trim()}]`
        : `完成注册并绑定角色 [${data.role}]，未填写企业名称（不展示企业名）`,
    });

    navigate("/workspace");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentCompany,
        updateCompanyName,
        register,
        activeView,
        setActiveView,
        login,
        logout,
        currentRoute,
        navigate,
        isCmdKOpen,
        setCmdKOpen,
        users,
        updateUserStatus,
        updateUserProfile,
        createUser,
        invitations,
        createInvitation,
        revokeInvitation,
        plugins,
        toggleMyPlugin,
        togglePlatformPlugin,
        skills,
        addSkill,
        toggleSkillStatus,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
