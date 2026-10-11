import React from "react";
import { useApp } from "../../app/providers/AppContext";
import {
  IconFileText,
  IconShield,
  IconZap,
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
} from "../../shared/components/Icons";

export function PluginInstallGuide() {
  const { navigate } = useApp();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* 返回按钮 */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/platform/plugins")}
          className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
        >
          <IconArrowLeft size={14} />
          <span>返回平台插件管理</span>
        </button>
      </div>

      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
          插件受控引入与构建规范
        </h1>
        <p className="text-sm text-zinc-500 mt-1 mb-0">
          第一阶段引入规范说明文档。Modu ERP 采用受控构建部署策略，杜绝任意远程未校验 JS 代码在浏览器中动态执行。
        </p>
      </div>

      {/* 核心原则警示卡片 */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 flex items-start gap-3 text-xs text-emerald-900 leading-relaxed">
        <IconShield size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong>零信任与宿主隔离原则：</strong>
          当前管理后台（`apps/admin`）与后端（`apps/api`）独立交付。所有官方与扩展业务插件代码均随宿主工程经受控流水线静态编译发布。
          平台暂不支持在线任意上传未签名的第三方代码包，以确保企业自托管实例的数据主权绝对安全。
        </div>
      </div>

      {/* 规范板块 */}
      <div className="space-y-6">
        {/* 板块 1: 插件生命周期三维度模型 */}
        <div className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1">
          <h2 className="text-base font-bold text-zinc-950 m-0 mb-3 flex items-center gap-2">
            <IconZap size={16} className="text-brand-600" />
            <span>1. 插件状态三维度解耦设计</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed mb-4">
            为防止“一人安装影响全公司”或“停用插件误删数据”，系统严格将插件状态拆解为三个独立正交维度：
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="font-semibold text-zinc-900 mb-1">① 宿主构建状态 (Build)</div>
              <div className="text-zinc-500">
                插件代码是否已打包进当前 Docker 镜像与前端产物。未构建的插件不会出现在任何菜单。
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="font-semibold text-zinc-900 mb-1">② 平台开放状态 (Platform)</div>
              <div className="text-zinc-500">
                由平台管理员控制。决定该插件是否对当前实例的所有成员可见与可用，不覆盖个人配置。
              </div>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
              <div className="font-semibold text-zinc-900 mb-1">③ 本人启用状态 (User Scope)</div>
              <div className="text-zinc-500">
                由普通用户在“我的插件”自主启用。本人停用仅隐藏本人视图，不影响他人，数据保留。
              </div>
            </div>
          </div>
        </div>

        {/* 板块 2: 规范清单 (Manifest Schema) */}
        <div className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1">
          <h2 className="text-base font-bold text-zinc-950 m-0 mb-3 flex items-center gap-2">
            <IconFileText size={16} className="text-brand-600" />
            <span>2. 插件注册清单规范 (Manifest Specification)</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed mb-3">
            每个独立插件必须在所属应用目录提供本地注册契约文件，例如 `apps/admin/src/modules/[plugin]/manifest.ts`：
          </p>

          <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
{`export interface PluginManifest {
  id: string;               // 唯一插件标识，例如 'plugin_crm'
  name: string;             // 展示名称，例如 '客户管理'
  version: string;          // 语义化版本号，例如 'v0.4.2'
  category: 'erp' | 'tool'; // 业务类别
  platforms: ('admin')[];   // 适配客户端端标
  dependencies: string[];   // 前置依赖插件 ID 清单
  permissions: string[];    // 所需权限点，由管理员受控授予
  migrations?: string[];    // 数据库版本化迁移脚本记录
}`}
          </pre>
        </div>

        {/* 板块 3: 未来阶段受控安装向导流转 */}
        <div className="card p-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1">
          <h2 className="text-base font-bold text-zinc-950 m-0 mb-3 flex items-center gap-2">
            <IconShield size={16} className="text-brand-600" />
            <span>3. 第二阶段：受控在线安装向导演进路径</span>
          </h2>
          <p className="text-xs text-zinc-600 leading-relaxed mb-4">
            在后端具备 Asynq 幂等任务队列、包校验与数据库双向审计能力后，将开放五步受控部署向导：
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-700">
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
              [1 来源验证]
            </span>
            <span>-&gt;</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
              [2 包体签名与依赖扫描]
            </span>
            <span>-&gt;</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
              [3 权限变更与数据备份核对]
            </span>
            <span>-&gt;</span>
            <span className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
              [4 管理员审批发布]
            </span>
            <span>-&gt;</span>
            <span className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200">
              [5 异步执行与迁移回滚]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
