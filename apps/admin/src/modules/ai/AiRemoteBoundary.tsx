import React from "react";
import { IconRefresh, IconSparkles } from "../../shared/components/Icons";

interface AiRemoteBoundaryProps {
  children: React.ReactNode;
  resetKey?: unknown;
  onRetry?: () => void;
}

interface AiRemoteBoundaryState {
  hasError: boolean;
}

/**
 * 包裹 Modu-AI 远程挂载点的错误边界。
 * 远程模块（Module Federation）不可用时，React.lazy 的加载 Promise 会 reject，
 * 由此边界捕获并降级为「AI 模块还没引入」占位，避免整页白屏。
 * 传入的 resetKey 变化时清除错误态，配合上层重建懒加载组件实现「重试」。
 */
export class AiRemoteBoundary extends React.Component<
  AiRemoteBoundaryProps,
  AiRemoteBoundaryState
> {
  state: AiRemoteBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AiRemoteBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[AiRemoteView] 加载 Modu-AI 远程模块失败：", error);
  }

  componentDidUpdate(prevProps: AiRemoteBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <AiModuleNotIntroduced onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}

function AiModuleNotIntroduced({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
        <IconSparkles size={24} />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">AI 模块还没引入</h3>
      <p className="mx-auto mt-2 max-w-[520px] text-[0.8125rem] leading-relaxed text-zinc-500">
        未检测到 Modu-AI 远程模块。请确认远程入口（Module Federation）已启动或部署后重试，或刷新页面。
      </p>
      {onRetry && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ display: "inline-flex", marginTop: "1.25rem" }}
          onClick={onRetry}
        >
          <IconRefresh size={14} />
          <span>重试加载</span>
        </button>
      )}
    </div>
  );
}
