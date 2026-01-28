// ============================================================================
// IDEATOR — Base HTTP Client (NET-1.0)
// Foundational HTTP wrapper with interceptors, timeouts, cancellation
// ============================================================================

import { NetworkError, TimeoutError, normalizeError } from '../errors';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export type RequestInterceptor = (
  url: string,
  init: RequestInit
) => RequestInit | Promise<RequestInit>;

export type ResponseInterceptor = (
  response: Response
) => Response | Promise<Response>;

// ----------------------------------------------------------------------------
// HttpClient
// ----------------------------------------------------------------------------

export class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(options: { baseUrl?: string; timeout?: number } = {}) {
    this.baseUrl = options.baseUrl ?? '';
    this.defaultTimeout = options.timeout ?? 30_000;
  }

  /** Add a request interceptor (e.g., for auth headers) */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /** Add a response interceptor (e.g., for error normalization) */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('POST', url, body, options);
  }

  async put<T>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PUT', url, body, options);
  }

  async delete<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: HttpRequestOptions
  ): Promise<T> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    // Merge signals if caller provided one
    if (options?.signal) {
      options.signal.addEventListener('abort', () => abortController.abort());
    }

    let init: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: abortController.signal,
    };

    try {
      // Run request interceptors
      for (const interceptor of this.requestInterceptors) {
        init = await interceptor(fullUrl, init);
      }

      let response = await fetch(fullUrl, init);

      // Run response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new NetworkError(`HTTP ${response.status}: ${errorBody}`, {
          code: 'HTTP_ERROR',
          statusCode: response.status,
          retryable: response.status >= 500 || response.status === 429,
          provider: 'http',
        });
      }

      const data = (await response.json()) as T;
      return data;
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      if ((error as Error).name === 'AbortError') {
        throw new TimeoutError('http', timeout);
      }
      throw normalizeError('http', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
