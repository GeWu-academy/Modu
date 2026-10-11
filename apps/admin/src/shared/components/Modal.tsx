import React, { useEffect, useRef, useState } from "react";
import { IconX } from "./Icons";
import { gsap, GSAP_EASINGS, GSAP_DURATIONS, isPrefersReducedMotion } from "../animation/gsap";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

/**
 * GSAP 驱动的高性能光学微透对话框
 * 具备硬件加速双层遮罩淡入、模态框 3D 景深微缩放 (scale 0.94 -> 1.0) 以及优雅无闪烁离场动画
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "520px",
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // 监听 ESC 键关闭
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

  // 控制 GSAP 进出场状态机
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else if (shouldRender) {
      // 触发离场过渡
      if (!overlayRef.current || !panelRef.current || isPrefersReducedMotion()) {
        setShouldRender(false);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setShouldRender(false);
        },
      });

      tl.to(panelRef.current, {
        opacity: 0,
        scale: 0.96,
        y: 8,
        duration: GSAP_DURATIONS.fast,
        ease: GSAP_EASINGS.smooth,
      }).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: GSAP_DURATIONS.fast,
          ease: GSAP_EASINGS.smooth,
        },
        "-=0.12"
      );
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 入场动画
  useEffect(() => {
    if (shouldRender && isOpen) {
      if (!overlayRef.current || !panelRef.current) return;

      if (isPrefersReducedMotion()) {
        gsap.set([overlayRef.current, panelRef.current], { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline();

      // 遮罩淡入
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: GSAP_DURATIONS.fast,
          ease: GSAP_EASINGS.smooth,
        }
      );

      // 面板微缩放入场
      tl.fromTo(
        panelRef.current,
        {
          opacity: 0,
          scale: 0.94,
          y: 14,
          force3D: true,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: GSAP_DURATIONS.normal,
          ease: GSAP_EASINGS.outExpo,
          clearProps: "transform",
        },
        "-=0.15"
      );
    }
  }, [shouldRender, isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(9, 9, 11, 0.38)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        opacity: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="glass-heavy"
        style={{
          width: "100%",
          maxWidth,
          borderRadius: "14px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-3)",
          overflow: "hidden",
          opacity: 0,
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
