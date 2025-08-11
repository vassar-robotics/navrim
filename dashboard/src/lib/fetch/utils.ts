export class FetcherError extends Error {
  statusCode: number
  raw?: unknown

  constructor(message: string, statusCode = 500, raw?: unknown) {
    super(message)
    this.name = 'FetcherError'
    this.statusCode = statusCode
    this.raw = raw
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new FetcherError(`Request timed out after ${ms}ms`, 408)), ms)
    promise
      .then((res) => {
        clearTimeout(timeout)
        resolve(res)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

export async function raiseFromResponse(response: Response): Promise<never> {
  let errorMessage = response.statusText
  try {
    const errorData = await response.json()
    if (errorData?.detail) errorMessage = errorData.detail
    if (typeof errorMessage === 'object') {
      errorMessage = JSON.stringify(errorMessage)
    }
  } catch (parseError) {
    // Try to get text response as fallback
    try {
      const textError = await response.text()
      if (textError) errorMessage = textError
    } catch {
      // Keep the original statusText if text parsing also fails
    }
  }

  throw new FetcherError(errorMessage, response.status)
}

export async function unwrapNavrimServiceResponse<T>(response: Response): Promise<T> {
  const result = await response.json()
  if (
    result &&
    typeof result === 'object' &&
    'code' in result &&
    typeof result.code === 'number' &&
    'message' in result &&
    typeof result.message === 'string' &&
    'data' in result &&
    typeof result.data === 'object'
  ) {
    if (result.code !== 0) {
      throw new FetcherError(result.message || 'API request failed')
    }
    return result.data as T
  } else {
    return result as T
  }
}
