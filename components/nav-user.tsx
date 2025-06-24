"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="group h-12 w-full justify-start rounded-lg px-3 transition-all duration-200 hover:bg-primary/5 data-[state=open]:bg-primary/10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
        >
          <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/20 group-hover:ring-primary/30 transition-all duration-200">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-bold">
              農
            </AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-primary">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
} 