import React, { useState } from "react";
import { useApp } from "../../../app/providers/AppContext";
import { useToast } from "../../../shared/components/Toast";
import { Badge } from "../../../shared/components/Badge";
import { EChartsCard } from "../../../shared/components/EChartsCard";
import {
  IconCheck,
  IconCheckCircle2,
  IconClock,
  IconAlertTriangle,
  IconArrowRight,
  IconFilter,
  IconShieldAlert,
  IconPuzzle,
  IconSparkles,
  IconUsers,
  IconServer,
  IconRefresh,
} from "../../../shared/components/Icons";

export interface ActionTodoItem {
  id: string;
  title: string;
  category: "audit" | "plugin" | "skill" | "user" | "system";
  priority: "high" | "medium" | "low";
  status: "pending" | "processing" | "completed";
  dueOrCreated: string;
  description: string;
  actionLabel: string;
  targetRoute?: string;
}

const INITIAL_TODOS: ActionTodoItem[] = [
  {
    id: "todo-1",
    title: "第三方外部 Skill「智能合同审查助手」导入合规审核",
    category: "skill",
    priority: "high",
    status: "pending",
    dueOrCreated: "10分钟前",
    description: "来自法务团队的导入申请，需复核本地沙箱执行权限与外网访问白名单。",
    actionLabel: "立即复核",
    targetRoute: "/skills",
  },
  {
    id: "todo-2",
    title: "企业成员邀请批次席位配额即将耗尽 (已用 80%)",
    category: "user",
    priority: "medium",
    status: "pending",
    dueOrCreated: "35分钟前",
    description: "当前批次受控邀请剩余可用席位 2 个，建议提前调增配额或归档失效链接。",
    actionLabel: "管理邀请",
    targetRoute: "/system/invites",
  },
  {
    id: "todo-3",
    title: "检测到 1 次非信任 IP 越权防锁死拦截记录待确认",
    category: "audit",
    priority: "high",
    status: "processing",
    dueOrCreated: "2小时前",
    description: "安全网关已自动阻断并入库，待平台管理员复核访问源指纹并归档。",
    actionLabel: "查看审计",
    targetRoute: "/system/audit",
  },
  {
    id: "todo-4",
    title: "平台官方插件「CRM 客户管理」v1.2.0 安全补丁就绪",
    category: "plugin",
    priority: "medium",
    status: "pending",
    dueOrCreated: "4小时前",
    description: "包含数据脱敏过滤补丁与字段级加密升级，建议适时安排灰度更新测试。",
    actionLabel: "查看插件",
    targetRoute: "/platform/plugins",
  },
  {
    id: "todo-5",
    title: "自托管独立节点数据库 WAL 日志持久化每日巡检",
    category: "system",
    priority: "low",
    status: "completed",
    dueOrCreated: "今日 06:00",
    description: "自动化快照与 PostgreSQL 索引一致性校验完成，各项存储健康度 100%。",
    actionLabel: "已完成",
    targetRoute: "/workspace",
  },
];

