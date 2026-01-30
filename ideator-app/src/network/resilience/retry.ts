import { NetworkError } from './errors.ts'

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
}

const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_BASE_DELAY = 1000
const DEFAULT_MAX_DELAY = 10000

function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return error.retryable
  }

  // Check for errors with retryable property
  if (
    error &&
    typeof error === 'object' &&
    'retryable' in error &&
    typeof error.retryable === 'boolean'
  ) {
    return error.retryable
  }

  // Check for network/connection errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch')
    )
  }

  return false
}

function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt)

  // Add jitter (random 0-25% of delay)
  const jitter = exponentialDelay * Math.random() * 0.25

  const totalDelay = exponentialDelay + jitter

  return Math.min(totalDelay, maxDelay)
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const maxAttempts = opts?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS
  const baseDelay = opts?.baseDelay ?? DEFAULT_BASE_DELAY
  const maxDelay = opts?.maxDelay ?? DEFAULT_MAX_DELAY

  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry on last attempt
      if (attempt === maxAttempts - 1) {
        break
      }

      // Only retry if error is retryable
      if (!isRetryableError(error)) {
        throw error
      }

      const delay = calculateDelay(attempt, baseDelay, maxDelay)
      await sleep(delay)
    }
  }

  // If we get here, all attempts failed
  throw lastError
}
