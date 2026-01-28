// ============================================================================
// IDEATOR — Anthropic LLM Client (NET-1.1 provider)
// Claude API integration
// ============================================================================

import { ILLMClient, LLMOptions, LLMResponse } from './LLMClient';
import { HttpClient } from './HttpClient';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  normalizeError,
} from '../errors';

const ANTHROPIC_API_URL = 'https://api.anthropic.com';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export class AnthropicClient implements ILLMClient {
  private http: HttpClient;
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.defaultModel = model ?? DEFAULT_MODEL;
    this.http = new HttpClient({ baseUrl: ANTHROPIC_API_URL, timeout: 120_000 });
  }

  async complete(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.completeWithSystem('', prompt, options);
  }

  async completeWithSystem(
    system: string,
    user: string,
    options?: LLMOptions
  ): Promise<LLMResponse> {
    // TODO: Implement Anthropic Messages API call
    // POST /v1/messages
    // Headers: x-api-key, anthropic-version
    // Body: model, max_tokens, system, messages
    throw new Error('AnthropicClient.completeWithSystem not yet implemented');
  }

  async *streamComplete(
    prompt: string,
    options?: LLMOptions
  ): AsyncGenerator<string> {
    // TODO: Implement SSE streaming with Anthropic Messages API
    throw new Error('AnthropicClient.streamComplete not yet implemented');
  }

  /**
   * Map Anthropic API errors to normalized NetworkError types.
   */
  private handleError(status: number, body: string, originalError?: Error): never {
    if (status === 401) throw new AuthenticationError('anthropic', originalError);
    if (status === 429) {
      // TODO: parse retry-after header
      throw new RateLimitError('anthropic', 60_000, originalError);
    }
    throw new ProviderError('anthropic', status, body, originalError);
  }
}
