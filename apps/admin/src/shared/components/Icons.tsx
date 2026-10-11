import React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";
import {
  User,
  Users,
  UserPlus,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  Copy,
  QrCode,
  X,
  XCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Power,
  LayoutDashboard,
  Puzzle,
  Sparkles,
  Settings,
  Activity,
  FileText,
  Upload,
  Download,
  Clock,
  ExternalLink,
  Command,
  LogOut,
  Sliders,
  Filter,
  Database,
  Server,
  Key,
  Terminal,
  Layers,
  HelpCircle,
  MoreHorizontal,
  MoreVertical,
  Bell,
  Cpu,
  Share2,
  Tag,
  BookOpen,
  Code,
  PanelLeft,
} from "lucide-react";

/**
 * 统一图标属性接口，向下兼容现有所有组件的 size / className 调用，
 * 并支持 Lucide 的 strokeWidth、color、style 等高级特性。
 */
export interface IconProps extends LucideProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}

/**
 * 工厂包装器：
 * 1. 默认规范尺寸 16px，与设计系统的文字基线与按钮紧凑度完美对齐；
 * 2. 默认 strokeWidth 为 1.75，呈现行业领先（如 Linear、Vercel）的精致工业级描边质感；
 * 3. 完整透传 SVG 与 Lucide 所有原生事件与属性。
 */
export function createIcon(LucideComponent: LucideIcon, defaultSize: number | string = 16) {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = defaultSize, strokeWidth = 1.75, className = "", ...props }, ref) => {
      return (
        <LucideComponent
          ref={ref}
          size={size}
          strokeWidth={strokeWidth}
          className={className}
          {...props}
        />
      );
    }
  );
  Component.displayName = `Icon(${LucideComponent.displayName || LucideComponent.name || "Lucide"})`;
  return Component;
}

// ============================================================================
// 1. 身份与组织语义 (Identity & Organization)
// ============================================================================
export const IconUser = createIcon(User);
export const IconUsers = createIcon(Users);
export const IconUserPlus = createIcon(UserPlus);
export const IconBuilding = createIcon(Building2);

// ============================================================================
// 2. 通讯与安全凭据语义 (Communication & Security)
// ============================================================================
export const IconMail = createIcon(Mail);
export const IconPhone = createIcon(Phone);
export const IconLock = createIcon(Lock);
export const IconEye = createIcon(Eye);
export const IconEyeOff = createIcon(EyeOff);
export const IconShield = createIcon(Shield);
export const IconShieldCheck = createIcon(ShieldCheck);
export const IconShieldAlert = createIcon(ShieldAlert);
export const IconKey = createIcon(Key);

// ============================================================================
// 3. 状态、反馈与通知语义 (Status, Feedback & Alerts)
// ============================================================================
export const IconCheck = createIcon(Check);
export const IconCheckCircle = createIcon(CheckCircle2);
export const IconAlertTriangle = createIcon(AlertTriangle);
export const IconAlertCircle = createIcon(AlertCircle);
export const IconInfo = createIcon(Info);
export const IconHelpCircle = createIcon(HelpCircle);
export const IconZap = createIcon(Zap);
export const IconBell = createIcon(Bell);

// ============================================================================
// 4. 导航与方向语义 (Navigation & Arrows)
// ============================================================================
export const IconChevronDown = createIcon(ChevronDown);
export const IconChevronRight = createIcon(ChevronRight);
export const IconChevronUp = createIcon(ChevronUp);
export const IconChevronLeft = createIcon(ChevronLeft);
export const IconArrowRight = createIcon(ArrowRight);
export const IconArrowLeft = createIcon(ArrowLeft);
export const IconExternalLink = createIcon(ExternalLink);
export const IconPanelLeft = createIcon(PanelLeft);

// ============================================================================
// 5. 操作与编辑语义 (Actions & Editing)
// ============================================================================
export const IconSearch = createIcon(Search);
export const IconCopy = createIcon(Copy);
export const IconQrCode = createIcon(QrCode);
export const IconX = createIcon(X);
export const IconXCircle = createIcon(XCircle);
export const IconPlus = createIcon(Plus);
export const IconTrash = createIcon(Trash2);
export const IconEdit = createIcon(Pencil);
export const IconRefresh = createIcon(RefreshCw);
export const IconPower = createIcon(Power);
export const IconUpload = createIcon(Upload);
export const IconDownload = createIcon(Download);
export const IconLogout = createIcon(LogOut);
export const IconSliders = createIcon(Sliders);
export const IconFilter = createIcon(Filter);
export const IconMoreHorizontal = createIcon(MoreHorizontal);
export const IconMoreVertical = createIcon(MoreVertical);
export const IconShare = createIcon(Share2);

// ============================================================================
// 6. 系统底座与业务架构语义 (Platform & Infrastructure)
// ============================================================================
export const IconDashboard = createIcon(LayoutDashboard);
export const IconPuzzle = createIcon(Puzzle);
export const IconSparkles = createIcon(Sparkles);
export const IconSettings = createIcon(Settings);
export const IconActivity = createIcon(Activity);
export const IconFileText = createIcon(FileText);
export const IconClock = createIcon(Clock);
export const IconCommand = createIcon(Command);
export const IconDatabase = createIcon(Database);
export const IconServer = createIcon(Server);
export const IconTerminal = createIcon(Terminal);
export const IconLayers = createIcon(Layers);
export const IconCpu = createIcon(Cpu);
export const IconTag = createIcon(Tag);
export const IconBookOpen = createIcon(BookOpen);
export const IconCode = createIcon(Code);

// ============================================================================
// 7. 官方第三方 OAuth 品牌矢量图标 (Official Brand Logomarks)
// ============================================================================
export const IconGoogle = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={className}
        {...props}
      >
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.57-5.17 3.57-9.15z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.28 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.24c-.25-.72-.39-1.5-.39-2.24s.14-1.52.39-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.72 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
        />
      </svg>
    );
  }
);
IconGoogle.displayName = "Icon(Google)";

export const IconGithub = React.forwardRef<SVGSVGElement, IconProps>(
  ({ size = 16, className = "", ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }
);
IconGithub.displayName = "Icon(Github)";
