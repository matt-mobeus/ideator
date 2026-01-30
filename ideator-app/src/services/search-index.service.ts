import Fuse from 'fuse.js'
import type { Concept } from '@/types/concept.ts'

export interface SearchResult {
  item: Concept
  score: number
  matches?: readonly { key?: string; value?: string; indices: readonly [number, number][] }[]
}

class SearchIndexService {
  private fuse: Fuse<Concept> | null = null

  update(concepts: Concept[]): void {
    this.fuse = new Fuse(concepts, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'domain', weight: 1.5 },
        { name: 'themes', weight: 1 },
      ],
      includeScore: true,
      includeMatches: true,
      threshold: 0.4,
    })
  }

  search(query: string, limit = 20): SearchResult[] {
    if (!this.fuse || !query.trim()) return []

    const results = this.fuse.search(query, { limit })
    return results.map((r) => ({
      item: r.item,
      score: r.score ?? 1,
      matches: r.matches as SearchResult['matches'],
    }))
  }

  clear(): void {
    this.fuse = null
  }
}

export const searchIndex = new SearchIndexService()
