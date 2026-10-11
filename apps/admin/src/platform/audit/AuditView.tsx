import React, { useState } from "react";
import { useApp } from "../../app/providers/AppContext";
import { Badge } from "../../shared/components/Badge";
import {
  IconSearch,
  IconActivity,
  IconShield,
  IconUsers,
  IconLayers,
} from "../../shared/components/Icons";

export function AuditView() {
  const { auditLogs } = useApp();
  const [domainFilter, setDomainFilter] = useState<"all" | "account" | "platform" | "my">("all");
  const [search, setSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filtered = auditLogs.filter((log) => {
    const matchDomain = domainFilter === "all" || log.domain === domainFilter;
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.operator.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchDomain && matchSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-950 tracking-tight m-0">
          系统分域安全审计日志
        </h1>
        <p className="text-sm text-zinc-500 mt-1 mb-0">
          严格按照“系统账号维护”、“平台插件”与“本人业务操作”三大独立域隔离审计。绝不把他人个人业务正文混入全局日志。
        </p>
      </div>

      {/* 分域 Tab 切换胶囊 */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 pb-2">
        <button
          onClick={() => setDomainFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            domainFilter === "all"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconLayers size={14} />
          <span>全部审计域 ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setDomainFilter("account")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            domainFilter === "account"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconUsers size={14} />
          <span>系统账号维护域</span>
        </button>

        <button
          onClick={() => setDomainFilter("platform")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            domainFilter === "platform"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconShield size={14} />
          <span>平台插件管理域</span>
        </button>

        <button
          onClick={() => setDomainFilter("my")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
            domainFilter === "my"
              ? "tab-pill-active"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <IconActivity size={14} />
          <span>本人业务操作域</span>
        </button>
      </div>

      {/* 搜索工具条 */}
      <div className="card p-4 mb-6 bg-white border border-zinc-200 rounded-xl shadow-elevation-1 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="搜索操作人、动作类型或审计详情..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-control text-xs pl-9 pr-3 py-1.5 h-8 w-full"
          />
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          匹配记录：{filtered.length} 条
        </div>
      </div>

      {/* 日志表格 */}
      <div className="card bg-white border border-zinc-200 rounded-xl shadow-elevation-1 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <th className="py-3 px-4">时间戳</th>
              <th className="py-3 px-4">审计域</th>
              <th className="py-3 px-4">操作人 (身份)</th>
              <th className="py-3 px-4">动作类型</th>
              <th className="py-3 px-4">操作对象</th>
              <th className="py-3 px-4">执行结果</th>
              <th className="py-3 px-4 text-right">详情</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-zinc-800">
            {filtered.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-zinc-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {log.domain === "account" && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          账号维护
                        </span>
                      )}
                      {log.domain === "platform" && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                          平台插件
                        </span>
                      )}
                      {log.domain === "my" && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          本人操作
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs font-medium text-zinc-900">
                      {log.operator}
                    </td>

                    <td className="py-3 px-4 text-xs font-semibold text-zinc-950">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-xs text-zinc-600 font-mono">
                      {log.target}
                    </td>

                    <td className="py-3 px-4">
                      {log.result === "success" && (
                        <Badge variant="success">[状态: 成功]</Badge>
                      )}
                      {log.result === "denied" && (
                        <Badge variant="warning">[状态: 防锁死拒绝]</Badge>
                      )}
                      {log.result === "failed" && (
                        <Badge variant="danger">[状态: 失败]</Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="btn-ghost btn-sm text-xs text-zinc-600 hover:text-zinc-950"
                      >
                        {isExpanded ? "收起" : "展开"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-zinc-50/80">
                      <td colSpan={7} className="p-4 border-b border-zinc-200">
                        <div className="p-3 bg-white border border-zinc-200 rounded-lg text-xs space-y-1.5 font-mono">
                          <div className="text-zinc-500">
                            操作 IP 来源：<span className="text-zinc-900">{log.ip}</span>
                          </div>
                          <div className="text-zinc-500">
                            审计说明：<span className="text-zinc-800">{log.details}</span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-2">
                            * 零凭证保密规范：审计记录严格隐藏敏感密码散列、OAuth 密钥与个人业务正文。
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
