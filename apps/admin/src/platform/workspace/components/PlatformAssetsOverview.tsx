import React from "react";
import type { EChartsOption } from "echarts";
import { useApp } from "../../../app/providers/AppContext";
import { TiltCard } from "../../../shared/components/TiltCard";
import { AnimatedNumber } from "../../../shared/components/AnimatedNumber";
import { EChartsCard } from "../../../shared/components/EChartsCard";
import {
  IconPuzzle,
  IconSparkles,
  IconUsers,
  IconDatabase,
  IconLayers,
  IconArrowRight,
  IconShieldCheck,
} from "../../../shared/components/Icons";

export function PlatformAssetsOverview() {
  const { plugins, skills, users, navigate, activeView } = useApp();

  const enabledPluginsCount = plugins.filter((p) => p.myStatus === "enabled").length;
  const availablePluginsCount = plugins.filter((p) => p.platformStatus === "available").length;
  const activeSkillsCount = skills.filter((s) => s.status === "active").length;
  const activeUsersCount = users.filter((u) => u.status === "active").length;

  // 1. ECharts 资产多维分类构成环形图
  const assetDistributionOption: EChartsOption = {
    tooltip: {
      trigger: "item" as const,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "transparent",
      textStyle: { color: "#f8fafc", fontSize: 12 },
      formatter: "{b}: {c} 项 ({d}%)",
    },
    legend: {
      orient: "horizontal" as const,
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: "#64748b", fontSize: 11 },
    },
    series: [
      {
        name: "平台核心资产分布",
        type: "pie",
        radius: ["52%", "74%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: "bold",
            color: "#0f172a",
            formatter: "{b}\n{c} 项",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: plugins.length, name: "平台插件生态资产", itemStyle: { color: "#2563eb" } },
          { value: skills.length, name: "Skill 知识指令资产", itemStyle: { color: "#8b5cf6" } },
          { value: users.length, name: "成员席位与组织资产", itemStyle: { color: "#0ea5e9" } },
          { value: 6, name: "独立自托管底座数据节点", itemStyle: { color: "#10b981" } },
        ],
      },
    ],
  };

  // 2. ECharts 各类资产近 7 天调度吞吐活跃度 (柱状/走势图)
  const assetActivityOption: EChartsOption = {
    tooltip: {
      trigger: "axis" as const,
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "transparent",
      textStyle: { color: "#f8fafc", fontSize: 12 },
      axisPointer: { type: "shadow" as const },
    },
    legend: {
      right: 10,
      top: 0,
      itemWidth: 10,
      itemHeight: 8,
      textStyle: { color: "#64748b", fontSize: 11 },
      data: ["插件调用频次", "Skill 智能流转", "底座数据读写"],
    },
    grid: {
      top: 36,
      right: 12,
      bottom: 24,
      left: 36,
    },
    xAxis: {
      type: "category" as const,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      axisLine: { lineStyle: { color: "#e2e8f0" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    yAxis: {
      type: "value" as const,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#f1f5f9" } },
      axisLabel: { color: "#64748b", fontSize: 11 },
    },
    series: [
      {
        name: "插件调用频次",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        itemStyle: { color: "#2563eb", borderRadius: [0, 0, 0, 0] },
        data: [120, 182, 191, 234, 290, 160, 210],
      },
      {
        name: "Skill 智能流转",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#8b5cf6", borderRadius: [0, 0, 0, 0] },
        data: [80, 110, 140, 170, 210, 95, 130],
      },
      {
        name: "底座数据读写",
        type: "bar",
        stack: "total",
        itemStyle: { color: "#0ea5e9", borderRadius: [4, 4, 0, 0] },
        data: [60, 72, 85, 90, 110, 50, 75],
      },
    ],
  };

  return (
    <div className="mb-8">
      {/* 模块标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
            <IconLayers size={16} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
              平台资产全景与资源大盘
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              集中审计插件生态储备、企业专属 Skill 资产、席位配额与自托管存储健康度
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(activeView === "platform" ? "/platform/plugins" : "/my/plugins")}
          className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          <span>查看完整插件与资产目录</span>
          <IconArrowRight size={13} />
        </button>
      </div>

      {/* 1. 四大资产卡片组 (使用 TiltCard 3D 物理倾斜 + AnimatedNumber 数字动画) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* 卡片 1: 插件资产 */}
        <TiltCard
          variant="glass"
          onClick={() => navigate(activeView === "platform" ? "/platform/plugins" : "/my/plugins")}
          className="p-4.5 cursor-pointer active:scale-[0.985] transition-transform duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">
              插件生态资产 ({activeView === "platform" ? "平台开放" : "已启用"})
            </span>
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <IconPuzzle size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              <AnimatedNumber
                value={
                  activeView === "platform" ? availablePluginsCount : enabledPluginsCount
                }
              />
            </span>
            <span className="text-xs text-zinc-500">款 / 总登记 {plugins.length} 款</span>
          </div>
          <div className="mt-2 text-xs text-brand-600 font-medium flex items-center justify-between">
            <span>
              {activeView === "platform" ? "全平台插件集中管控" : `平台共开放 ${availablePluginsCount} 款`}
            </span>
            <span className="text-zinc-400 group-hover:text-brand-600 transition-colors">-&gt;</span>
          </div>
        </TiltCard>

        {/* 卡片 2: Skill 规则知识资产 */}
        <TiltCard
          variant="glass"
          onClick={() => navigate("/skills")}
          className="p-4.5 cursor-pointer active:scale-[0.985] transition-transform duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Skill 规则知识资产</span>
            <div className="p-1.5 rounded-md bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
              <IconSparkles size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              <AnimatedNumber value={activeSkillsCount} />
            </span>
            <span className="text-xs text-zinc-500">项激活 / 总库 {skills.length} 项</span>
          </div>
          <div className="mt-2 text-xs text-violet-600 font-medium flex items-center justify-between">
            <span>包含 1 项待发布草稿变更</span>
            <span className="text-zinc-400 group-hover:text-violet-600 transition-colors">-&gt;</span>
          </div>
        </TiltCard>

        {/* 卡片 3: 组织与授权席位 */}
        <TiltCard
          variant="glass"
          onClick={() => navigate("/system/users")}
          className="p-4.5 cursor-pointer active:scale-[0.985] transition-transform duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">组织授权席位资产</span>
            <div className="p-1.5 rounded-md bg-sky-50 text-sky-600 group-hover:scale-105 transition-transform">
              <IconUsers size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              <AnimatedNumber value={activeUsersCount} />
            </span>
            <span className="text-xs text-zinc-500">人就绪 / 授权上限 50 席</span>
          </div>
          <div className="mt-2 text-xs text-sky-600 font-medium flex items-center justify-between">
            <span>当前活跃邀请 1 批次</span>
            <span className="text-zinc-400 group-hover:text-sky-600 transition-colors">-&gt;</span>
          </div>
        </TiltCard>

        {/* 卡片 4: 数据库与存储底座 */}
        <TiltCard
          variant="glass"
          onClick={() => navigate("/system/audit")}
          className="p-4.5 cursor-pointer active:scale-[0.985] transition-transform duration-150 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">自托管数据与存储资产</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <IconDatabase size={16} />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-900 tracking-tight">
              32.4
            </span>
            <span className="text-xs text-zinc-500">GB / 100 GB 独立配额</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <IconShieldCheck size={12} />
              数据主权 100% 本地自控
            </span>
            <span className="text-zinc-400 group-hover:text-emerald-600 transition-colors">-&gt;</span>
          </div>
        </TiltCard>
      </div>

      {/* 2. ECharts 可视化图表双联栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：资产多维分布构成环形图 (占比 5 栏) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                企业平台资产构成分布
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                四大核心资产类别配比（ECharts 环形占比图）
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center pt-2">
            <EChartsCard option={assetDistributionOption} height={250} />
          </div>
        </div>

        {/* 右侧：资产周调度活跃与吞吐大盘 (占比 7 栏) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200/80 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                资产调用频次与吞吐活跃度
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                近 7 天插件调度、Skill 触发与底座读写趋势（ECharts 堆叠柱状图）
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/60">
              总调度 2,840 次/周
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center pt-2">
            <EChartsCard option={assetActivityOption} height={250} />
          </div>
        </div>
      </div>
    </div>
  );
}
