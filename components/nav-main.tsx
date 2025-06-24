"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-xs font-semibold text-primary/70 mb-2">
        メニュー
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.url
          return (
          <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title} 
                isActive={isActive} 
                asChild
                className={`group relative h-10 w-full justify-start rounded-lg px-3 transition-all duration-200 hover:bg-primary/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 ${
                  isActive 
                    ? 'bg-primary/15 text-primary shadow-sm border-l-2 border-primary group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:border-b-2' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  {item.icon && (
                    <div className={`p-1.5 rounded-md transition-colors duration-200 ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      <item.icon size={16} />
                    </div>
                  )}
                  <span className="group-data-[collapsible=icon]:hidden font-medium">
                    {item.title}
                  </span>
                  {isActive && (
                    <div className="group-data-[collapsible=icon]:hidden ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
} 