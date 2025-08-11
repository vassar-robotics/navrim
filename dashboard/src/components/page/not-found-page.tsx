import PageLayout from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Link } from 'react-router-dom'

export const NotFoundPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="max-w-md text-center">
        {/* 404 Text */}
        <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>

        {/* Error Message */}
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">Oops! The page you're looking for doesn't exist or has been moved.</p>

        {/* Back to Home Button */}
        <Button asChild size="lg">
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </PageLayout>
  )
}
