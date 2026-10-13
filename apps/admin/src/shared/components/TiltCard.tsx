import React from "react";
import { useTiltCard, UseTiltCardOptions } from "../animation/hooks";

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tiltOptions?: UseTiltCardOptions;
  variant?: "glass" | "white" | "subtle";
  showSpotlight?: boolean;
}

/**
 * 物理 3D 透视倾斜卡片组件
 * 悬停时根据光标位置产生精细亚像素级 3D 旋转与次表面冷杉漫射聚光灯 (Spotlight)
 */
export function TiltCard({
  children,
  tiltOptions,
  variant = "white",
  showSpotlight = true,
  className = "",
  style,
  ...rest
}: TiltCardProps) {
  const { cardRef, glowRef } = useTiltCard<HTMLDivElement>(tiltOptions);

  const getVariantClasses = () => {
    switch (variant) {
      case "glass":
        return "glass-base";
      case "subtle":
        return "glass-subtle";
      case "white":
      default:
        return "bg-white border border-zinc-200/90 shadow-[var(--shadow-elevation-1)]";
    }
  };

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-[var(--shadow-elevation-2)] ${getVariantClasses()} ${className}`}
      style={{
        ...style,
        transformStyle: "preserve-3d",
      }}
      {...rest}
    >
      {/* 光标环境次表面探照高光 (Cursor Ambient Spotlight) */}
      {showSpotlight && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute -top-0 -left-0 w-60 h-60 rounded-full opacity-0 transition-opacity duration-300 z-0"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 70%)",
            willChange: "transform, opacity",
          }}
        />
      )}

      {/* 卡片实体内容容器 */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
