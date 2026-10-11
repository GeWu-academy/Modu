import React, { useEffect } from "react";
import { IconX } from "./Icons";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = "480px",
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "flex-end",
        backgroundColor: "rgba(9, 9, 11, 0.3)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        transition: "background-color 200ms ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          height: "100%",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-3)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--zinc-200)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--zinc-950)",
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.8125rem",
                  color: "var(--zinc-500)",
                }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              padding: "0.375rem",
              borderRadius: "4px",
              cursor: "pointer",
              color: "var(--zinc-400)",
            }}
            aria-label="关闭抽屉"
          >
            <IconX size={18} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          {children}
        </div>

        {footer && (
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "var(--zinc-50)",
              borderTop: "1px solid var(--zinc-200)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