export function TodoActionCenter() {
  const { navigate } = useApp();
  const toast = useToast();
  const [todos, setTodos] = useState<ActionTodoItem[]>(INITIAL_TODOS);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "processing" | "completed">("all");

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const processingCount = todos.filter((t) => t.status === "processing").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  const filteredTodos = todos.filter((t) => {
    if (activeFilter === "all") return true;
    return t.status === activeFilter;
  });

  const handleToggleStatus = (id: string) => {
    setTodos((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = item.status === "completed" ? "pending" : "completed";
        if (newStatus === "completed") {
          toast.success(`待办「${item.title.slice(0, 14)}...」已标记完成`);
        } else {
          toast.info(`待办「${item.title.slice(0, 14)}...」已重新开启`);
        }
        return {
          ...item,
          status: newStatus,
          actionLabel: newStatus === "completed" ? "已完成" : "去处理",
        };
      })
    );
  };

  const handleItemAction = (item: ActionTodoItem) => {
    if (item.status === "completed") {
      handleToggleStatus(item.id);
      return;
    }
    if (item.targetRoute) {
      toast.info(`正在跳转至相关处理模块...`);
      navigate(item.targetRoute);
    } else {
      handleToggleStatus(item.id);
    }
  };

  const getCategoryIcon = (category: ActionTodoItem["category"]) => {
    switch (category) {
      case "audit":
        return <IconShieldAlert size={14} className="text-amber-600" />;
      case "plugin":
        return <IconPuzzle size={14} className="text-blue-600" />;
      case "skill":
        return <IconSparkles size={14} className="text-violet-600" />;
      case "user":
        return <IconUsers size={14} className="text-emerald-600" />;
      case "system":
      default:
        return <IconServer size={14} className="text-zinc-600" />;
    }
  };

  const getPriorityBadge = (priority: ActionTodoItem["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4.5 font-medium">
            高优先级
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4.5 font-medium">
            中优先级
          </Badge>
        );
      case "low":
      default:
        return (
          <Badge variant="neutral" className="text-[10px] px-1.5 py-0 h-4.5 font-medium">
            普通
          </Badge>
        );
    }
  };

  // 近 7 天待办产生与处理时效趋势图配置 (ECharts)
  const trendOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "transparent",
      textStyle: { color: "#f8fafc", fontSize: 12 },
      axisPointer: {
        type: "line",
        lineStyle: { color: "#94a3b8", width: 1, type: "dashed" },
      },
    },
    legend: {
      right: 10,
      top: 0,
      itemWidth: 12,
      itemHeight: 8,
      textStyle: { color: "#64748b", fontSize: 11 },
      data: ["新增待办事项", "已办结事项"],
    },
    grid: {
      top: 36,
      right: 12,
      bottom: 24,
      left: 36,
    },
    xAxis: {
      type: "category",
      data: ["10-05", "10-06", "10-07", "10-08", "10-09", "10-10", "10-11 (今日)"],
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    series: [
      {
        name: "新增待办事项",
        type: "line",
        smooth: true,
        data: [4, 6, 3, 7, 5, 4, 3],
        itemStyle: { color: "#2563eb" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(37, 99, 235, 0.28)" },
              { offset: 1, color: "rgba(37, 99, 235, 0.02)" },
            ],
          },
        },
      },
      {
        name: "已办结事项",
        type: "line",
        smooth: true,
        data: [3, 5, 4, 6, 6, 5, 4],
        itemStyle: { color: "#10b981" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.24)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.02)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* 左侧：待办与处理清单 (占比 7 栏) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* 顶部标题栏与筛选标签 */}
        <div className="px-5 py-4 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200/60 flex items-center justify-center text-brand-600">
              <IconClock size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">待办与处理中心</h2>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200">
                    {pendingCount} 项待处理
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                汇聚插件合规审查、权限审批、系统告警与运维待办事宜
              </p>
            </div>
          </div>

          {/* 筛选切换药丸 */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-100/90 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                activeFilter === "all"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              全部 ({todos.length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                activeFilter === "pending"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              待办 ({pendingCount})
            </button>
            <button
              onClick={() => setActiveFilter("processing")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                activeFilter === "processing"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              处理中 ({processingCount})
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                activeFilter === "completed"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              已办结 ({completedCount})
            </button>
          </div>
        </div>

        {/* 待办列表主体 */}
        <div className="divide-y divide-zinc-100 flex-1 overflow-y-auto max-h-[380px]">
          {filteredTodos.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              当前分类下暂无待处理事项
            </div>
          ) : (
            filteredTodos.map((item) => {
              const isDone = item.status === "completed";
              return (
                <div
                  key={item.id}
                  className={`p-4 transition-colors flex items-start justify-between gap-3 group hover:bg-zinc-50/70 ${
                    isDone ? "bg-zinc-50/30 opacity-75" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* 完成复选勾选球 */}
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                        isDone
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-zinc-300 hover:border-brand-500 bg-white"
                      }`}
                      title={isDone ? "点击重新开启" : "点击标记完成"}
                    >
                      {isDone && <IconCheck size={11} strokeWidth={2.5} />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold tracking-tight ${
                            isDone ? "line-through text-zinc-400" : "text-zinc-900"
                          }`}
                        >
                          {item.title}
                        </span>
                        {getPriorityBadge(item.priority)}
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          {getCategoryIcon(item.category)}
                          {item.dueOrCreated}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isDone ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* 右侧动作按钮 */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleItemAction(item)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1 transition-all ${
                        isDone
                          ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          : "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/70"
                      }`}
                    >
                      <span>{item.actionLabel}</span>
                      {!isDone && <IconArrowRight size={12} />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部摘要栏 */}
        <div className="px-5 py-2.5 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>
            待办总计 {todos.length} 项 · 剩余待办{" "}
            <strong className="text-brand-600 font-semibold">{pendingCount}</strong> 项
          </span>
          <span className="text-zinc-400">处理进度：{Math.round((completedCount / todos.length) * 100)}%</span>
        </div>
      </div>

      {/* 右侧：近 7 天待办处理效能 ECharts 图表 (占比 5 栏) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-zinc-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">待办流转效能分析</h3>
            <p className="text-xs text-zinc-500 mt-0.5">近 7 天新增事项 vs 办结走势（ECharts 折线图）</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            <IconCheckCircle2 size={12} />
            办结率稳步攀升
          </span>
        </div>

        {/* ECharts 图表容器 */}
        <div className="flex-1 flex flex-col justify-center pt-2">
          <EChartsCard option={trendOption} height={260} />
        </div>

        {/* 关键效能小指标 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 mt-2 text-center">
          <div className="p-2 rounded-lg bg-zinc-50">
            <div className="text-[11px] text-zinc-500">平均办结耗时</div>
            <div className="text-sm font-bold text-zinc-900 mt-0.5">18 分钟</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50">
            <div className="text-[11px] text-zinc-500">今日已办结</div>
            <div className="text-sm font-bold text-emerald-600 mt-0.5">4 件</div>
          </div>
          <div className="p-2 rounded-lg bg-zinc-50">
            <div className="text-[11px] text-zinc-500">风险拦截闭环</div>
            <div className="text-sm font-bold text-blue-600 mt-0.5">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
