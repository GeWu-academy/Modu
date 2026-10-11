import gsap from "gsap";

/**
 * 动效物理缓动曲线规范 (Physics Easings)
 * 对标顶级工程设计（Linear, Stripe, Apple macOS），摒弃粗糙机械与廉价弹簧晃动
 */
export const GSAP_EASINGS = {
  // 锐利减速：适合页面入场、抽屉滑出、弹窗展开（起始快，收尾沉静）
  outExpo: "expo.out",
  outPower3: "power3.out",
  outPower4: "power4.out",
  
  // 柔和减速：适合卡片倾斜复位、微光巡弋、触觉回弹
  smooth: "power2.out",
  
  // 对称加减速：适合持续状态流转
  inOut: "power3.inOut",
  
  // 极轻微弹性阻尼：适合磁力吸附与按钮微释放（克制阻尼，不摇晃）
  softBack: "back.out(1.1)",
} as const;

/**
 * 动效节奏与时长规范 (Duration Standards)
 * 控制在 180ms ~ 550ms 之间，保持极致的跟手感与敏捷响应
 */
export const GSAP_DURATIONS = {
  instant: 0.12,
  fast: 0.22,
  normal: 0.32,
  medium: 0.42,
  slow: 0.55,
} as const;

/**
 * 检查系统是否开启“减少动态效果”偏好 (WCAG 无障碍规范)
 */
export function isPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 创建带安全生命周期清理的 GSAP 上下文
 * 保证在 React 组件销毁时 100% 回收动画句柄，杜绝内存泄漏
 */
export function createSafeContext(scope: React.RefObject<any>, callback: () => void): () => void {
  if (!scope.current) return () => {};
  const ctx = gsap.context(callback, scope);
  return () => ctx.revert();
}

export { gsap };
