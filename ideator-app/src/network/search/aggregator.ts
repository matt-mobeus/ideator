import type { SearchResult } from '@/types/network.ts'
import { searchWeb } from './web-search-client.ts'

export async function aggregateSearchResults(
  queries: string[],
  apiKey: string,
  endpoint?: string
): Promise<SearchResult[]> {
  if (queries.length === 0) {
    return []
  }

  // Execute all queries in parallel
  const searchPromises = queries.map((query) =>
    searchWeb({ query }, apiKey, endpoint)
  )

  const resultsArrays = await Promise.all(searchPromises)

  // Flatten all results
  const allResults = resultsArrays.flat()

  // Deduplicate by URL
  const seen = new Set<string>()
  const deduplicated: SearchResult[] = []

  for (const result of allResults) {
    if (!seen.has(result.url)) {
      seen.add(result.url)
      deduplicated.push(result)
    }
  }

  // Sort by relevance heuristic (results from earlier queries are more relevant)
  // We maintain the order but prioritize uniqueness
  return deduplicated
}
