// ================================================================
// IDEATOR — Full-Text Search Index (BE-8.1)
// Client-side search index for concepts, analyses, and assets
// ================================================================

import { StorageService } from '../storage/StorageService';

export interface SearchHit {
  id: string;
  type: 'concept' | 'analysis' | 'asset';
  name: string;
  snippet: string;
  score: number;
}

interface IndexEntry {
  id: string;
  type: 'concept' | 'analysis' | 'asset';
  name: string;
  tokens: string[];
  text: string;
}

export class SearchIndex {
  private entries: IndexEntry[] = [];
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async rebuild(): Promise<void> {
    this.entries = [];

    const concepts = await this.storage.getConcepts();
    for (const c of concepts) {
      this.entries.push({
        id: c.id,
        type: 'concept',
        name: c.name,
        tokens: this.tokenize(`${c.name} ${c.description} ${c.themes.join(' ')} ${c.domain}`),
        text: `${c.name} ${c.description} ${c.themes.join(' ')} ${c.domain}`,
      });
    }
  }

  async upsert(id: string, type: 'concept' | 'analysis' | 'asset', fields: Record<string, string>): Promise<void> {
    // Remove existing
    this.entries = this.entries.filter((e) => !(e.id === id && e.type === type));

    const text = Object.values(fields).join(' ');
    this.entries.push({
      id,
      type,
      name: fields['name'] ?? id,
      tokens: this.tokenize(text),
      text,
    });
  }

  async search(query: string, limit = 20): Promise<SearchHit[]> {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const results: SearchHit[] = [];

    for (const entry of this.entries) {
      let score = 0;
      for (const qt of queryTokens) {
        for (const et of entry.tokens) {
          if (et === qt) score += 10;
          else if (et.startsWith(qt)) score += 5;
          else if (et.includes(qt)) score += 2;
        }
      }

      if (score > 0) {
        const snippet = this.generateSnippet(entry.text, queryTokens);
        results.push({ id: entry.id, type: entry.type, name: entry.name, snippet, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  private generateSnippet(text: string, queryTokens: string[]): string {
    const lower = text.toLowerCase();
    let bestStart = 0;
    let bestScore = 0;

    for (let i = 0; i < lower.length - 100; i += 20) {
      const window = lower.slice(i, i + 200);
      let s = 0;
      for (const qt of queryTokens) {
        if (window.includes(qt)) s++;
      }
      if (s > bestScore) { bestScore = s; bestStart = i; }
    }

    const snippet = text.slice(bestStart, bestStart + 200).trim();
    return snippet.length < text.length ? `...${snippet}...` : snippet;
  }
}
