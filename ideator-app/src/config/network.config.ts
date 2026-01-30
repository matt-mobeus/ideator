export const NETWORK_CONFIG = {
  llm: {
    openai: {
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.3,
    },
    anthropic: {
      baseUrl: 'https://api.anthropic.com/v1',
      defaultModel: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.3,
    },
  },

  search: {
    maxResults: 10,
    timeoutMs: 15000,
  },

  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
  },

  rateLimit: {
    maxRequestsPerMinute: 30,
  },
} as const
