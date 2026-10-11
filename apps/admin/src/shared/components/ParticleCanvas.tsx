import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface ParticleCanvasProps {
  particleCount?: number;
  interactive?: boolean;
  enableLinks?: boolean;
  className?: string;
}

export function ParticleCanvas({
  particleCount = 36,
  interactive = true,
  enableLinks = true,
  className = "",
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = false;
    let isVisible = !document.hidden;
    let isIntersecting = true;

    // 适配视网膜高分屏 (DPR 2x 缩放)，保持极端清晰的粒子与发丝细线
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    let cssWidth = canvas.parentElement?.clientWidth || window.innerWidth;
    let cssHeight = canvas.parentElement?.clientHeight || window.innerHeight;

    const setupDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      cssWidth = canvas.parentElement.clientWidth;
      cssHeight = canvas.parentElement.clientHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
      ctx.scale(dpr, dpr);
    };

    setupDimensions();

    // 检查减弱动效偏好
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 初始化微尘粒子（严格统一至品牌蓝与冷钛色阶）
    const particles: Particle[] = [];
    const colors = [
      "rgba(37, 99, 235, ", // 现代智造蓝微光
      "rgba(148, 163, 184, ", // 冷钛微灰
      "rgba(203, 213, 225, ", // 霜白微光
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        vx: (Math.random() - 0.45) * 0.35,
        vy: (Math.random() - 0.55) * 0.35,
        radius: 0.8 + Math.random() * 1.0,
        color: colors[i % colors.length],
        alpha: 0.12 + Math.random() * 0.16,
      });
    }

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // 如果开启减弱动效，静态绘制点阵
      if (prefersReducedMotion) {
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha * 0.6})`;
          ctx.fill();
        }
        return;
      }

      // 更新并绘制微粒
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 基础漂移
        p.x += p.vx;
        p.y += p.vy;

        // 边界循环包裹
        if (p.x < 0) p.x = cssWidth;
        if (p.x > cssWidth) p.x = 0;
        if (p.y < 0) p.y = cssHeight;
        if (p.y > cssHeight) p.y = 0;

        // 120px 光标斥力场
        if (interactive) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 120;
          if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius;
            p.x += (dx / dist) * force * 1.8;
            p.y += (dy / dist) * force * 1.8;
          }
        }

        // 绘制微粒
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // 极细微网发丝连线 (间距 < 64px)
        if (enableLinks) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 64) {
              const linkAlpha = (1 - dist / 64) * 0.08;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(37, 99, 235, ${linkAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (!isRunning && isVisible && isIntersecting) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };

    // 1. 窗口与容器自适应
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupDimensions();
        if (prefersReducedMotion) render();
      }, 100);
    };
    window.addEventListener("resize", handleResize);

    // 2. 页面可见性监听（切换后台标签页时彻底停止 RAF，0% CPU 占用）
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 3. 视口交叉监听（滑出视口时自动暂停渲染）
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        }
      });
      observer.observe(canvas);
    }

    // 4. 鼠标交互
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as EventListener);
    parent.addEventListener("mouseleave", handleMouseLeave as EventListener);

    startLoop();

    return () => {
      stopLoop();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (observer) observer.disconnect();
      parent.removeEventListener("mousemove", handleMouseMove as EventListener);
      parent.removeEventListener("mouseleave", handleMouseLeave as EventListener);
    };
  }, [particleCount, interactive, enableLinks]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
