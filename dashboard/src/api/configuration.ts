import { apiCall } from '@/api/base';
import type { NoData } from '@/protocol';
import type { TokenRequest } from '@/protocol/request';
import type {
  GetTokenResponse,
  GetThirdPartyTokensResponse,
  VerifyTokenResponse
} from '@/protocol/response';

// Third-party tokens API
export const getThirdPartyTokens = () =>
  apiCall<NoData, GetThirdPartyTokensResponse>('/config/token/third-party/get', {});

// Huggingface token APIs
export const getHuggingfaceToken = () =>
  apiCall<NoData, GetTokenResponse>('/config/token/huggingface/get', {});

export const updateHuggingfaceToken = (token: string) =>
  apiCall<TokenRequest, NoData>('/config/token/huggingface/update', { token });

export const deleteHuggingfaceToken = () =>
  apiCall<NoData, NoData>('/config/token/huggingface/delete', {});

export const verifyHuggingfaceToken = (token: string) =>
  apiCall<TokenRequest, VerifyTokenResponse>('/config/token/huggingface/verify', { token });

// OpenAI token APIs
export const getOpenaiToken = () =>
  apiCall<NoData, GetTokenResponse>('/config/token/openai/get', {});

export const updateOpenaiToken = (token: string) =>
  apiCall<TokenRequest, NoData>('/config/token/openai/update', { token });

export const deleteOpenaiToken = () =>
  apiCall<NoData, NoData>('/config/token/openai/delete', {});

export const verifyOpenaiToken = (token: string) =>
  apiCall<TokenRequest, VerifyTokenResponse>('/config/token/openai/verify', { token });

// Wandb token APIs
export const getWandbToken = () =>
  apiCall<NoData, GetTokenResponse>('/config/token/wandb/get', {});

export const updateWandbToken = (token: string) =>
  apiCall<TokenRequest, NoData>('/config/token/wandb/update', { token });

export const deleteWandbToken = () =>
  apiCall<NoData, NoData>('/config/token/wandb/delete', {});

export const verifyWandbToken = (token: string) =>
  apiCall<TokenRequest, VerifyTokenResponse>('/config/token/wandb/verify', { token }); 