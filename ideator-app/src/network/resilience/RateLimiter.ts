// ============================================================================
// IDEATOR — Rate Limiter (NET-6.2)
// Client-side token bucket rate limiter
// ============================================================================

export interface RateLimitConfig {
  /** Max requests per minute */
  requestsPerMinute: number;
  /** Max requests per day (optional) */
  requestsPerDay?: number;
  /** Max tokens per minute — for LLM APIs (optional) */
  tokensPerMinute?: number;
}

/**
 * Token-bucket rate limiter.
 * Call `acquire()` before each request; it will delay if the limit is reached.
 */
export class RateLimiter {
  private config: RateLimitConfig;
  private timestamps: number[] = [];
  private dailyTimestamps: number[] = [];
  private queue: Array<() => void> = [];

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /** Wait until a request slot is available, then proceed */
  async acquire(): Promise<void> {
    const wait = this.getWaitTime();
    if (wait <= 0) {
      this.recordRequest();
      return;
    }

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.recordRequest();
        resolve();
      }, wait);
    });
  }

  /** Returns false if no slot is available right now */
  tryAcquire(): boolean {
    if (this.getWaitTime() > 0) return false;
    this.recordRequest();
    return true;
  }

  /** Returns ms until the next available request slot (0 if available now) */
  getWaitTime(): number {
    const now = Date.now();
    this.pruneOld(now);

    // Per-minute check
    if (this.timestamps.length >= this.config.requestsPerMinute) {
      const oldest = this.timestamps[0];
      return oldest + 60_000 - now;
    }

    // Per-day check
    if (
      this.config.requestsPerDay &&
      this.dailyTimestamps.length >= this.config.requestsPerDay
    ) {
      const oldest = this.dailyTimestamps[0];
      return oldest + 86_400_000 - now;
    }

    return 0;
  }

  private recordRequest(): void {
    const now = Date.now();
    this.timestamps.push(now);
    this.dailyTimestamps.push(now);
  }

  private pruneOld(now: number): void {
    const minuteAgo = now - 60_000;
    while (this.timestamps.length > 0 && this.timestamps[0] < minuteAgo) {
      this.timestamps.shift();
    }
    const dayAgo = now - 86_400_000;
    while (this.dailyTimestamps.length > 0 && this.dailyTimestamps[0] < dayAgo) {
      this.dailyTimestamps.shift();
    }
  }
}
