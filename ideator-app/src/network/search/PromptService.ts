// ============================================================================
// IDEATOR — Prompt Execution Service (NET-2.0)
// Service layer for executing LLM prompts with retry, parsing, cost tracking
// ============================================================================

import { ILLMClient, LLMResponse } from '../clients/LLMClient';
import { withRetry } from '../resilience/RetryStrategy';
import { RateLimiter } from '../resilience/RateLimiter';

/** A prompt ready for execution */
export interface Prompt {
  /** System message */
  system: string;
  /** User message (supports variable interpolation via {{var}}) */
  user: string;
  /** Variables to interpolate into user message */
  variables?: Record<string, string>;
  /** Whether to request JSON output */
  jsonMode?: boolean;
  /** Max tokens */
  maxTokens?: number;
  /** Temperature */
  temperature?: number;
}

/** Token usage tracking */
export interface CostTracker {
  totalInputTokens: number;
  totalOutputTokens: number;
  requestCount: number;
}

export class PromptService {
  private client: ILLMClient;
  private rateLimiter: RateLimiter;
  private costTracker: CostTracker = {
    totalInputTokens: 0,
    totalOutputTokens: 0,
    requestCount: 0,
  };

  constructor(client: ILLMClient, rateLimiter?: RateLimiter) {
    this.client = client;
    this.rateLimiter = rateLimiter ?? new RateLimiter({ requestsPerMinute: 50 });
  }

  /** Execute a single prompt */
  async execute(prompt: Prompt): Promise<LLMResponse> {
    await this.rateLimiter.acquire();

    const userMessage = this.interpolate(prompt.user, prompt.variables);

    const response = await this.client.completeWithSystem(
      prompt.system,
      userMessage,
      {
        maxTokens: prompt.maxTokens,
        temperature: prompt.temperature,
        jsonMode: prompt.jsonMode,
      }
    );

    this.trackCost(response);
    return response;
  }

  /** Execute with retry on transient failures */
  async executeWithRetry(prompt: Prompt, retries?: number): Promise<LLMResponse> {
    return withRetry(() => this.execute(prompt), {
      maxRetries: retries ?? 3,
    });
  }

  /** Execute multiple prompts (parallel with rate limiting) */
  async executeBatch(prompts: Prompt[]): Promise<LLMResponse[]> {
    const concurrency = 3;
    const results: LLMResponse[] = [];

    for (let i = 0; i < prompts.length; i += concurrency) {
      const batch = prompts.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((p) => this.executeWithRetry(p))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /** Extract JSON from LLM response (handles markdown code blocks) */
  static extractJSON<T>(response: LLMResponse): T {
    let text = response.content.trim();

    // Strip markdown code fences
    const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) {
      text = fenceMatch[1].trim();
    }

    // Find JSON array or object
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      text = jsonMatch[1];
    }

    return JSON.parse(text) as T;
  }

  /** Get current cost tracking data */
  getCostTracker(): CostTracker {
    return { ...this.costTracker };
  }

  /** Reset cost tracker */
  resetCostTracker(): void {
    this.costTracker = { totalInputTokens: 0, totalOutputTokens: 0, requestCount: 0 };
  }

  private interpolate(template: string, variables?: Record<string, string>): string {
    if (!variables) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);
  }

  private trackCost(response: LLMResponse): void {
    this.costTracker.totalInputTokens += response.usage.inputTokens;
    this.costTracker.totalOutputTokens += response.usage.outputTokens;
    this.costTracker.requestCount++;
  }
}
