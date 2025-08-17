import { useAuth } from '@/components/context/auth/use-auth'
import React from 'react'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, auth } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!auth) {
    return <Navigate to="/signin" />
  }

  return <>{children}</>
}
