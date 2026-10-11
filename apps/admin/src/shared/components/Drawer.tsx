import React, { useEffect, useRef, useState } from "react";
import { IconX } from "./Icons";
import { gsap, GSAP_EASINGS, GSAP_DURATIONS, isPrefersReducedMotion } from "../animation/gsap";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

/**
 * GSAP 驱动的高性能物理侧滑抽屉
 * 具备右侧滑动入场 (x: 100% -> 0%)、阻尼减速、双层微透模糊遮罩以及连贯离场过渡
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  width = "480px",
}: DrawerProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

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
        x: "100%",
        duration: GSAP_DURATIONS.fast,
        ease: GSAP_EASINGS.smooth,
      }).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: GSAP_DURATIONS.fast,
          ease: GSAP_EASINGS.smooth,
        },
        "-=0.1"
      );
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 入场动画
  useEffect(() => {
    if (shouldRender && isOpen) {
      if (!overlayRef.current || !panelRef.current) return;

      if (isPrefersReducedMotion()) {
        gsap.set([overlayRef.current, panelRef.current], { opacity: 1, x: "0%" });
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

      // 侧边栏滑入
      tl.fromTo(
        panelRef.current,
        {
          x: "100%",
          force3D: true,
        },
        {
          x: "0%",
          duration: GSAP_DURATIONS.medium,
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
        justifyContent: "flex-end",
        backgroundColor: "rgba(9, 9, 11, 0.32)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: 0,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "100%",
          maxWidth: width,
          height: "100%",
          backgroundColor: "#FFFFFF",
          borderLeft: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-3)",
          display: "flex",
          flexDirection: "column",
          transform: "translateX(100%)",
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
