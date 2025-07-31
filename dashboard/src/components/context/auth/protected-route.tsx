// import { useAuth } from '@/components/context/auth/use-auth'
// import { Navigate } from 'react-router-dom'
import React from 'react'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { isLoading, auth } = useAuth()

  // if (isLoading) {
  //   return <div>Loading...</div>
  // }

  // if (!auth) {
  //   return <Navigate to="/signin" />
  // }

  return <>{children}</>
}
