import type { SearchResult } from '@/types/network.ts'

export interface EnrichedResults {
  grouped: Record<string, SearchResult[]>
  dateRange: {
    earliest?: string
    latest?: string
  }
  totalResults: number
}

export function enrichResults(results: SearchResult[]): EnrichedResults {
  const grouped: Record<string, SearchResult[]> = {}
  const dates: string[] = []

  for (const result of results) {
    // Group by source
    const source = result.source || 'unknown'
    if (!grouped[source]) {
      grouped[source] = []
    }
    grouped[source].push(result)

    // Collect dates
    if (result.publishedDate) {
      dates.push(result.publishedDate)
    }
  }

  // Sort dates to find range
  dates.sort()

  return {
    grouped,
    dateRange: {
      earliest: dates.length > 0 ? dates[0] : undefined,
      latest: dates.length > 0 ? dates[dates.length - 1] : undefined,
    },
    totalResults: results.length,
  }
}
