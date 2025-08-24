import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Activity, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import type React from 'react'
import { useLocation } from 'react-router-dom'

interface BackgroundTask {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  description: string
  progress?: number
}

const BackgroundTasksDropdown: React.FC = () => {
  // Example background tasks
  const backgroundTasks: BackgroundTask[] = [
    {
      id: '1',
      name: 'Processing dataset',
      status: 'running',
      description: 'Analyzing and indexing 2,450 images',
      progress: 65,
    },
    {
      id: '2',
      name: 'Model training',
      status: 'completed',
      description: 'Successfully trained neural network model',
    },
    {
      id: '3',
      name: 'Export data',
      status: 'failed',
      description: 'Failed to export data to CSV format',
    },
  ]

  const getStatusIcon = (status: BackgroundTask['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="size-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="size-4 text-green-500" />
      case 'failed':
        return <XCircle className="size-4 text-red-500" />
      case 'pending':
        return <Clock className="size-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: BackgroundTask['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 dark:text-blue-400'
      case 'completed':
        return 'text-green-600 dark:text-green-400'
      case 'failed':
        return 'text-red-600 dark:text-red-400'
      case 'pending':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return ''
    }
  }

  const runningTasksCount = backgroundTasks.filter((task) => task.status === 'running').length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Activity className="size-4" />
          <span className="hidden sm:inline">Tasks</span>
          {runningTasksCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
              {runningTasksCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Background Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {backgroundTasks.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">No background tasks running</div>
        ) : (
          backgroundTasks.map((task) => (
            <DropdownMenuItem
              key={task.id}
              className="flex items-start gap-3 py-3 cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:scale-[1.01] group"
            >
              <div className="mt-0.5 transition-transform duration-200 group-hover:scale-110">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors duration-200">
                    {task.name}
                  </p>
                  <span
                    className={`text-xs font-medium capitalize ${getStatusColor(task.status)} transition-all duration-200 group-hover:scale-105`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">
                  {task.description}
                </p>
                {task.status === 'running' && task.progress && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all duration-300 group-hover:bg-blue-600"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{task.progress}% complete</p>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}
        {backgroundTasks.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:scale-[1.02]">
              View all tasks
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PageHeader: React.FC = () => {
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    const basename = path.split('/').filter(Boolean).pop() || 'welcome'

    // Convert kebab-case to camel case
    return basename
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) md:left-[var(--sidebar-width)] group-has-data-[variant=inset]/sidebar-wrapper:md:left-0">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <BackgroundTasksDropdown />
        </div>
      </div>
    </header>
  )
}

export default PageHeader
