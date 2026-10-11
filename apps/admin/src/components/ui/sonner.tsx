import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-zinc-500",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-emerald-200 group-[.toast]:text-[#15803D]",
          error: "group-[.toast]:border-rose-200 group-[.toast]:text-[#BE123C]",
          warning: "group-[.toast]:border-amber-200 group-[.toast]:text-[#B45309]",
          info: "group-[.toast]:border-slate-200 group-[.toast]:text-[#1B4F8A]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
