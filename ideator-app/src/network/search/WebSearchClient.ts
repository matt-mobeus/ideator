// ============================================================================
// IDEATOR — Web Search Client (NET-2.1)
// Abstracts web search — primary implementation uses Gemini grounding
// ============================================================================

import { GeminiClient } from '../clients/GeminiClient';

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
  private gemini: GeminiClient;

  constructor(gemini: GeminiClient) {
    this.gemini = gemini;
  }

  async search(query: string, options?: SearchOptions): Promise<SearchResults> {
    // Build a system instruction that incorporates filter options
    let systemInstruction =
      'You are a research assistant. Provide factual, well-sourced answers with specific data points, dates, and numbers when available.';

    if (options?.dateRange && options.dateRange !== 'all') {
      const ranges: Record<string, string> = {
        day: 'the past 24 hours',
        week: 'the past week',
        month: 'the past month',
        year: 'the past year',
      };
      systemInstruction += ` Focus on information from ${ranges[options.dateRange]}.`;
    }

    if (options?.domains && options.domains.length > 0) {
      systemInstruction += ` Prioritize sources from: ${options.domains.join(', ')}.`;
    }

    const grounded = await this.gemini.searchWithGrounding(query, {
      systemInstruction,
    });

    // Convert grounded results to normalized SearchResult format
    const results: SearchResult[] = grounded.sources.map((src) => ({
      title: src.title,
      url: src.url,
      snippet: src.snippet || grounded.content.slice(0, 200),
      source: extractDomain(src.url),
    }));

    // Apply domain exclusions in post-processing
    const filtered = options?.excludeDomains
      ? results.filter(
          (r) => !options.excludeDomains!.some((d) => r.url.includes(d))
        )
      : results;

    // Limit results
    const maxResults = options?.maxResults ?? 10;
    const limited = filtered.slice(0, maxResults);

    return {
      results: limited,
      totalEstimate: grounded.sources.length,
    };
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
