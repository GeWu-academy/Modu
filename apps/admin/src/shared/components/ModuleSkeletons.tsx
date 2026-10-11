import React from "react";
import { Skeleton } from "./Skeleton";

/**
 * 工作台 (Workspace) 高保真骨架屏
 * 对应欢迎横幅、4个指标度量卡片与左右双列操作台布局
 */
export function WorkspaceSkeleton() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* 1. 顶层横幅卡片骨架 */}
      <div
        className="glass-base"
        style={{
          borderRadius: "14px",
          padding: "2rem 2.25rem",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, maxWidth: "640px" }}>
            <Skeleton width={120} height={22} rounded="full" className="mb-3" />
            <Skeleton width="75%" height={32} className="mb-3" />
            <Skeleton width="50%" height={16} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Skeleton width={110} height={36} variant="button" />
            <Skeleton width={110} height={36} variant="button" />
          </div>
        </div>
      </div>

      {/* 2. 四大核心指标卡骨架 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-base"
            style={{
              padding: "1.25rem 1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--zinc-200)",
              boxShadow: "var(--shadow-elevation-1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <Skeleton width={80} height={16} />
              <Skeleton width={36} height={36} variant="circle" />
            </div>
            <Skeleton width={100} height={34} className="mb-2" />
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Skeleton width={48} height={18} rounded="full" />
              <Skeleton width={90} height={14} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. 左右双列快速配置与运行动态骨架 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* 左列：快速行动引导 */}
        <div
          className="glass-base"
          style={{
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid var(--zinc-200)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <Skeleton width={140} height={20} />
            <Skeleton width={60} height={16} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--zinc-100)",
                  background: "#FFFFFF",
                }}
              >
                <Skeleton width={20} height={20} rounded="sm" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="45%" height={16} className="mb-1" />
                  <Skeleton width="70%" height={13} />
                </div>
                <Skeleton width={16} height={16} rounded="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* 右列：运行动态与系统事件 */}
        <div
          className="glass-base"
          style={{
            borderRadius: "12px",
            padding: "1.5rem",
            border: "1px solid var(--zinc-200)",
            boxShadow: "var(--shadow-elevation-1)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <Skeleton width={140} height={20} />
            <Skeleton width={70} height={16} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Skeleton width={32} height={32} variant="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="55%" height={15} className="mb-1" />
                  <Skeleton width="35%" height={12} />
                </div>
                <Skeleton width={60} height={18} rounded="full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 表格数据视图 (Users / Invites / Audit) 高保真骨架屏
 * 对应标题头、Tab 切换栏、搜索工具条、数据表头与数据行
 */
export function TableSkeleton() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* 1. 页面标题头 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <Skeleton width={180} height={28} className="mb-2" />
          <Skeleton width={320} height={16} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Skeleton width={110} height={38} variant="button" />
          <Skeleton width={100} height={38} variant="button" />
        </div>
      </div>

      {/* 2. Tab 切换与工具栏 */}
      <div
        className="glass-base"
        style={{
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Skeleton width={96} height={32} rounded="md" />
          <Skeleton width={96} height={32} rounded="md" />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Skeleton width={240} height={34} rounded="md" />
          <Skeleton width={110} height={34} rounded="md" />
          <Skeleton width={110} height={34} rounded="md" />
        </div>
      </div>

      {/* 3. 数据表格骨架 */}
      <div
        className="glass-base"
        style={{
          borderRadius: "12px",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
          overflow: "hidden",
        }}
      >
        {/* 表头 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1.5fr 1fr 1.2fr 1fr",
            gap: "1rem",
            padding: "0.875rem 1.5rem",
            backgroundColor: "var(--zinc-50)",
            borderBottom: "1px solid var(--zinc-200)",
          }}
        >
          {[80, 60, 90, 50, 70, 50].map((w, idx) => (
            <Skeleton key={idx} width={w} height={15} />
          ))}
        </div>

        {/* 6 行数据占位 */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.2fr 1.5fr 1fr 1.2fr 1fr",
                gap: "1rem",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: row === 6 ? "none" : "1px solid var(--zinc-100)",
                backgroundColor: row % 2 === 0 ? "rgba(250, 250, 250, 0.4)" : "#FFFFFF",
              }}
            >
              {/* 用户信息 */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Skeleton width={32} height={32} variant="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="60%" height={15} className="mb-1" />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
              {/* 角色 */}
              <Skeleton width={70} height={20} rounded="full" />
              {/* 联系方式 */}
              <Skeleton width="75%" height={14} />
              {/* 状态 */}
              <Skeleton width={60} height={20} rounded="full" />
              {/* 时间 */}
              <Skeleton width="70%" height={13} />
              {/* 操作 */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Skeleton width={28} height={28} rounded="md" />
                <Skeleton width={28} height={28} rounded="md" />
              </div>
            </div>
          ))}
        </div>

        {/* 分页栏 */}
        <div
          style={{
            padding: "0.875rem 1.5rem",
            backgroundColor: "var(--zinc-50)",
            borderTop: "1px solid var(--zinc-200)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton width={120} height={14} />
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <Skeleton width={32} height={30} rounded="md" />
            <Skeleton width={32} height={30} rounded="md" />
            <Skeleton width={32} height={30} rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 资产与卡片网格 (MyPlugins / PlatformPlugins / Skills) 高保真骨架屏
 * 对应标题、搜索过滤器与 3 列响应式卡片网格
 */
export function CardGridSkeleton() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* 1. 标题头 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <Skeleton width={200} height={28} className="mb-2" />
          <Skeleton width={360} height={16} />
        </div>
        <Skeleton width={120} height={38} variant="button" />
      </div>

      {/* 2. 检索过滤栏 */}
      <div
        className="glass-base"
        style={{
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[80, 80, 80, 80].map((w, idx) => (
            <Skeleton key={idx} width={w} height={32} rounded="md" />
          ))}
        </div>
        <Skeleton width={260} height={34} rounded="md" />
      </div>

      {/* 3. 六卡网格占位 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="glass-base"
            style={{
              borderRadius: "12px",
              padding: "1.25rem",
              border: "1px solid var(--zinc-200)",
              boxShadow: "var(--shadow-elevation-1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "180px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "0.875rem" }}>
                <Skeleton width={44} height={44} rounded="lg" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <Skeleton width="55%" height={18} />
                    <Skeleton width={42} height={16} rounded="full" />
                  </div>
                  <Skeleton width="35%" height={13} />
                </div>
              </div>
              <Skeleton width="92%" height={14} className="mb-1" />
              <Skeleton width="65%" height={14} className="mb-4" />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--zinc-100)",
              }}
            >
              <div style={{ display: "flex", gap: "0.375rem" }}>
                <Skeleton width={50} height={18} rounded="full" />
                <Skeleton width={60} height={18} rounded="full" />
              </div>
              <Skeleton width={76} height={28} variant="button" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 设置与表单向导 (Settings / PluginInstallGuide / SkillImport) 高保真骨架屏
 * 对应分组表单卡片、输入框与操作按键
 */
export function FormSkeleton() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1280px", margin: "0 auto" }}>
      {/* 1. 标题头 */}
      <div style={{ marginBottom: "1.75rem" }}>
        <Skeleton width={180} height={28} className="mb-2" />
        <Skeleton width={320} height={16} />
      </div>

      {/* 2. 标签导航栏 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[100, 120, 110, 100].map((w, idx) => (
          <Skeleton key={idx} width={w} height={36} rounded="md" />
        ))}
      </div>

      {/* 3. 表单卡片 */}
      <div
        className="glass-base"
        style={{
          borderRadius: "14px",
          padding: "2rem",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-1)",
        }}
      >
        <div style={{ borderBottom: "1px solid var(--zinc-100)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
          <Skeleton width={140} height={20} className="mb-2" />
          <Skeleton width={260} height={14} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "640px" }}>
          {[1, 2, 3, 4].map((f) => (
            <div key={f}>
              <Skeleton width={90} height={16} className="mb-2" />
              <Skeleton width="100%" height={38} rounded="md" className="mb-1" />
              <Skeleton width="60%" height={13} />
            </div>
          ))}

          <div style={{ display: "flex", gap: "0.75rem", paddingTop: "1rem" }}>
            <Skeleton width={100} height={38} variant="button" />
            <Skeleton width={80} height={38} variant="button" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 根据当前路由特征自动匹配对应的业务模块高保真骨架屏
 */
export function ModuleSkeletonRouter({ routeKey }: { routeKey: string }) {
  if (routeKey === "/workspace") {
    return <WorkspaceSkeleton />;
  }

  if (
    routeKey === "/system/users" ||
    routeKey === "/system/invites" ||
    routeKey === "/system/audit"
  ) {
    return <TableSkeleton />;
  }

  if (
    routeKey.startsWith("/my/plugins") ||
    routeKey === "/platform/plugins" ||
    routeKey === "/skills"
  ) {
    return <CardGridSkeleton />;
  }

  if (
    routeKey === "/settings" ||
    routeKey === "/platform/plugins/install" ||
    routeKey === "/skills/import"
  ) {
    return <FormSkeleton />;
  }

  return <WorkspaceSkeleton />;
}
