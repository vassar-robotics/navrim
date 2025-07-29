import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Cog, CircleGauge, Gamepad2, Database, Brain, Cpu, MessageSquare, Settings, Camera } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import SidebarUser from '@/components/common/sidebar-user'

type SidebarMenuItem = {
  name: string
  items: {
    id: string
    label: string
    icon: LucideIcon
    href: string
  }[]
}

const sidebarMenuItems: SidebarMenuItem[] = [
  {
    name: 'main',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: CircleGauge,
        href: '/dashboard',
      },
      {
        id: 'control',
        label: 'Control',
        icon: Gamepad2,
        href: '/control',
      },
    ],
  },
  {
    name: 'ai',
    items: [
      {
        id: 'datasets',
        label: 'Datasets',
        icon: Database,
        href: '/datasets',
      },
      {
        id: 'Training',
        label: 'Training',
        icon: Brain,
        href: '/training',
      },
      {
        id: 'Inference',
        label: 'Inference',
        icon: Cpu,
        href: '/inference',
      },
      {
        id: 'Chat',
        label: 'Chat',
        icon: MessageSquare,
        href: '/chat',
      },
    ],
  },
  {
    name: 'settings',
    items: [
      {
        id: 'Configuration',
        label: 'Configuration',
        icon: Settings,
        href: '/configuration',
      },
      {
        id: 'Cameras',
        label: 'Cameras',
        icon: Camera,
        href: '/cameras',
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()

  return (
    <Sidebar className="h-auto border-r" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <Cog className="!size-5" />
                <span className="text-base font-semibold">Navrim</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {sidebarMenuItems.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name.toUpperCase()}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}
