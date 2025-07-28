import { apiCall } from '@/api/base';
import type { NoData } from '@/protocol';
import type { GetServerStatusResponse } from '@/protocol/response';

export const getServerStatus = () =>
  apiCall<NoData, GetServerStatusResponse>("/status/server/get", {});