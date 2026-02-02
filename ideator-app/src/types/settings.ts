import type { EncryptedValue } from '@/utils/crypto.ts'

export type LlmProvider = 'openai' | 'anthropic' | 'gemini'

/** An API key field stored in IndexedDB — may be plaintext (legacy) or encrypted. */
export type ApiKeyField = string | EncryptedValue | undefined

export interface LlmConfig {
  provider: LlmProvider
  apiKey: ApiKeyField
  model: string
}

export interface SearchConfig {
  enabled: boolean
  apiKey?: ApiKeyField
  provider?: string
}

export interface AppSettings {
  id: string
  llm: LlmConfig
  search: SearchConfig
  accentColor?: string
  createdAt: Date
  updatedAt: Date
}

export const DEFAULT_SETTINGS: Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  llm: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-2.0-flash',
  },
  search: {
    enabled: false,
  },
}
