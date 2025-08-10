import type { SWRConfiguration } from 'swr'

export const swrGlobalConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  shouldRetryOnError: true,
  errorRetryCount: 2,
  errorRetryInterval: 2000,
  dedupingInterval: 3000,
  focusThrottleInterval: 5000,
}
