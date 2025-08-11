import { raiseFromResponse, unwrapNavrimServiceResponse, withTimeout } from '@/lib/fetch/utils'

// const DEFAULT_BASE_URL = window.location.port
//   ? `http://${window.location.hostname}:${window.location.port}`
//   : `http://${window.location.hostname}`
const DEFAULT_BASE_URL = 'http://localhost:8000'

export interface FetcherOptions {
  method?: string
  body?: unknown
  timeout?: number
  baseURL?: string
}

export async function fetcher<T = unknown>(path: string, options: FetcherOptions = {}): Promise<T> {
  const { method = 'GET', body, timeout = 10000, baseURL } = options
  const isFullUrl = /^https?:\/\//.test(path)
  const url = isFullUrl ? path : `${baseURL || DEFAULT_BASE_URL}${path}`
  const headers: Record<string, string> = {}
  headers['Content-Type'] = 'application/json'

  const response = await withTimeout(
    fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    }),
    timeout
  )
  if (!response.ok) {
    return raiseFromResponse(response)
  } else {
    return unwrapNavrimServiceResponse(response)
  }
}
