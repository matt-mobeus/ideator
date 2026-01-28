// ============================================================================
// IDEATOR — Application Configuration
// ============================================================================

import { LLMProvider } from '../types';

/** Network layer configuration */
export interface NetworkConfig {
  llm: {
    provider: LLMProvider;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  rateLimits: {
    llmRequestsPerMinute: number;
    searchRequestsPerMinute: number;
    driveRequestsPerMinute: number;
  };
  retry: {
    maxRetries: number;
    baseDelay: number;
  };
  offline: {
    syncOnReconnect: boolean;
    maxQueueSize: number;
  };
}

/** Default configuration */
export const DEFAULT_CONFIG: NetworkConfig = {
  llm: {
    provider: LLMProvider.ANTHROPIC,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.3,
  },
  rateLimits: {
    llmRequestsPerMinute: 50,
    searchRequestsPerMinute: 100,
    driveRequestsPerMinute: 100,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
  },
  offline: {
    syncOnReconnect: true,
    maxQueueSize: 100,
  },
};

/** App version */
export const APP_VERSION = '1.0.0';
