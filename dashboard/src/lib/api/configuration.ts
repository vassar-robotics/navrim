import { fetcher } from '@/lib/fetch'
import type { TokenRequest } from '@/protocol/request'
import type { GetThirdPartyTokensResponse, GetTokenResponse, VerifyTokenResponse } from '@/protocol/response'

export type TokenType = 'huggingface' | 'openai' | 'wandb'

export const ConfigurationApi = {
  endpoints: {
    getThirdPartyTokens: '/config/token/third-party/get',
    getToken: '/config/token/:tokenType/get',
    updateToken: '/config/token/:tokenType/update',
    deleteToken: '/config/token/:tokenType/delete',
    verifyToken: '/config/token/:tokenType/verify',
  },

  getThirdPartyTokens: async (): Promise<GetThirdPartyTokensResponse> => {
    return fetcher(ConfigurationApi.endpoints.getThirdPartyTokens, { method: 'POST' })
  },

  getToken: async (tokenType: TokenType): Promise<GetTokenResponse> => {
    return fetcher(ConfigurationApi.endpoints.getToken.replace('/:tokenType/', `/${tokenType}/`), { method: 'POST' })
  },

  updateToken: async (tokenType: TokenType, token: string): Promise<void> => {
    const request: TokenRequest = { token }
    return fetcher(ConfigurationApi.endpoints.updateToken.replace('/:tokenType/', `/${tokenType}/`), {
      method: 'POST',
      body: request,
    })
  },

  deleteToken: async (tokenType: TokenType): Promise<void> => {
    return fetcher(ConfigurationApi.endpoints.deleteToken.replace('/:tokenType/', `/${tokenType}/`), { method: 'POST' })
  },

  verifyToken: async (tokenType: TokenType, token: string): Promise<VerifyTokenResponse> => {
    const request: TokenRequest = { token }
    return fetcher(ConfigurationApi.endpoints.verifyToken.replace('/:tokenType/', `/${tokenType}/`), {
      method: 'POST',
      body: request,
    })
  },
}
