"use client"

import * as React from "react"
import {
  ArrowUpCircle,
  BarChart3,
  Camera,
  ClipboardList,
  Database,
  FileCode,
  File,
  FileText,
  Folder,
  HelpCircle,
  LayoutDashboard,
  List,
  Search,
  Settings,
  Users,
  Image,
  Lightbulb,
  BotMessageSquare,
  Wheat,
  Sprout,
  Sun,
  CloudRain,
  Droplets,
  TrendingUp,
  Calendar,
  MapPin,
  Camera as CameraIcon,
  BookOpen,
  Thermometer,
  DollarSign,
  FileCheck,
  Target,
  Notebook,
  ShoppingCart,
  Home,
  Cpu,
  ChartLine,
  HandCoins,
  BarChart4,
  CalendarDays,
  Zap,
} from "lucide-react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "営農アシスタント",
    email: "farmer@agri-agent.com",
    avatar: "/avatars/farmer-expert.jpg",
  },
  // 6つのAIエージェントクラスター
  aiClusters: [
    {
      title: "農業データリサーチ",
      icon: Search,
      agents: [
        {
          title: "補助金ウォッチャー",
          url: "/subsidy-watcher",
          icon: DollarSign,
          description: "全国の補助金情報を監視・推薦"
        }
      ]
    },
    {
      title: "生産管理・計画",
      icon: Target,
      agents: [
        {
          title: "作付プランナー",
          url: "/crop-planner",
          icon: CalendarDays,
          description: "最適な作付計画と輪作体系を立案"
        },
        {
          title: "水肥最適化ボット",
          url: "/irrigation-optimizer",
          icon: Droplets,
          description: "品質を最大化する水・肥料管理"
        }
      ]
    },
    {
      title: "申請・手続クラスター",
      icon: FileCheck,
      agents: [
        {
          title: "農地取得ナビ",
          url: "/land-acquisition",
          icon: MapPin,
          description: "農地取得・賃借手続きをナビゲート"
        },
        {
          title: "補助金フォームビルダー",
          url: "/subsidy-forms",
          icon: FileText,
          description: "申請フォームを自動入力"
        }
      ]
    },
    {
      title: "日報・ナレッジ",
      icon: Notebook,
      agents: [
        {
          title: "日報パーサー",
          url: "/daily-report",
          icon: ClipboardList,
          description: "音声・手書きメモを構造化データに変換"
        },
        {
          title: "労務シフトオーガナイザー",
          url: "/work-scheduler",
          icon: Calendar,
          description: "最適な人員配置と労務シフトを作成"
        }
      ]
    },
    {
      title: "市場・販路拡大",
      icon: ShoppingCart,
      agents: [
        {
          title: "Agri-Pitch AI",
          url: "/agri-pitch",
          icon: Zap,
          description: "魅力的なブランドストーリーを自動生成"
        },
        {
          title: "直販チャネルマッチャー",
          url: "/sales-channel",
          icon: TrendingUp,
          description: "最適な直販チャネルを推薦"
        }
      ]
    },
    {
      title: "生活・移住支援",
      icon: Home,
      agents: [
        {
          title: "お試し滞在サーチャー",
          url: "/trial-stay",
          icon: MapPin,
          description: "短期滞在プログラムや空き家情報を提供"
        },
        {
          title: "生活コストシミュレーター",
          url: "/cost-simulator",
          icon: BarChart4,
          description: "移住後の生活費や営農収支をシミュレーション"
        }
      ]
    }
  ],
  navMain: [
    {
      title: "ダッシュボード",
      url: "/",
      icon: BarChart3,
    },
    {
      title: "日報入力",
      url: "/daily-input",
      icon: Notebook,
    },
    {
      title: "AIエージェント",
      url: "/ai-agents",
      icon: Cpu,
    },
    {
      title: "品目データ",
      url: "/crop-data",
      icon: Wheat,
    },
  ],
  navSecondary: [
    {
      title: "効果測定",
      url: "/analytics",
      icon: ChartLine,
    },
    {
      title: "設定",
      url: "/settings",
      icon: Settings,
    },
  ],
  documents: [
    {
      name: "営農ガイド",
      url: "/guide",
      icon: BookOpen,
    },
    {
      name: "実証事例",
      url: "/case-studies",
      icon: Lightbulb,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible="icon"
      className="group-data-[collapsible=icon]:w-16 bg-gradient-to-b from-sidebar to-sidebar/95 border-r-2 border-primary/10 shadow-lg"
      {...props}
    >
      <SidebarHeader className="border-b border-primary/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="group data-[slot=sidebar-menu-button]:!p-3 hover:bg-primary/5 transition-colors duration-200"
            >
              <Link href="/" className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:justify-center">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <Wheat size={18} className="text-primary-foreground" />
                </div>
                <div className="group-data-[collapsible=icon]:hidden flex flex-col">
                  <span className="text-sm font-bold text-primary leading-tight">🌾 AGRI</span>
                  <span className="text-xs text-muted-foreground leading-tight">Agent</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={data.navMain} />
        
        <div className="group-data-[collapsible=icon]:hidden">
          <NavDocuments items={data.documents} />
        </div>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-primary/10 p-2">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 