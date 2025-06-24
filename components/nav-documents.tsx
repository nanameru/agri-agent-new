"use client"

import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-4">
      <SidebarGroupLabel className="text-xs font-semibold text-primary/70 mb-2">
        ドキュメント
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === item.url}
              className="group h-9 w-full justify-start rounded-lg px-3 transition-all duration-200 hover:bg-primary/5 text-muted-foreground hover:text-primary"
            >
              <a href={item.url} className="flex items-center gap-3">
                <div className="p-1 rounded-sm transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                  <item.icon size={14} />
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
} 