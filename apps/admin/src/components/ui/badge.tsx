import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success:
          "border-[#BBF7D0] bg-[#F0FDF4] text-[#0D5C4D]",
        warning:
          "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
        danger:
          "border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]",
        info:
          "border-[#BAE6FD] bg-[#F0F9FF] text-[#0369A1]",
        neutral:
          "border-zinc-200 bg-zinc-100 text-zinc-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean;
}

function Badge({ className, variant, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulse && <span className="pulse-green mr-1.5" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
