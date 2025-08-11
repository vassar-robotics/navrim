import { fetcher } from '@/lib/fetch'
import type { TokenRequest } from '@/protocol/request'
import type { GetThirdPartyTokensResponse, GetTokenResponse, VerifyTokenResponse } from '@/protocol/response'

export type TokenType = 'huggingface' | 'openai' | 'wandb'

export const ConfigurationApi = {
  // Get all third-party tokens at once
  getThirdPartyTokens: async (): Promise<GetThirdPartyTokensResponse> => {
    return fetcher('/config/token/third-party/get', { method: 'POST' })
  },

  // Get individual token
  getToken: async (tokenType: TokenType): Promise<GetTokenResponse> => {
    return fetcher(`/config/token/${tokenType}/get`, { method: 'POST' })
  },

  // Update token
  updateToken: async (tokenType: TokenType, token: string): Promise<void> => {
    const request: TokenRequest = { token }
    return fetcher(`/config/token/${tokenType}/update`, { method: 'POST', body: request })
  },

  // Delete token
  deleteToken: async (tokenType: TokenType): Promise<void> => {
    return fetcher(`/config/token/${tokenType}/delete`, { method: 'POST' })
  },

  // Verify token
  verifyToken: async (tokenType: TokenType, token: string): Promise<VerifyTokenResponse> => {
    const request: TokenRequest = { token }
    return fetcher(`/config/token/${tokenType}/verify`, { method: 'POST', body: request })
  },
}
