<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# Network Layer

## Purpose

Handles all external API communication with resilience patterns, retry logic, and rate limiting. Provides HTTP client abstraction, LLM integration, media processing APIs, and search services. Implements exponential backoff, circuit breakers, and error recovery for reliable network operations in unstable environments.

## Key Files

| File | Description |
|------|-------------|
| `http-client.ts` | Base HTTP client with timeout, retry, and error handling |
| `index.ts` | Network layer exports and public API |
| `prompt-execution.service.ts` | Service for executing LLM prompts with retry logic |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `llm/` | LLM API integration (OpenAI, Anthropic, local models) |
| `media/` | Media processing APIs (image, video, audio) |
| `resilience/` | Retry policies, circuit breakers, rate limiting |
| `search/` | Search API integrations (web search, semantic search) |
| `google-drive/` | Google Drive API integration (empty placeholder) |
| `offline/` | Offline fallback strategies (empty placeholder) |

## For AI Agents

### Working Instructions

1. **Import HTTP Client**: `import { httpClient } from '@/network/http-client'`
2. **Make Requests**: `await httpClient.get(url, options)` with automatic retry
3. **Error Handling**: All network errors are caught and wrapped with context
4. **Configuration**: Use `@/config/network.config.ts` for timeouts and retries

### Testing

- Test with network throttling in DevTools
- Verify retry behavior with failing endpoints
- Test timeout handling with slow responses
- Mock API responses for unit testing

### Common Patterns

- **Resilience First**: All external calls wrapped with retry + circuit breaker
- **Typed Responses**: Use TypeScript interfaces for API responses
- **Error Context**: Include request details in error messages
- **Rate Limiting**: Respect API limits with exponential backoff

## Dependencies

### Internal
- Configuration from `@/config/network.config.ts`
- Types from `@/types/network.ts`
- Used by `@/services/` layer for business logic

### External
- Native Fetch API for HTTP requests
- No external HTTP library dependencies (using native browser APIs)

<!-- MANUAL: -->
