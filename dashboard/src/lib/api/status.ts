import { fetcher } from '@/lib/fetch'
import type { GetServerStatusResponse } from '@/protocol/response'

export const StatusApi = {
  endpoints: {
    getServerStatus: '/status/server/get',
  },

  getServerStatus: async (): Promise<GetServerStatusResponse> => {
    return fetcher(StatusApi.endpoints.getServerStatus, { method: 'POST' })
  },
}
