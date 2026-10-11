import React from "react";
import { Badge as ShadcnBadge, type BadgeProps as ShadcnBadgeProps } from "@/components/ui/badge";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

export interface BadgeProps extends Omit<ShadcnBadgeProps, "variant"> {
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
  ...props
}: BadgeProps) {
  return (
    <ShadcnBadge variant={variant} pulse={pulse} className={className} {...props}>
      {children}
    </ShadcnBadge>
  );
}

export { ShadcnBadge };
