import React, { useState, useEffect } from "react";
import { useApp } from "../providers/AppContext";
import {
  IconSearch,
  IconCommand,
  IconDashboard,
  IconUsers,
  IconPlus,
  IconPuzzle,
  IconSparkles,
  IconShield,
  IconSettings,
  IconActivity,
  IconFileText,
} from "../../shared/components/Icons";

interface PaletteCommand {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const { isCmdKOpen, setCmdKOpen, navigate, setActiveView } = useApp();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 快捷键 Cmd+K 监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdKOpen(!isCmdKOpen);
      } else if (e.key === "Escape" && isCmdKOpen) {
        setCmdKOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCmdKOpen, setCmdKOpen]);

  const commands: PaletteCommand[] = [
    {
      id: "nav-workspace",
      title: "前往工作台",
      description: "查看底座状态、向导 Checklist 与核心 HUD 浮岛指标",
      category: "导航",
      icon: <IconDashboard size={16} />,
      action: () => {
        navigate("/workspace");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-users",
      title: "用户列表与账号维护",
      description: "管理系统成员账号、启停状态及受权审计",
      category: "用户",
      icon: <IconUsers size={16} />,
      action: () => {
        navigate("/system/users");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-invites",
      title: "企业邀请链接管理",
      description: "生成直绑当前企业的成员受邀注册链接",
      category: "用户",
      icon: <IconPlus size={16} />,
      action: () => {
        navigate("/system/invites");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-my-plugins",
      title: "我的插件中心",
      description: "查看已开放插件、管理本人启用状态与配置",
      category: "插件",
      icon: <IconPuzzle size={16} />,
      action: () => {
        navigate("/my/plugins");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-skills",
      title: "Skill 知识底座",
      description: "管理 AI 业务能力、版本草稿与指令规范",
      category: "知识",
      icon: <IconSparkles size={16} />,
      action: () => {
        navigate("/skills");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-skill-import",
      title: "导入业务 Skill",
      description: "以受控方式导入 Markdown 业务指令草稿",
      category: "知识",
      icon: <IconFileText size={16} />,
      action: () => {
        navigate("/skills/import");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-platform-plugins",
      title: "平台插件管理",
      description: "平台层插件开放、依赖冲突核对与下架控制",
      category: "平台",
      icon: <IconShield size={16} />,
      action: () => {
        setActiveView("platform");
        navigate("/platform/plugins");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-plugin-install",
      title: "插件受控引入说明",
      description: "查看宿主构建打包与插件安装规范",
      category: "平台",
      icon: <IconFileText size={16} />,
      action: () => {
        setActiveView("platform");
        navigate("/platform/plugins/install");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-audit",
      title: "分域操作审计记录",
      description: "查询账号维护、平台插件与本人业务隔离审计",
      category: "系统",
      icon: <IconActivity size={16} />,
      action: () => {
        navigate("/system/audit");
        setCmdKOpen(false);
      },
    },
    {
      id: "nav-settings",
      title: "系统偏好与企业基础信息",
      description: "配置个人偏好、界面密度及自托管实例参数",
      category: "系统",
      icon: <IconSettings size={16} />,
      action: () => {
        navigate("/settings");
        setCmdKOpen(false);
      },
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isCmdKOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "14vh",
        backgroundColor: "rgba(9, 9, 11, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdKOpen(false);
      }}
    >
      <div
        className="glass-heavy"
        style={{
          width: "100%",
          maxWidth: "580px",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--zinc-200)",
          boxShadow: "var(--shadow-elevation-3)",
          overflow: "hidden",
          animation: "fadeIn 120ms ease",
        }}
      >
        {/* 输入框区 */}
        <div
          style={{
            padding: "0.875rem 1rem",
            borderBottom: "1px solid var(--zinc-200)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <IconSearch size={18} className="text-zinc-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="搜索功能页面、快捷操作或按分类查找..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "0.9375rem",
              color: "var(--zinc-900)",
              backgroundColor: "transparent",
            }}
          />
          <kbd
            style={{
              fontSize: "0.6875rem",
              padding: "0.125rem 0.375rem",
              borderRadius: "4px",
              backgroundColor: "var(--zinc-100)",
              border: "1px solid var(--zinc-300)",
              color: "var(--zinc-500)",
            }}
          >
            ESC 退出
          </kbd>
        </div>

        {/* 结果列表 */}
        <div
          style={{
            maxHeight: "360px",
            overflowY: "auto",
            padding: "0.5rem",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--zinc-400)",
                fontSize: "0.875rem",
              }}
            >
              未找到匹配的页面或指令
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: isSelected ? "var(--brand-50)" : "transparent",
                    transition: "all 80ms ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        color: isSelected ? "var(--brand-600)" : "var(--zinc-500)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {cmd.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: isSelected ? "var(--brand-800)" : "var(--zinc-900)",
                        }}
                      >
                        {cmd.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--zinc-500)" }}>
                        {cmd.description}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.125rem 0.375rem",
                      borderRadius: "4px",
                      backgroundColor: "var(--zinc-100)",
                      color: "var(--zinc-600)",
                    }}
                  >
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
