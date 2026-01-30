export class NetworkError extends Error {
  status: number
  retryable: boolean

  constructor(message: string, status: number, retryable: boolean) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
    this.retryable = retryable
  }
}

export class TimeoutError extends NetworkError {
  constructor(message = 'Request timeout') {
    super(message, 408, true)
    this.name = 'TimeoutError'
  }
}

export class RateLimitError extends NetworkError {
  retryAfter?: number

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 429, true)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}
