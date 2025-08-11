import { fetcher } from '@/lib/fetch'
import type { Session, SessionResponse, UserProfile } from '@/protocol/response'
import type React from 'react'
import { createContext } from 'react'
import useSWR from 'swr'

interface AuthType {
  session: Session
  userProfile: UserProfile
}

interface AuthContextType {
  isLoading: boolean
  auth: AuthType | null
  signup: (email: string, password: string, display_name: string) => Promise<void>
  signin: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    data: sessionData,
    isLoading: sessionIsLoading,
    mutate: mutateSession,
  } = useSWR<SessionResponse>('/auth/session', (url: string) => fetcher<SessionResponse>(url, { method: 'POST' }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
  })
  const {
    data: userProfileData,
    isLoading: userProfileIsLoading,
    mutate: mutateUserProfile,
  } = useSWR<UserProfile>('/auth/profile', (url: string) => fetcher<UserProfile>(url, { method: 'POST' }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
  })
  const isLoading = sessionIsLoading || userProfileIsLoading
  const auth =
    sessionData?.session && userProfileData
      ? {
          session: sessionData.session,
          userProfile: userProfileData,
        }
      : null

  const mutate = async () => {
    await mutateSession()
    await mutateUserProfile()
  }

  const signup = async (email: string, password: string, display_name: string) => {
    await fetcher('/auth/signup', {
      method: 'POST',
      body: {
        email,
        password,
        display_name,
      },
    }).then(async () => {
      await mutate()
    })
  }

  const signin = async (email: string, password: string) => {
    await fetcher('/auth/signin', {
      method: 'POST',
      body: {
        email,
        password,
      },
    }).then(async () => {
      await mutate()
    })
  }

  const logout = async () => {
    await fetcher('/auth/logout', {
      method: 'POST',
    }).then(async () => {
      await mutate()
    })
  }

  return <AuthContext.Provider value={{ isLoading, auth, signup, signin, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider, type AuthType, type AuthContextType }
