// ============================================================================
// IDEATOR — Search Result Aggregator (NET-3.1)
// Aggregates, deduplicates, and ranks search results for LLM consumption
// ============================================================================

import { SearchResult, IWebSearchClient } from './WebSearchClient';

/** Categorization of a search source */
export type SourceCategory = 'news' | 'academic' | 'company' | 'government' | 'other';

/** An aggregated and ranked search result */
export interface AggregatedResult extends SearchResult {
  category: SourceCategory;
  relevanceScore: number;
}

/** Packaged context ready for LLM prompt injection */
export interface SearchContext {
  /** Formatted text block for LLM prompt */
  formattedContext: string;
  /** Individual sources for citation tracking */
  sources: AggregatedResult[];
  /** Total unique sources found */
  totalSources: number;
}

const DOMAIN_CATEGORIES: Record<string, SourceCategory> = {
  'reuters.com': 'news',
  'bloomberg.com': 'news',
  'techcrunch.com': 'news',
  'cnbc.com': 'news',
  'bbc.com': 'news',
  'nytimes.com': 'news',
  'wsj.com': 'news',
  'forbes.com': 'news',
  'arxiv.org': 'academic',
  'scholar.google.com': 'academic',
  'nature.com': 'academic',
  'sciencedirect.com': 'academic',
  'ieee.org': 'academic',
  'pubmed.ncbi.nlm.nih.gov': 'academic',
  'researchgate.net': 'academic',
  'crunchbase.com': 'company',
  'pitchbook.com': 'company',
  'linkedin.com': 'company',
  'sec.gov': 'government',
  'fda.gov': 'government',
  'epa.gov': 'government',
  'uspto.gov': 'government',
  'europa.eu': 'government',
};

export class SearchAggregator {
  private searchClient: IWebSearchClient;

  constructor(searchClient: IWebSearchClient) {
    this.searchClient = searchClient;
  }

  /**
   * Execute multiple queries, deduplicate, rank, and package results.
   */
  async aggregate(
    queries: Record<string, string>,
    maxResults = 20
  ): Promise<SearchContext> {
    // Execute all queries in parallel
    const queryEntries = Object.entries(queries);
    const searchPromises = queryEntries.map(([, query]) =>
      this.searchClient.search(query, { maxResults: 10 }).catch(() => ({ results: [], totalEstimate: 0 }))
    );
    const searchResults = await Promise.all(searchPromises);

    // Flatten all results
    const allResults: SearchResult[] = [];
    for (const sr of searchResults) {
      allResults.push(...sr.results);
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique: SearchResult[] = [];
    for (const r of allResults) {
      const normalized = r.url.replace(/\/$/, '').toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(r);
      }
    }

    // Categorize and score
    const aggregated: AggregatedResult[] = unique.map((r) => ({
      ...r,
      category: this.categorize(r.source),
      relevanceScore: this.scoreRelevance(r),
    }));

    // Sort by relevance score descending
    aggregated.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Take top N
    const topResults = aggregated.slice(0, maxResults);

    return {
      formattedContext: this.formatForLLM(topResults),
      sources: topResults,
      totalSources: unique.length,
    };
  }

  private categorize(domain: string): SourceCategory {
    const lower = domain.toLowerCase();
    for (const [pattern, category] of Object.entries(DOMAIN_CATEGORIES)) {
      if (lower.includes(pattern)) return category;
    }
    if (lower.endsWith('.gov')) return 'government';
    return 'other';
  }

  private scoreRelevance(result: SearchResult): number {
    let score = 50;

    const cat = this.categorize(result.source);
    if (cat === 'academic') score += 20;
    else if (cat === 'news') score += 15;
    else if (cat === 'government') score += 15;
    else if (cat === 'company') score += 10;

    if (result.publishedDate) {
      const ageDays = (Date.now() - result.publishedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 30) score += 15;
      else if (ageDays < 90) score += 10;
      else if (ageDays < 365) score += 5;
    }

    if (result.snippet.length > 100) score += 5;
    if (result.snippet.length > 200) score += 5;

    return Math.min(100, score);
  }

  private formatForLLM(results: AggregatedResult[]): string {
    if (results.length === 0) return 'No search results available.';

    const lines: string[] = ['## Research Sources\n'];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      lines.push(`### Source ${i + 1}: ${r.title}`);
      lines.push(`- URL: ${r.url}`);
      lines.push(`- Category: ${r.category}`);
      if (r.publishedDate) {
        lines.push(`- Date: ${r.publishedDate.toISOString().slice(0, 10)}`);
      }
      lines.push(`- Content: ${r.snippet}`);
      lines.push('');
    }

    return lines.join('\n');
  }
}
