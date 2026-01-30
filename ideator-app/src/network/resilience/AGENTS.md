<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Resilience Patterns

## Purpose

Implements network resilience patterns including exponential backoff retry logic, circuit breakers, rate limiting, and error classification. Provides reusable utilities for handling transient failures, API rate limits, and network instability. Ensures graceful degradation and automatic recovery from temporary issues.

## Key Files

| File | Description |
|------|-------------|
| `retry.ts` | Exponential backoff retry logic with configurable policies |
| `errors.ts` | Error classification and handling utilities |
| `index.ts` | Public exports for resilience patterns |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Retry Policy**: Configure max attempts, backoff multiplier, jitter
2. **Error Classification**: Distinguish retryable vs non-retryable errors
3. **Circuit Breaker**: Prevent cascading failures by failing fast
4. **Rate Limiting**: Respect API quotas with exponential backoff

### Testing

- Test retry behavior with mock failures
- Verify exponential backoff timing
- Test circuit breaker state transitions
- Validate rate limit handling

### Common Patterns

- **Retry Wrapper**: `withRetry(fn, policy)` wraps any async function
- **Error Types**: `isRetryable(error)` determines if retry should occur
- **Backoff**: `baseDelay * (multiplier ** attempt) + jitter`
- **Circuit States**: Closed → Open → Half-Open → Closed

## Dependencies

### Internal
- Network configuration from `@/config/network.config.ts`
- Used by all network service clients

### External
- None (pure TypeScript utilities)

<!-- MANUAL: -->
