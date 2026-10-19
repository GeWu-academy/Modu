import React from "react";
import { useAnimatedNumber } from "../animation/hooks";

export interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * 等宽动态数字组件 (Tabular Num Animated Ticker)
 * 具备 GSAP 缓动递增动效，且严格保持 font-feature-settings: "tnum"，杜绝数字滚动时的宽度抖动
 */
export function AnimatedNumber({
  value,
  duration = 0.65,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedNumberProps) {
  const numberRef = useAnimatedNumber(value, duration);

  return (
    <span className={`inline-flex items-baseline tnum font-semibold ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span ref={numberRef} className="tabular-nums">
        {value}
      </span>
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
}
