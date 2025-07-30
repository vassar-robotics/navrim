import React from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/sidebar/app-sidebar'
import PageHeader from '@/components/common/page-header'
import { Outlet } from 'react-router-dom'

const RootLayout: React.FC = () => {
  return (
    <SidebarProvider
      className="hidden md:flex"
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 48)',
          '--header-height': 'calc(var(--spacing) * 12 + 1px)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset className="flex h-screen flex-col overflow-hidden">
        <PageHeader />
        <div className="flex flex-col flex-1 overflow-auto pt-[var(--header-height)]">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default RootLayout
