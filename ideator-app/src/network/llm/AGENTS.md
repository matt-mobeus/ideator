<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-30 -->

# LLM Integration

## Purpose

Provides abstraction layer for multiple LLM providers (OpenAI, Anthropic, local models). Implements factory pattern for creating provider-specific clients with unified interface. Handles API authentication, request formatting, response parsing, and error normalization across different LLM APIs.

## Key Files

| File | Description |
|------|-------------|
| `factory.ts` | LLM provider factory for creating client instances |
| `types.ts` | TypeScript interfaces for LLM requests and responses |
| `index.ts` | Public exports for LLM integration |

## Subdirectories

None

## For AI Agents

### Working Instructions

1. **Provider Selection**: Use factory to create provider-specific client
2. **Unified Interface**: All providers implement same interface for consistency
3. **Error Handling**: Provider errors are normalized to common format
4. **API Keys**: Managed through configuration (not in code)

### Testing

- Test with mock providers for unit tests
- Verify response parsing for each provider
- Test error handling with invalid API keys
- Validate rate limiting behavior

### Common Patterns

- **Factory Pattern**: `createLLMClient(provider, config)`
- **Provider Abstraction**: Same interface across OpenAI, Anthropic, etc.
- **Streaming Support**: Handle streaming responses with callbacks
- **Token Counting**: Track usage across providers

## Dependencies

### Internal
- Network configuration from `@/config/network.config.ts`
- HTTP client from `@/network/http-client.ts`
- Types from `@/types/network.ts`

### External
- Native Fetch API for HTTP requests
- No provider-specific SDKs (using REST APIs directly)

<!-- MANUAL: -->
