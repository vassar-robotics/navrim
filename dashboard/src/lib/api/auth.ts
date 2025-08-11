import { fetcher } from '@/lib/fetch'
import type { ResetPasswordRequest, SignInCredentialsRequest, SignUpCredentialsRequest } from '@/protocol/request'
import type { SessionResponse, UserProfile } from '@/protocol/response'

export const AuthApi = {
  endpoints: {
    signup: '/auth/signup',
    signin: '/auth/signin',
    logout: '/auth/logout',
    session: '/auth/session',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
  },

  signup: async (email: string, password: string, displayName: string): Promise<void> => {
    const request: SignUpCredentialsRequest = {
      email,
      password,
      display_name: displayName,
    }
    return fetcher(AuthApi.endpoints.signup, { method: 'POST', body: request })
  },

  signin: async (email: string, password: string): Promise<SessionResponse> => {
    const request: SignInCredentialsRequest = {
      email,
      password,
    }
    return fetcher(AuthApi.endpoints.signin, { method: 'POST', body: request })
  },

  logout: async (): Promise<void> => {
    return fetcher(AuthApi.endpoints.logout, { method: 'POST' })
  },

  getSession: async (): Promise<SessionResponse> => {
    return fetcher(AuthApi.endpoints.session, { method: 'POST' })
  },

  getProfile: async (): Promise<UserProfile> => {
    return fetcher(AuthApi.endpoints.profile, { method: 'POST' })
  },

  forgotPassword: async (email: string): Promise<void> => {
    const request: ResetPasswordRequest = {
      email,
    }
    return fetcher(AuthApi.endpoints.forgotPassword, { method: 'POST', body: request })
  },
}
