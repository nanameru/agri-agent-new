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
    name: "農業エキスパート",
    email: "expert@agri-agent.com",
    avatar: "/avatars/farmer-expert.jpg",
  },
  navMain: [
    {
      title: "ダッシュボード",
      url: "/",
      icon: Sprout,
    },
    {
      title: "作物管理",
      url: "/crops",
      icon: Wheat,
    },
    {
      title: "気象情報",
      url: "/weather",
      icon: Sun,
    },
    {
      title: "灌水管理",
      url: "/irrigation",
      icon: Droplets,
    },
    {
      title: "収穫データ",
      url: "/harvest",
      icon: TrendingUp,
    },
  ],
  navSecondary: [
    {
      title: "作業カレンダー",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "圃場マップ",
      url: "/fields",
      icon: MapPin,
    },
  ],
  documents: [
    {
      name: "農業知識",
      url: "/knowledge",
      icon: BookOpen,
    },
    {
      title: "ツール活用例",
      url: "/usecases",
      icon: Lightbulb,
    },
    {
      name: "記録・レポート",
      url: "/reports",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2 p-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Wheat size={20} className="text-primary-foreground" />
                </div>
                <span className="text-base font-semibold text-primary">🌾 AGRI-Agent</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 