import type { SearchRequest, SearchResult } from '@/types/network.ts'
import { httpClient } from '@/network/http-client.ts'
import { withRetry } from '@/network/resilience/retry.ts'
import { NetworkError } from '@/network/resilience/errors.ts'

export interface SearchApiResponse {
  results: Array<{
    title: string
    url: string
    snippet: string
    source?: string
    publishedDate?: string
  }>
}

const DEFAULT_SEARCH_ENDPOINT = 'https://api.search.example.com/search'

export async function searchWeb(
  request: SearchRequest,
  apiKey: string,
  endpoint: string = DEFAULT_SEARCH_ENDPOINT
): Promise<SearchResult[]> {
  if (!apiKey) {
    throw new NetworkError('API key is required', 401, false)
  }

  if (!request.query || request.query.trim().length === 0) {
    throw new NetworkError('Search query cannot be empty', 400, false)
  }

  const searchFn = async (): Promise<SearchResult[]> => {
    const response = await httpClient.post<SearchApiResponse>(
      endpoint,
      {
        query: request.query,
        max_results: request.maxResults ?? 10,
        domains: request.domains,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 15000,
      }
    )

    if (!response.data.results || !Array.isArray(response.data.results)) {
      throw new NetworkError('Invalid API response format', 500, false)
    }

    return response.data.results.map((result) => ({
      title: result.title || 'Untitled',
      url: result.url,
      snippet: result.snippet || '',
      source: result.source || extractDomain(result.url),
      publishedDate: result.publishedDate,
    }))
  }

  return withRetry(searchFn, {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000,
  })
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}
