import React from "react";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  variant = "neutral",
  children,
  pulse = false,
  className = "",
}: BadgeProps) {
  const variantClass = `badge-${variant}`;

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {pulse && variant === "success" && <span className="pulse-green" />}
      {children}
    </span>
  );
}
