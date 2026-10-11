import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-150 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:scale-[0.975]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0.5 active:scale-[0.975]",
        outline:
          "border border-input bg-white shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-zinc-400 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-[0.975]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-zinc-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0.5 active:scale-[0.975]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground active:scale-[0.96]",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
        frost:
          "btn-frost-blue shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.975]",
        dark:
          "btn-dark shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.975]",
        frostDark:
          "btn-frost-dark shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.975]",
        amber:
          "btn-dark shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.975]",
        frostAmber:
          "btn-frost-dark shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.975]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
