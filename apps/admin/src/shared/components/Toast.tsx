import React, { createContext, useContext, useState, useCallback } from "react";
import { IconCheck, IconAlertTriangle, IconAlertCircle, IconInfo, IconX } from "./Icons";

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

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const success = useCallback((message: string) => show("success", message), [show]);
  const warning = useCallback((message: string) => show("warning", message), [show]);
  const error = useCallback((message: string) => show("error", message), [show]);
  const info = useCallback((message: string) => show("info", message), [show]);

  return (
    <ToastContext.Provider value={{ show, success, warning, error, info }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          let icon = <IconInfo size={16} />;
          let color = "var(--zinc-900)";

          if (toast.type === "success") {
            icon = <IconCheck size={16} className="text-brand-600" />;
            color = "var(--brand-700)";
          } else if (toast.type === "warning") {
            icon = <IconAlertTriangle size={16} />;
            color = "var(--semantic-warning-fg)";
          } else if (toast.type === "error") {
            icon = <IconAlertCircle size={16} />;
            color = "var(--semantic-danger-fg)";
          }

          return (
            <div
              key={toast.id}
              className="glass-heavy"
              style={{
                pointerEvents: "auto",
                minWidth: "280px",
                maxWidth: "420px",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                border: "1px solid var(--zinc-200)",
                boxShadow: "var(--shadow-elevation-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                fontSize: "0.875rem",
                color,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span>{icon}</span>
                <span style={{ fontWeight: 500 }}>{toast.message}</span>
              </div>
              <button
                onClick={() => remove(toast.id)}
                className="btn-ghost"
                style={{ padding: "0.25rem", color: "var(--zinc-400)" }}
              >
                <IconX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
