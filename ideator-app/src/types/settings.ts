export type LlmProvider = 'openai' | 'anthropic'

export interface LlmConfig {
  provider: LlmProvider
  apiKey: string
  model: string
}

export interface SearchConfig {
  enabled: boolean
  apiKey?: string
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
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o',
  },
  search: {
    enabled: false,
  },
}
