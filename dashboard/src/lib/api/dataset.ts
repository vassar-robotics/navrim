import { fetcher } from '@/lib/fetch'
import type { BrowseDatasetResponse, DatasetInfoResponse, ListDatasetsResponse } from '@/protocol/response'

export const DatasetApi = {
  endpoints: {
    listDatasets: '/datasets/list',
    getDatasetInfo: '/dataset/info',
    browseDataset: '/dataset/browse',
  },

  listDatasets: async (): Promise<ListDatasetsResponse> => {
    return fetcher(DatasetApi.endpoints.listDatasets, { method: 'POST' })
  },

  getDatasetInfo: async (datasetName: string, isRemote: boolean): Promise<DatasetInfoResponse> => {
    return fetcher(DatasetApi.endpoints.getDatasetInfo, {
      method: 'POST',
      body: { dataset_name: datasetName, is_remote: isRemote },
    })
  },

  browseDataset: async (datasetName: string, isRemote: boolean, path: string): Promise<BrowseDatasetResponse> => {
    return fetcher(DatasetApi.endpoints.browseDataset, {
      method: 'POST',
      body: { dataset_name: datasetName, is_remote: isRemote, path },
    })
  },
}
