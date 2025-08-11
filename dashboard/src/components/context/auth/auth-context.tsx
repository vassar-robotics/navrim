import { AuthApi } from '@/lib/api'
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
  } = useSWR<SessionResponse>(AuthApi.endpoints.session, () => AuthApi.getSession(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
  })
  const {
    data: userProfileData,
    isLoading: userProfileIsLoading,
    mutate: mutateUserProfile,
  } = useSWR<UserProfile>(AuthApi.endpoints.profile, () => AuthApi.getProfile(), {
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
    await AuthApi.signup(email, password, display_name).then(async () => {
      await mutate()
    })
  }

  const signin = async (email: string, password: string) => {
    await AuthApi.signin(email, password).then(async () => {
      await mutate()
    })
  }

  const logout = async () => {
    // TODO: Implement logout API endpoint when available
    // await AuthApi.logout().then(async () => {
    //   await mutate()
    // })
    await mutate()
  }

  return <AuthContext.Provider value={{ isLoading, auth, signup, signin, logout }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider, type AuthType, type AuthContextType }
