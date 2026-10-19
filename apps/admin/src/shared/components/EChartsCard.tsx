import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

export interface EChartsCardProps {
  option: echarts.EChartsOption;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  onChartReady?: (instance: echarts.ECharts) => void;
}

export const ENTERPRISE_PALETTE = [
  "#2563eb", // 品牌主色 (Enterprise Blue)
  "#0ea5e9", // 平台科技天蓝
  "#10b981", // 稳健成功绿
  "#f59e0b", // 预警琥珀橙
  "#8b5cf6", // 智能灵动紫
  "#ec4899", // 重点高亮粉
  "#64748b", // 中性沉稳灰
];

/**
 * 封装具备企业级质感、自适应缩放与资源安全释放的通用 ECharts 图表容器
 */
export function EChartsCard({
  option,
  height = 280,
  className = "",
  style,
  loading = false,
  empty = false,
  emptyText = "暂无图表数据",
  onChartReady,
}: EChartsCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. 初始化或获取已有 ECharts 实例
    let chart = echarts.getInstanceByDom(containerRef.current);
    if (!chart) {
      chart = echarts.init(containerRef.current, undefined, {
        renderer: "canvas",
      });
      chartInstanceRef.current = chart;
      if (onChartReady) {
        onChartReady(chart);
      }
    }

    // 2. 加载状态控制
    if (loading) {
      chart.showLoading({
        text: "图表渲染中...",
        color: "#2563eb",
        textColor: "#64748b",
        maskColor: "rgba(255, 255, 255, 0.65)",
      });
    } else {
      chart.hideLoading();
      // 3. 应用图表配置，默认注入调色板与平滑动画参数
      const enhancedOption: echarts.EChartsOption = {
        color: ENTERPRISE_PALETTE,
        animationDuration: 600,
        animationEasing: "cubicOut",
        ...option,
      };
      chart.setOption(enhancedOption, true);
    }

    // 4. 使用 ResizeObserver 监听容器尺寸变化（兼容侧边栏折叠与窗口缩放）
    const resizeObserver = new ResizeObserver(() => {
      if (chart && !chart.isDisposed()) {
        chart.resize();
      }
    });

    resizeObserver.observe(containerRef.current);

    // 5. 窗口尺寸兜底监听
    const handleWindowResize = () => {
      if (chart && !chart.isDisposed()) {
        chart.resize();
      }
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [option, loading, onChartReady]);

  // 组件卸载时安全销毁 ECharts 实例，防止内存泄漏
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      className={className}
    >
      {empty ? (
        <div
          style={{
            height: typeof height === "number" ? `${height}px` : height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--zinc-400)",
            fontSize: "0.8125rem",
          }}
        >
          {emptyText}
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: typeof height === "number" ? `${height}px` : height,
          }}
        />
      )}
    </div>
  );
}
