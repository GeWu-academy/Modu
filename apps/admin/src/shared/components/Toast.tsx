import React, { createContext, useContext } from "react";
import { toast as sonnerToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const toastContextValue: ToastContextValue = {
  show: (type: ToastType, message: string) => {
    if (type === "success") sonnerToast.success(message);
    else if (type === "warning") sonnerToast.warning(message);
    else if (type === "error") sonnerToast.error(message);
    else sonnerToast.info(message);
  },
  success: (message: string) => sonnerToast.success(message),
  warning: (message: string) => sonnerToast.warning(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
};

const ToastContext = createContext<ToastContextValue>(toastContextValue);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={toastContextValue}>
      {children}
      <Toaster position="bottom-right" richColors />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context || toastContextValue;
}

export { sonnerToast as toast, Toaster };
