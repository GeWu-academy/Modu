import React from "react";

export type StatusIndicatorVariant = "signal" | "wave" | "shield" | "shimmer" | "mono" | "dot";
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusIndicatorProps {
  /** 视觉呈现变体，默认为 enterprise signal (阶梯遥测信号格) */
  variant?: StatusIndicatorVariant;
  /** 语义色调，默认为 success */
  tone?: StatusTone;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 高级状态指示器组件
 * 告别传统单一小绿点，提供云原生遥测信号格、心跳波、安全徽标等企业级视觉方案
 */
export function StatusIndicator({
  variant = "signal",
  tone = "success",
  className = "",
  style = {},
}: StatusIndicatorProps) {
  // 色彩映射
  const colorMap = {
    success: {
      bar: "bg-emerald-500",
      activeBar: "bg-emerald-500",
      text: "text-emerald-700",
      svg: "text-emerald-500",
    },
    warning: {
      bar: "bg-amber-500",
      activeBar: "bg-amber-500",
      text: "text-amber-700",
      svg: "text-amber-500",
    },
    danger: {
      bar: "bg-rose-500",
      activeBar: "bg-rose-500",
      text: "text-rose-700",
      svg: "text-rose-500",
    },
    info: {
      bar: "bg-sky-500",
      activeBar: "bg-sky-500",
      text: "text-sky-700",
      svg: "text-sky-500",
    },
    neutral: {
      bar: "bg-zinc-400",
      activeBar: "bg-zinc-400",
      text: "text-zinc-500",
      svg: "text-zinc-400",
    },
  }[tone];

  // 1. 方案一：微遥测信号格 (默认推荐)
  if (variant === "signal") {
    return (
      <span
        className={`inline-flex items-end gap-[2px] h-3 w-3 pb-[1px] select-none ${className}`}
        style={style}
        aria-label="遥测信号正常"
      >
        <span className={`w-[2.5px] h-[4px] rounded-full ${colorMap.bar}`} />
        <span className={`w-[2.5px] h-[7px] rounded-full ${colorMap.bar}`} />
        <span className={`w-[2.5px] h-[10px] rounded-full ${colorMap.activeBar} telemetry-signal-active`} />
      </span>
    );
  }

  // 2. 方案二：ECG 心跳波形
  if (variant === "wave") {
    return (
      <svg
        className={`w-3.5 h-3 ${colorMap.svg} select-none ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        aria-label="心跳波形活跃"
      >
        <path className="ecg-line-anim" d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    );
  }

  // 3. 方案三：安全受信盾徽
  if (variant === "shield") {
    return (
      <svg
        className={`w-3.5 h-3.5 ${colorMap.svg} select-none ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        aria-label="受信安全"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  // 4. 方案四：等宽双态字标微标
  if (variant === "mono") {
    return (
      <span className={`font-mono text-[10px] font-bold ${colorMap.text} select-none ${className}`} style={style}>
        LIVE
      </span>
    );
  }

  // 5. 经典微点 (向下兼容)
  return (
    <span
      className={`pulse-green select-none ${className}`}
      style={style}
      aria-label="状态指示点"
    />
  );
}

export interface NodeStatusCapsuleProps {
  statusText?: string;
  latencyText?: string;
  variant?: StatusIndicatorVariant;
  tone?: StatusTone;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 企业节点状态晶透胶囊
 * 替代原生小绿点药丸，提供企业级阶梯遥测信号与高透晶体质感（彻底告别毛玻璃模糊）
 */
export function NodeStatusCapsule({
  statusText = "节点就绪",
  latencyText = "32ms",
  variant = "signal",
  tone = "success",
  className = "",
  style = {},
}: NodeStatusCapsuleProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 select-none ${className}`}
      style={{
        backgroundColor: "rgba(240, 253, 244, 0.45)",
        border: "1px solid rgba(187, 247, 208, 0.75)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.85), 0 1px 2px rgba(16, 185, 129, 0.04)",
        color: "var(--brand-700, #153E6D)",
        ...style,
      }}
    >
      <StatusIndicator variant={variant} tone={tone} />
      <span>{statusText}</span>
      {latencyText && (
        <span
          className="text-[10px] font-mono opacity-65 pl-1 border-l border-emerald-300/80"
        >
          {latencyText}
        </span>
      )}
    </div>
  );
}
