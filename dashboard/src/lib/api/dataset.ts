import { fetcher } from '@/lib/fetch'
import type { ListDatasetsResponse } from '@/protocol/response'

export const DatasetApi = {
  endpoints: {
    listDatasets: '/datasets/list',
  },

  listDatasets: async (): Promise<ListDatasetsResponse> => {
    return fetcher(DatasetApi.endpoints.listDatasets, { method: 'POST' })
  },
}
