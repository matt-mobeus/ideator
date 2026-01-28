// ============================================================================
// IDEATOR — LLM Client Interface (NET-1.1)
// Provider-agnostic interface for LLM completions
// ============================================================================

/** Options for LLM completion requests */
export interface LLMOptions {
  /** Max tokens to generate */
  maxTokens?: number;
  /** Sampling temperature (0-1) */
  temperature?: number;
  /** Model override */
  model?: string;
  /** Request JSON output */
  jsonMode?: boolean;
  /** Request timeout in ms */
  timeout?: number;
}

/** Structured LLM response */
export interface LLMResponse {
  /** Generated text content */
  content: string;
  /** Token usage */
  usage: { inputTokens: number; outputTokens: number };
  /** Model that was used */
  model: string;
  /** Why generation stopped */
  finishReason: 'stop' | 'length' | 'error';
}

/** Provider-agnostic LLM client interface */
export interface ILLMClient {
  /** Simple completion */
  complete(prompt: string, options?: LLMOptions): Promise<LLMResponse>;

  /** Completion with system + user messages */
  completeWithSystem(
    system: string,
    user: string,
    options?: LLMOptions
  ): Promise<LLMResponse>;

  /** Streaming completion */
  streamComplete(
    prompt: string,
    options?: LLMOptions
  ): AsyncGenerator<string>;
}
