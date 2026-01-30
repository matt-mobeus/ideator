import type { LlmConfig } from '@/types/settings.ts'
import type { LlmProvider } from './types.ts'

export function createLlmProvider(config: LlmConfig): LlmProvider {
  switch (config.provider) {
    case 'openai':
      throw new Error(`Provider "${config.provider}" is not yet supported. Please select a different provider.`)
    case 'anthropic':
      throw new Error(`Provider "${config.provider}" is not yet supported. Please select a different provider.`)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
