import React, { useEffect } from "react";
import { useApp } from "../providers/AppContext";
import {
  IconDashboard,
  IconUsers,
  IconUserPlus,
  IconPuzzle,
  IconSparkles,
  IconShield,
  IconSettings,
  IconActivity,
  IconUpload,
  IconBookOpen,
} from "../../shared/components/Icons";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export function CommandPalette() {
  const { isCmdKOpen, setCmdKOpen, navigate, setActiveView } = useApp();

  // 监听快捷键 Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdKOpen(!isCmdKOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCmdKOpen, setCmdKOpen]);

  return (
    <CommandDialog open={isCmdKOpen} onOpenChange={setCmdKOpen}>
      <CommandInput placeholder="搜索功能页面、快捷操作或按分类查找..." />
      <CommandList>
        <CommandEmpty>未找到匹配的页面或指令</CommandEmpty>

        <CommandGroup heading="通用导航">
          <CommandItem
            value="前往工作台 查看底座状态 向导 Checklist HUD 浮岛指标"
            onSelect={() => {
              navigate("/workspace");
              setCmdKOpen(false);
            }}
          >
            <IconDashboard className="mr-2 h-4 w-4 text-brand-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">前往工作台</span>
              <span className="text-xs text-zinc-500">查看底座状态、向导 Checklist 与核心 HUD 浮岛指标</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="用户与邀请">
          <CommandItem
            value="用户列表与账号维护 管理成员账号 启停状态 审计"
            onSelect={() => {
              navigate("/system/users");
              setCmdKOpen(false);
            }}
          >
            <IconUsers className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">用户列表与账号维护</span>
              <span className="text-xs text-zinc-500">管理系统成员账号、启停状态及受权审计</span>
            </div>
          </CommandItem>
          <CommandItem
            value="企业邀请链接管理 生成受邀注册链接"
            onSelect={() => {
              navigate("/system/invites");
              setCmdKOpen(false);
            }}
          >
            <IconUserPlus className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">企业邀请链接管理</span>
              <span className="text-xs text-zinc-500">生成直绑当前企业的成员受邀注册链接</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="业务插件">
          <CommandItem
            value="我的插件中心 已开放插件 启用状态 配置"
            onSelect={() => {
              navigate("/my/plugins");
              setCmdKOpen(false);
            }}
          >
            <IconPuzzle className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">我的插件中心</span>
              <span className="text-xs text-zinc-500">查看已开放插件、管理本人启用状态与配置</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="知识底座">
          <CommandItem
            value="Skill 知识底座 AI 业务能力 版本草稿 指令规范"
            onSelect={() => {
              navigate("/skills");
              setCmdKOpen(false);
            }}
          >
            <IconSparkles className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">Skill 知识底座</span>
              <span className="text-xs text-zinc-500">管理 AI 业务能力、版本草稿与指令规范</span>
            </div>
          </CommandItem>
          <CommandItem
            value="导入业务 Skill 受控导入 Markdown 业务指令草稿"
            onSelect={() => {
              navigate("/skills/import");
              setCmdKOpen(false);
            }}
          >
            <IconUpload className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">导入业务 Skill</span>
              <span className="text-xs text-zinc-500">以受控方式导入 Markdown 业务指令草稿</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="平台管控">
          <CommandItem
            value="平台插件管理 平台层插件开放 依赖冲突核对 下架控制"
            onSelect={() => {
              setActiveView("platform");
              navigate("/platform/plugins");
              setCmdKOpen(false);
            }}
          >
            <IconShield className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">平台插件管理</span>
              <span className="text-xs text-zinc-500">平台层插件开放、依赖冲突核对与下架控制</span>
            </div>
          </CommandItem>
          <CommandItem
            value="插件受控引入说明 宿主构建打包 插件安装规范"
            onSelect={() => {
              setActiveView("platform");
              navigate("/platform/plugins/install");
              setCmdKOpen(false);
            }}
          >
            <IconBookOpen className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">插件受控引入说明</span>
              <span className="text-xs text-zinc-500">查看宿主构建打包与插件安装规范</span>
            </div>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="系统与审计">
          <CommandItem
            value="分域操作审计记录 账号维护 平台插件 隔离审计"
            onSelect={() => {
              navigate("/system/audit");
              setCmdKOpen(false);
            }}
          >
            <IconActivity className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">分域操作审计记录</span>
              <span className="text-xs text-zinc-500">查询账号维护、平台插件与本人业务隔离审计</span>
            </div>
          </CommandItem>
          <CommandItem
            value="系统偏好与企业基础信息 个人偏好 界面密度 自托管实例"
            onSelect={() => {
              navigate("/settings");
              setCmdKOpen(false);
            }}
          >
            <IconSettings className="mr-2 h-4 w-4 text-zinc-600" />
            <div className="flex flex-col">
              <span className="font-medium text-zinc-900">系统偏好与企业基础信息</span>
              <span className="text-xs text-zinc-500">配置个人偏好、界面密度及自托管实例参数</span>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
