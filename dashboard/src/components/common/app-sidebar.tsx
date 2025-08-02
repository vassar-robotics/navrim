import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import type React from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Cog, CircleGauge, Gamepad2, Database, Brain, Cpu, MessageSquare, Settings, Camera } from 'lucide-react'
import { useAuth } from '@/components/context/auth'
import { SidebarFooter } from '@/components/ui/sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { Bell, CreditCard, Ellipsis, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const displayNameFallback = 'John Doe'
const emailFallback = 'john.doe@example.com'

const SidebarUser: React.FC = () => {
  const { isMobile } = useSidebar()
  const { auth } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{auth?.userProfile?.display_name || displayNameFallback}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {auth?.session?.user_email || emailFallback}
                </span>
              </div>
              <Ellipsis className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{auth?.userProfile?.display_name || displayNameFallback}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {auth?.session?.user_email || emailFallback}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircle className="mr-2 size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 size-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const AppSidebarFooter: React.FC = () => {
  const { auth } = useAuth()

  return (
    <SidebarFooter>
      {/* User Section */}
      {auth?.session ? (
        <SidebarUser />
      ) : (
        <div className="flex flex-col gap-2 p-2">
          <Button variant="secondary" asChild className="w-full">
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button asChild className="w-full">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </SidebarFooter>
  )
}

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

export const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({ ...props }) => {
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
      <AppSidebarFooter />
    </Sidebar>
  )
}
