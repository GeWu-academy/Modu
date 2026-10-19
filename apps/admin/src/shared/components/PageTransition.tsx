import React, { useState, useEffect } from "react";
import { ModuleSkeletonRouter } from "./ModuleSkeletons";
import { isPrefersReducedMotion } from "../animation/gsap";

export interface PageTransitionProps {
  children: React.ReactNode;
  routeKey: string;
  className?: string;
  skeletonDuration?: number;
}

/**
 * 模块切页骨架屏平滑过渡容器
 * 切换不同模块时，以匹配对应模块结构的高保真钛灰冷杉微光骨架屏过渡，
 * 消除画面突变与上下跳动，提供极致丝滑的 Crossfade 视觉体验
 */
export function PageTransition({
  children,
  routeKey,
  className = "",
  skeletonDuration = 200,
}: PageTransitionProps) {
  const [renderedRoute, setRenderedRoute] = useState(routeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isReduced = isPrefersReducedMotion();

  useEffect(() => {
    if (routeKey !== renderedRoute) {
      if (isReduced || skeletonDuration <= 0) {
        setRenderedRoute(routeKey);
        setIsTransitioning(false);
        return;
      }

      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setRenderedRoute(routeKey);
        setIsTransitioning(false);
      }, skeletonDuration);

      return () => clearTimeout(timer);
    }
  }, [routeKey, renderedRoute, skeletonDuration, isReduced]);

  // 当正在切换路由至新模块时，优雅展示对应模块的微光骨架屏
  if (!isReduced && (routeKey !== renderedRoute || isTransitioning)) {
    return (
      <div className={`min-h-full ${className}`} aria-busy="true">
        <ModuleSkeletonRouter routeKey={routeKey} />
      </div>
    );
  }

  return (
    <div
      key={renderedRoute}
      className={`min-h-full animate-page-fade-in ${className}`}
    >
      {children}
    </div>
  );
}
