// ============================================================================
// IDEATOR — Web Search Client (NET-2.1)
// Abstracts web search — primary implementation uses Gemini grounding
// ============================================================================

/** Options for web search queries */
export interface SearchOptions {
  /** Max results to return (default 10) */
  maxResults?: number;
  /** Recency filter */
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  /** Whitelist domains */
  domains?: string[];
  /** Blacklist domains */
  excludeDomains?: string[];
}

/** Normalized search result */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: Date;
  source: string;
}

/** Collection of search results */
export interface SearchResults {
  results: SearchResult[];
  totalEstimate: number;
}

/** Provider-agnostic web search interface */
export interface IWebSearchClient {
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
}

/**
 * Gemini-grounded web search implementation.
 * Uses Gemini's built-in Google Search grounding for market analysis queries.
 */
export class GeminiWebSearchClient implements IWebSearchClient {
  // TODO: Accept GeminiClient dependency
  constructor() {}

  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    // TODO: Use GeminiClient.searchWithGrounding to perform grounded search
    // Convert GroundedSearchResult to SearchResults format
    throw new Error('GeminiWebSearchClient.search not yet implemented');
  }
}
