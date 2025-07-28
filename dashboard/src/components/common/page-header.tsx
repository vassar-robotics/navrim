import type React from 'react'

const PageHeader: React.FC = () => {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:left-[var(--sidebar-width)] group-has-data-[variant=inset]/sidebar-wrapper:md:left-0">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  )
}

export default PageHeader
