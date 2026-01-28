// ============================================================================
// IDEATOR — Circuit Breaker (NET-6.3)
// Prevents cascading failures when an API is down
// ============================================================================

export interface CircuitBreakerConfig {
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Number of successes in half-open to close */
  successThreshold: number;
  /** Milliseconds before transitioning from open to half-open */
  timeout: number;
}

export type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private stateChangeCallbacks: Array<(state: CircuitState) => void> = [];

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  getState(): CircuitState {
    if (this.state === 'open') {
      // Check if timeout has elapsed — move to half-open
      if (Date.now() - this.lastFailureTime >= this.config.timeout) {
        this.transitionTo('half-open');
      }
    }
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'open') {
      throw new Error('Circuit breaker is open. Request blocked.');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onStateChange(callback: (state: CircuitState) => void): void {
    this.stateChangeCallbacks.push(callback);
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo('closed');
      }
    }
    if (this.state === 'closed') {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'half-open') {
      this.transitionTo('open');
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('open');
    }
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return;
    this.state = newState;
    if (newState === 'closed') {
      this.failureCount = 0;
      this.successCount = 0;
    }
    if (newState === 'half-open') {
      this.successCount = 0;
    }
    for (const cb of this.stateChangeCallbacks) {
      cb(newState);
    }
  }
}
