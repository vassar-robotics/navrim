import React from 'react'
import PageLayout from '@/components/layout/page-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const DatasetPageHeader: React.FC = () => {
  const [searchParams] = useSearchParams()
  const path = searchParams.get('path') || ''
  const pathParts = path.split('/').filter(Boolean)
  return (
    <div className="container mx-auto mb-4 flex items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BreadcrumbLink asChild>
                    <Link to="/datasets">navrim</Link>
                  </BreadcrumbLink>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Explore your datasets in <code>~/navrim/recordings</code>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/browse?path=${pathParts.slice(0, index + 1).join('/')}`}>{part}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {index < pathParts.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        variant="outline"
        className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add dataset from hub 🤗
      </Button>
    </div>
  )
}

export const DatasetPage: React.FC = () => {
  return (
    <PageLayout className="items-start">
      <DatasetPageHeader />
    </PageLayout>
  )
}
