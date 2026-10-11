import React, { useRef } from "react";
import { usePageEntrance } from "../animation/hooks";

export interface PageTransitionProps {
  children: React.ReactNode;
  routeKey?: string;
  className?: string;
}

/**
 * 页面级 GSAP 阶梯入场过渡容器
 * 内部带有 [data-animate] 属性的子卡片或组件将自动进行级联排布入场
 */
export function PageTransition({
  children,
  routeKey,
  className = "",
}: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  usePageEntrance(containerRef, [routeKey]);

  return (
    <div
      ref={containerRef}
      className={`min-h-full ${className}`}
      style={{
        opacity: 0, // 初始不透明度为 0，由 GSAP 执行淡入与 GPU 加速动画
      }}
    >
      {children}
    </div>
  );
}
