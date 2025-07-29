import type React from 'react'
import { createContext, useEffect, useState } from 'react'
import type { Session, UserProfile } from '@/protocol/response'

interface AuthType {
  session: Session
  userProfile: UserProfile
}

interface AuthContextType {
  isLoading: boolean
  auth: AuthType | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setLoading] = useState(true)
  const [auth, setAuth] = useState<AuthType | null>(null)

  useEffect(() => {
    // load auth from local storage when the component mounts
    const storedAuth = localStorage.getItem('auth') || null
    setAuth(storedAuth ? JSON.parse(storedAuth) : null)
    setLoading(false)
  }, [])

  return <AuthContext.Provider value={{ isLoading, auth }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
