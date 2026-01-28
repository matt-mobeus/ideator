// ============================================================================
// IDEATOR — Network Error Hierarchy (NET-6.4)
// Normalized error classes for all API integrations
// ============================================================================

/** Base network error with normalized fields */
export class NetworkError extends Error {
  /** Machine-readable error code */
  code: string;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Whether this error is retryable */
  retryable: boolean;
  /** Which API provider produced this error */
  provider: string;
  /** Original error from the provider SDK */
  originalError?: Error;

  constructor(
    message: string,
    options: {
      code: string;
      statusCode?: number;
      retryable: boolean;
      provider: string;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'NetworkError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable;
    this.provider = options.provider;
    this.originalError = options.originalError;
  }
}

/** Thrown when API rate limits are hit */
export class RateLimitError extends NetworkError {
  /** Milliseconds until the rate limit resets */
  retryAfter: number;

  constructor(provider: string, retryAfter: number, originalError?: Error) {
    super(`Rate limit exceeded for ${provider}. Retry after ${retryAfter}ms.`, {
      code: 'RATE_LIMIT',
      statusCode: 429,
      retryable: true,
      provider,
      originalError,
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/** Thrown when authentication fails (invalid/expired keys) */
export class AuthenticationError extends NetworkError {
  constructor(provider: string, originalError?: Error) {
    super(`Authentication failed for ${provider}. Check your API key.`, {
      code: 'AUTH_FAILED',
      statusCode: 401,
      retryable: false,
      provider,
      originalError,
    });
    this.name = 'AuthenticationError';
  }
}

/** Thrown when a request times out */
export class TimeoutError extends NetworkError {
  constructor(provider: string, timeoutMs: number, originalError?: Error) {
    super(`Request to ${provider} timed out after ${timeoutMs}ms.`, {
      code: 'TIMEOUT',
      retryable: true,
      provider,
      originalError,
    });
    this.name = 'TimeoutError';
  }
}

/** Thrown for provider-specific errors (5xx, unexpected responses) */
export class ProviderError extends NetworkError {
  constructor(provider: string, statusCode: number, message: string, originalError?: Error) {
    super(`${provider} error (${statusCode}): ${message}`, {
      code: 'PROVIDER_ERROR',
      statusCode,
      retryable: statusCode >= 500,
      provider,
      originalError,
    });
    this.name = 'ProviderError';
  }
}

/**
 * Maps a raw error from any provider into a normalized NetworkError.
 * Each provider client should call this to normalize its errors.
 */
export function normalizeError(provider: string, error: unknown): NetworkError {
  if (error instanceof NetworkError) return error;

  const err = error instanceof Error ? error : new Error(String(error));

  // Generic fallback — provider-specific clients should override
  return new ProviderError(provider, 0, err.message, err);
}
