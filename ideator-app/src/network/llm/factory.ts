import type { LlmConfig } from '@/types/settings.ts'
import type { LlmProvider } from './types.ts'
import { GeminiProvider } from './gemini-provider.ts'

export function createLlmProvider(config: LlmConfig): LlmProvider {
  switch (config.provider) {
    case 'openai':
      throw new Error(`Provider "${config.provider}" is not yet supported. Please select a different provider.`)
    case 'anthropic':
      throw new Error(`Provider "${config.provider}" is not yet supported. Please select a different provider.`)
    case 'gemini': {
      const key = typeof config.apiKey === 'string' ? config.apiKey : ''
      return new GeminiProvider(key, config.model)
    }
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
