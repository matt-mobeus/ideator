import type { ApiResponse, ApiError } from '@/types/network.ts'

export interface HttpClientConfig {
  baseUrl?: string
  headers?: Record<string, string>
  timeout?: number
}

class HttpClientError extends Error implements ApiError {
  status: number
  retryable: boolean

  constructor(message: string, status: number, retryable: boolean) {
    super(message)
    this.name = 'HttpClientError'
    this.status = status
    this.retryable = retryable
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpClientError('Request timeout', 408, true)
    }
    throw error
  }
}

export const httpClient = {
  async get<T>(
    url: string,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = config?.baseUrl ? `${config.baseUrl}${url}` : url
    const timeout = config?.timeout ?? 30000

    try {
      const response = await fetchWithTimeout(
        fullUrl,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
        },
        timeout
      )

      if (!response.ok) {
        const retryable = response.status >= 500 || response.status === 429
        throw new HttpClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          retryable
        )
      }

      const data = await response.json()
      return {
        data,
        status: response.status,
      }
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error
      }
      // Network errors are retryable
      throw new HttpClientError(
        error instanceof Error ? error.message : 'Network error',
        0,
        true
      )
    }
  },

  async post<T>(
    url: string,
    body?: unknown,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = config?.baseUrl ? `${config.baseUrl}${url}` : url
    const timeout = config?.timeout ?? 30000

    try {
      const response = await fetchWithTimeout(
        fullUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        },
        timeout
      )

      if (!response.ok) {
        const retryable = response.status >= 500 || response.status === 429
        throw new HttpClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          retryable
        )
      }

      const data = await response.json()
      return {
        data,
        status: response.status,
      }
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error
      }
      // Network errors are retryable
      throw new HttpClientError(
        error instanceof Error ? error.message : 'Network error',
        0,
        true
      )
    }
  },
}
