"use client"

import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                size="sm"
                tooltip={item.title}
                className="group h-9 w-full justify-start rounded-lg px-3 transition-all duration-200 hover:bg-primary/5 text-muted-foreground hover:text-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              >
                <a href={item.url} className="flex items-center gap-3">
                  <div className="p-1 rounded-sm transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                    <item.icon size={14} />
                  </div>
                  <span className="group-data-[collapsible=icon]:hidden text-sm font-medium">
                    {item.title}
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 