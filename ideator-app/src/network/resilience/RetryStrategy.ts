// ============================================================================
// IDEATOR — Retry Strategy (NET-6.1)
// Exponential backoff with jitter for transient failures
// ============================================================================

import { NetworkError, RateLimitError } from '../errors';

export interface RetryConfig {
  /** Maximum number of retries (default 3) */
  maxRetries: number;
  /** Base delay in ms (default 1000) */
  baseDelay: number;
  /** Maximum delay in ms (default 30000) */
  maxDelay: number;
  /** Backoff multiplier (default 2) */
  backoffMultiplier: number;
  /** Error codes that should be retried */
  retryableErrors: string[];
  /** Callback on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30_000,
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMIT', 'TIMEOUT', 'PROVIDER_ERROR'],
};

/**
 * Execute an async function with retry logic.
 * Uses exponential backoff with jitter. Respects `retryAfter` on rate limit errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if retryable
      const isRetryable =
        error instanceof NetworkError
          ? error.retryable
          : false;

      if (!isRetryable || attempt >= cfg.maxRetries) {
        throw lastError;
      }

      cfg.onRetry?.(attempt + 1, lastError);

      // Calculate delay
      let delay: number;
      if (error instanceof RateLimitError && error.retryAfter > 0) {
        delay = error.retryAfter;
      } else {
        delay = Math.min(
          cfg.baseDelay * Math.pow(cfg.backoffMultiplier, attempt),
          cfg.maxDelay
        );
        // Add jitter (±25%)
        delay += delay * (Math.random() * 0.5 - 0.25);
      }

      await sleep(delay);
    }
  }

  throw lastError ?? new Error('Retry exhausted');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
