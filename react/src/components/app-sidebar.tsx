"use client"

import * as React from "react"
import {
  Ban,
  HardDrive,
  Home,
  MapPinOff,
  Search,
  Server,
  Settings2,
  ShieldUser,
  UserCheck,
} from "lucide-react"

import { NavLinks } from "@/components/nav-links.tsx"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { ServerSwitcher } from "@/components/server-switcher.tsx"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Minecraft Server",
      logo: Server,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Whitelist",
      url: "/whitelist",
      icon: UserCheck,
    },
    {
      title: "Bans",
      url: "/bans",
      icon: Ban,
    },
    {
      title: "IP Bans",
      url: "/ip-bans",
      icon: MapPinOff,
    },
    {
      title: "Operators",
      url: "/operators",
      icon: ShieldUser,
    },
    {
      title: "Server",
      url: "/server",
      icon: HardDrive,
    }

  ],
  navSecondary: [
    {
      title: "Configuration",
      url: "/config",
      icon: Settings2,
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <ServerSwitcher servers={data.teams} />
      </SidebarHeader>
      <SidebarContent className="ml-2">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
