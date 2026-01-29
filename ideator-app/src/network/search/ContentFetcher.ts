// ============================================================================
// IDEATOR — Content Fetcher (NET-2.2)
// Fetches and extracts full page content from search result URLs
// ============================================================================

const MAX_TEXT_LENGTH = 8000;

/** Extracted page content */
export interface PageContent {
  url: string;
  title: string;
  /** Main text content (HTML stripped) */
  text: string;
  /** Truncated to fit LLM context */
  truncatedText: string;
  /** Whether the page was successfully fetched */
  success: boolean;
  /** Error message if fetch failed */
  error?: string;
}

export class ContentFetcher {
  private cache = new Map<string, PageContent>();

  /** Fetch and extract main content from a URL */
  async fetchPage(url: string): Promise<PageContent> {
    const cached = this.cache.get(url);
    if (cached) return cached;

    try {
      const response = await fetch(url, {
        headers: { 'Accept': 'text/html,application/xhtml+xml,text/plain' },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        return this.errorResult(url, `HTTP ${response.status}`);
      }

      const html = await response.text();
      const title = this.extractTitle(html);
      const text = this.extractText(html);
      const truncatedText = text.slice(0, MAX_TEXT_LENGTH);

      const result: PageContent = { url, title, text, truncatedText, success: true };
      this.cache.set(url, result);
      return result;
    } catch (err) {
      return this.errorResult(url, err instanceof Error ? err.message : 'Unknown error');
    }
  }

  /** Fetch multiple pages in parallel */
  async fetchPages(urls: string[]): Promise<PageContent[]> {
    return Promise.all(urls.map((url) => this.fetchPage(url)));
  }

  /** Clear the fetch cache */
  clearCache(): void {
    this.cache.clear();
  }

  private extractTitle(html: string): string {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return match ? match[1].trim().replace(/\s+/g, ' ') : '';
  }

  private extractText(html: string): string {
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[\s\S]*?<\/aside>/gi, '');

    text = text.replace(/<\/(p|div|h[1-6]|li|tr|br)[^>]*>/gi, '\n');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();

    return text;
  }

  private errorResult(url: string, error: string): PageContent {
    return { url, title: '', text: '', truncatedText: '', success: false, error };
  }
}
