// ============================================================================
// IDEATOR — Gemini LLM Client (NET-1.1 provider)
// Google Gemini API integration (also used for web search via grounding)
// ============================================================================

import { ILLMClient, LLMOptions, LLMResponse } from './LLMClient';
import { HttpClient } from './HttpClient';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
} from '../errors';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_MODEL = 'gemini-2.0-flash';

export class GeminiClient implements ILLMClient {
  private http: HttpClient;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.defaultModel = model ?? DEFAULT_MODEL;
    this.http = new HttpClient({ baseUrl: GEMINI_API_URL, timeout: 120_000 });
  }

  async complete(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.completeWithSystem('', prompt, options);
  }

  async completeWithSystem(
    system: string,
    user: string,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    // TODO: Implement Gemini generateContent API call
    // POST /v1beta/models/{model}:generateContent?key={apiKey}
    // Body: contents, generationConfig, systemInstruction
    throw new Error('GeminiClient.completeWithSystem not yet implemented');
  }

  async *streamComplete(
    prompt: string,
    options?: LLMOptions
  ): AsyncGenerator<string> {
    // TODO: Implement streaming via Gemini streamGenerateContent
    throw new Error('GeminiClient.streamComplete not yet implemented');
  }

  /**
   * Execute a web-grounded search query using Gemini's grounding feature.
   * This is used for market analysis web search (NET-2.1 via Gemini).
   */
  async searchWithGrounding(
    query: string,
    options?: { maxResults?: number }
  ): Promise<GroundedSearchResult> {
    // TODO: Implement Gemini grounding API
    // Uses tools: [{ googleSearch: {} }] in the request
    throw new Error('GeminiClient.searchWithGrounding not yet implemented');
  }

  private handleError(status: number, body: string, originalError?: Error): never {
    if (status === 401 || status === 403) throw new AuthenticationError('gemini', originalError);
    if (status === 429) throw new RateLimitError('gemini', 60_000, originalError);
    throw new ProviderError('gemini', status, body, originalError);
  }
}

/** Result from Gemini grounded search */
export interface GroundedSearchResult {
  /** Generated summary text with citations */
  content: string;
  /** Grounding sources returned by Gemini */
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  /** Search queries Gemini used */
  searchQueries: string[];
}
