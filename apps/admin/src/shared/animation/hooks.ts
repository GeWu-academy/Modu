import { useEffect, useRef } from "react";
import { gsap, GSAP_EASINGS, GSAP_DURATIONS, isPrefersReducedMotion } from "./gsap";

/**
 * 页面/容器分层编排入场 Hook
 * 针对标记了 [data-animate] 的子元素执行阶梯式（Staggered）丝滑入场
 */
export function usePageEntrance(
  containerRef: React.RefObject<HTMLElement | null>,
  dependencies: unknown[] = []
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isPrefersReducedMotion()) {
      gsap.set(el, { opacity: 1, clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      // 1. 查找带有 [data-animate] 的子元素
      const targets = el.querySelectorAll("[data-animate]");

      if (targets.length > 0) {
        // 设置初始静止状态（仅极轻微微位移 4px，彻底消除原 14px 造成的剧烈抖动与跳帧）
        gsap.set(targets, {
          opacity: 0,
          y: 4,
          willChange: "transform, opacity",
          force3D: true,
        });

        // 统一阶梯缓动淡入入场
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: GSAP_DURATIONS.fast,
          stagger: 0.03,
          ease: GSAP_EASINGS.smooth,
          clearProps: "willChange,transform",
        });
      } else {
        // 全容器平滑淡入（纯透明度，无纵向位移突跳）
        gsap.fromTo(
          el,
          { opacity: 0, willChange: "opacity" },
          {
            opacity: 1,
            duration: GSAP_DURATIONS.fast,
            ease: GSAP_EASINGS.smooth,
            clearProps: "willChange",
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, dependencies);
}

/**
 * 3D 物理透视微倾斜与光标高光跟随 Hook
 * 基于 gsap.quickTo 硬件加速插值，避免 React state 重渲染开销，达成 120 FPS 丝滑物理跟随
 */
export interface UseTiltCardOptions {
  maxTilt?: number; // 最大倾斜角度，建议 2.5 ~ 4 度，过大显浮夸
  perspective?: number; // 透视景深，推荐 1000px
  scale?: number; // 悬停微升倍率，推荐 1.012
}

export function useTiltCard<T extends HTMLElement = HTMLDivElement>(
  options: UseTiltCardOptions = {}
) {
  const cardRef = useRef<T | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const { maxTilt = 3.2, perspective = 1000, scale = 1.012 } = options;

  useEffect(() => {
    const card = cardRef.current;
    if (!card || isPrefersReducedMotion()) return;

    // 创建针对 transform 属性的高速动画插值器 (quickTo)
    const quickRotateX = gsap.quickTo(card, "rotationX", {
      duration: 0.35,
      ease: GSAP_EASINGS.smooth,
    });
    const quickRotateY = gsap.quickTo(card, "rotationY", {
      duration: 0.35,
      ease: GSAP_EASINGS.smooth,
    });
    const quickScale = gsap.quickTo(card, "scale", {
      duration: 0.25,
      ease: GSAP_EASINGS.smooth,
    });

    gsap.set(card, {
      transformPerspective: perspective,
      transformStyle: "preserve-3d",
      willChange: "transform",
      force3D: true,
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 归一化计算 (-1 到 1)
      const normX = (x - centerX) / centerX;
      const normY = (y - centerY) / centerY;

      // 倾斜角度：Y 轴移动对应 rotationX，X 轴移动对应 rotationY
      const rotX = -normY * maxTilt;
      const rotY = normX * maxTilt;

      quickRotateX(rotX);
      quickRotateY(rotY);
      quickScale(scale);

      // 如果提供了环境微高光层，同步更新高光位置
      if (glowRef.current) {
        glowRef.current.style.opacity = "1";
        glowRef.current.style.transform = `translate(${x - 120}px, ${y - 120}px)`;
      }
    };

    const handleMouseLeave = () => {
      quickRotateX(0);
      quickRotateY(0);
      quickScale(1);

      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(card);
    };
  }, [maxTilt, perspective, scale]);

  return { cardRef, glowRef };
}

/**
 * 触觉微磁力吸附 Hook
 * 鼠标靠近按钮或胶囊时，产生柔和的物理吸引力，移开时弹性复位
 */
export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(
  strength: number = 0.28,
  maxOffset: number = 7
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isPrefersReducedMotion()) return;

    const quickX = gsap.quickTo(el, "x", { duration: 0.28, ease: GSAP_EASINGS.smooth });
    const quickY = gsap.quickTo(el, "y", { duration: 0.28, ease: GSAP_EASINGS.smooth });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      const targetX = Math.max(-maxOffset, Math.min(maxOffset, relX * strength));
      const targetY = Math.max(-maxOffset, Math.min(maxOffset, relY * strength));

      quickX(targetX);
      quickY(targetY);
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.38,
        ease: GSAP_EASINGS.softBack,
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, maxOffset]);

  return ref;
}

/**
 * 等宽动态数值渐变计数 Hook
 * 将数字从当前值平滑过渡至目标值，支持等宽字体格式化
 */
export function useAnimatedNumber(target: number, duration: number = 0.6) {
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const currentValRef = useRef<{ value: number }>({ value: 0 });

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    if (isPrefersReducedMotion()) {
      el.textContent = String(target);
      currentValRef.current.value = target;
      return;
    }

    const tween = gsap.to(currentValRef.current, {
      value: target,
      duration,
      ease: GSAP_EASINGS.outPower3,
      onUpdate: () => {
        if (el) {
          el.textContent = Math.round(currentValRef.current.value).toLocaleString();
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [target, duration]);

  return numberRef;
}
