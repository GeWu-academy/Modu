import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  width?: string | number;
  height?: string | number;
  variant?: "default" | "card" | "circle" | "text" | "button";
}

const ROUNDED_MAP: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * 钛灰冷杉微光波浪骨架屏原子组件 (Skeleton)
 * 支持纯 CSS GPU 硬件加速 Shimmer Wave，适用于组件与模块加载占位
 */
export function Skeleton({
  className = "",
  style,
  rounded,
  width,
  height,
  variant = "default",
  ...props
}: SkeletonProps) {
  let defaultRounded = "rounded-md";
  if (rounded) {
    defaultRounded = ROUNDED_MAP[rounded];
  } else if (variant === "circle") {
    defaultRounded = "rounded-full";
  } else if (variant === "card") {
    defaultRounded = "rounded-xl";
  } else if (variant === "button") {
    defaultRounded = "rounded-md";
  } else if (variant === "text") {
    defaultRounded = "rounded";
  }

  const customStyle: React.CSSProperties = { ...style };
  if (width !== undefined) {
    customStyle.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    customStyle.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={`skeleton-shimmer inline-block select-none pointer-events-none ${defaultRounded} ${className}`}
      style={customStyle}
      aria-hidden="true"
      {...props}
    />
  );
}
