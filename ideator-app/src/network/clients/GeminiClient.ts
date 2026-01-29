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
  NetworkError,
  normalizeError,
} from '../errors';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com';
const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS = 4096;

// Gemini API response shapes
interface GeminiGenerateResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text?: string }>;
      role: string;
    };
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    groundingMetadata?: {
      searchEntryPoint?: { renderedContent: string };
      groundingChunks?: Array<{
        web?: { uri: string; title: string };
      }>;
      groundingSupports?: Array<{
        segment: { startIndex: number; endIndex: number; text: string };
        groundingChunkIndices: number[];
        confidenceScores: number[];
      }>;
      webSearchQueries?: string[];
    };
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

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
    const model = options?.model ?? this.defaultModel;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const body: Record<string, unknown> = {
      contents: [
        { role: 'user', parts: [{ text: user }] },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.jsonMode && { responseMimeType: 'application/json' }),
      },
    };

    if (system) {
      body.systemInstruction = { parts: [{ text: system }] };
    }

    try {
      const response = await this.http.post<GeminiGenerateResponse>(
        `/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        body,
        { timeout: options?.timeout ?? 120_000 }
      );

      return this.mapResponse(response, model);
    } catch (error) {
      if (error instanceof NetworkError) {
        this.rethrowAsTyped(error);
      }
      throw normalizeError('gemini', error);
    }
  }

  async *streamComplete(
    prompt: string,
    options?: LLMOptions
  ): AsyncGenerator<string> {
    const model = options?.model ?? this.defaultModel;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    const body: Record<string, unknown> = {
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
      },
    };

    try {
      const response = await this.http.requestRaw(
        'POST',
        `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`,
        body,
        { timeout: options?.timeout ?? 120_000 }
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
          if (!data) continue;

          try {
            const chunk: GeminiGenerateResponse = JSON.parse(data);
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } catch (error) {
      if (error instanceof NetworkError) throw error;
      throw normalizeError('gemini', error);
    }
  }

  /**
   * Execute a web-grounded search query using Gemini's grounding feature.
   * This is the primary web search mechanism for market analysis (NET-2.1).
   */
  async searchWithGrounding(
    query: string,
    options?: { maxResults?: number; systemInstruction?: string }
  ): Promise<GroundedSearchResult> {
    const model = this.defaultModel;

    const body: Record<string, unknown> = {
      contents: [
        { role: 'user', parts: [{ text: query }] },
      ],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        maxOutputTokens: DEFAULT_MAX_TOKENS,
        temperature: 0.2,
      },
    };

    if (options?.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    try {
      const response = await this.http.post<GeminiGenerateResponse>(
        `/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
        body,
        { timeout: 60_000 }
      );

      const candidate = response.candidates?.[0];
      const content = candidate?.content?.parts
        ?.map((p) => p.text ?? '')
        .join('') ?? '';

      const grounding = candidate?.groundingMetadata;

      const sources: GroundedSearchResult['sources'] = (
        grounding?.groundingChunks ?? []
      )
        .filter((chunk) => chunk.web)
        .map((chunk) => ({
          title: chunk.web!.title,
          url: chunk.web!.uri,
          snippet: '',
        }));

      // Try to enrich snippets from grounding supports
      if (grounding?.groundingSupports) {
        for (const support of grounding.groundingSupports) {
          for (const idx of support.groundingChunkIndices) {
            if (sources[idx] && !sources[idx].snippet) {
              sources[idx].snippet = support.segment.text;
            }
          }
        }
      }

      return {
        content,
        sources,
        searchQueries: grounding?.webSearchQueries ?? [],
      };
    } catch (error) {
      if (error instanceof NetworkError) {
        this.rethrowAsTyped(error);
      }
      throw normalizeError('gemini', error);
    }
  }

  private mapResponse(response: GeminiGenerateResponse, model: string): LLMResponse {
    const candidate = response.candidates?.[0];
    const content = candidate?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('') ?? '';

    let finishReason: LLMResponse['finishReason'] = 'stop';
    if (candidate?.finishReason === 'MAX_TOKENS') finishReason = 'length';
    else if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'OTHER') {
      finishReason = 'error';
    }

    return {
      content,
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
      model,
      finishReason,
    };
  }

  private rethrowAsTyped(error: NetworkError): never {
    if (error.statusCode === 401 || error.statusCode === 403) {
      throw new AuthenticationError('gemini', error);
    }
    if (error.statusCode === 429) {
      throw new RateLimitError('gemini', 60_000, error);
    }
    if (error.statusCode && error.statusCode >= 500) {
      throw new ProviderError('gemini', error.statusCode, error.message, error);
    }
    throw error;
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
