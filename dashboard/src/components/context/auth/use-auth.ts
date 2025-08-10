import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '@/components/context/auth/auth-context'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
