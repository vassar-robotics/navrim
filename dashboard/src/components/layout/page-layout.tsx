import { cn } from '@/lib/utils'
import React from 'react'

const PageLayout: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
  return (
    <div className={cn('flex flex-1 items-center justify-center bg-background px-4 py-4 lg:px-6', className)}>
      {children}
    </div>
  )
}

export default PageLayout
