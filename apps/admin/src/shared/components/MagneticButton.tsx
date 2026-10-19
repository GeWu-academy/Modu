import React from "react";
import { useMagnetic } from "../animation/hooks";

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  maxOffset?: number;
}

/**
 * 触觉微磁力吸附按钮组件
 * 当鼠标光标在其上方移动时，按钮整体产生亚像素级跟随吸引，移出时以微弹性阻尼回弹
 */
export function MagneticButton({
  children,
  strength = 0.25,
  maxOffset = 6,
  className = "",
  style,
  ...props
}: MagneticButtonProps) {
  const ref = useMagnetic<HTMLButtonElement>(strength, maxOffset);

  return (
    <button
      ref={ref}
      className={className}
      style={{
        ...style,
        willChange: "transform",
      }}
      {...props}
    >
      {children}
    </button>
  );
}
