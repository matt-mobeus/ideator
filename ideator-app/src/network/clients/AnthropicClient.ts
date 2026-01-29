// ============================================================================
// IDEATOR — Anthropic LLM Client (NET-1.1 provider)
// Claude API integration via Messages API
// ============================================================================

import { ILLMClient, LLMOptions, LLMResponse } from './LLMClient';
import { HttpClient } from './HttpClient';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  NetworkError,
  normalizeError,
} from '../errors';

const ANTHROPIC_API_URL = 'https://api.anthropic.com';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 4096;

// Anthropic Messages API response shape
interface AnthropicMessagesResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// SSE event shape
interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
  message?: AnthropicMessagesResponse;
  usage?: { output_tokens: number };
  error?: { type: string; message: string };
}

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
    const model = options?.model ?? this.defaultModel;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: user }],
    };

    if (system) {
      body.system = system;
    }
    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    try {
      const response = await this.http.post<AnthropicMessagesResponse>(
        '/v1/messages',
        body,
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'Content-Type': 'application/json',
          },
          timeout: options?.timeout ?? 120_000,
        }
      );

      return this.mapResponse(response);
    } catch (error) {
      if (error instanceof NetworkError) {
        this.rethrowAsTyped(error);
      }
      throw normalizeError('anthropic', error);
    }
  }

  async *streamComplete(
    prompt: string,
    options?: LLMOptions
  ): AsyncGenerator<string> {
    const model = options?.model ?? this.defaultModel;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    };

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    try {
      const response = await this.http.requestRaw(
        'POST',
        '/v1/messages',
        body,
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'Content-Type': 'application/json',
          },
          timeout: options?.timeout ?? 120_000,
        }
      );

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body for streaming');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;

          try {
            const event: AnthropicStreamEvent = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              yield event.delta.text;
            }
            if (event.type === 'error') {
              throw new ProviderError(
                'anthropic',
                0,
                event.error?.message ?? 'Stream error'
              );
            }
          } catch (e) {
            if (e instanceof NetworkError) throw e;
            // Skip unparseable lines
          }
        }
      }
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      throw normalizeError('anthropic', error);
    }
  }

  private mapResponse(response: AnthropicMessagesResponse): LLMResponse {
    const textContent = response.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('');

    let finishReason: LLMResponse['finishReason'] = 'stop';
    if (response.stop_reason === 'max_tokens') finishReason = 'length';
    else if (response.stop_reason === null) finishReason = 'error';

    return {
      content: textContent,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      model: response.model,
      finishReason,
    };
  }

  /** Re-throw NetworkError with provider-specific types */
  private rethrowAsTyped(error: NetworkError): never {
    if (error.statusCode === 401 || error.statusCode === 403) {
      throw new AuthenticationError('anthropic', error);
    }
    if (error.statusCode === 429) {
      throw new RateLimitError('anthropic', 60_000, error);
    }
    if (error.statusCode && error.statusCode >= 500) {
      throw new ProviderError('anthropic', error.statusCode, error.message, error);
    }
    throw error;
  }
}
