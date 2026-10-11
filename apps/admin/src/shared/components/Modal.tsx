import React, { useEffect } from "react";
import { IconX } from "./Icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "520px",
}: ModalProps) {
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
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(9, 9, 11, 0.35)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-heavy"
        style={{
          width: "100%",
          maxWidth,
          borderRadius: "14px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-3)",
          overflow: "hidden",
          animation: "fadeIn 150ms ease-out",
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
              padding: "0.25rem",
              borderRadius: "4px",
              cursor: "pointer",
              color: "var(--zinc-400)",
            }}
            aria-label="关闭对话框"
          >
            <IconX size={18} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>{children}</div>

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
