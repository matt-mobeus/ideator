import type { LlmConfig } from '@/types/settings.ts'
import type { LlmProvider } from './types.ts'

export function createLlmProvider(config: LlmConfig): LlmProvider {
  switch (config.provider) {
    case 'openai':
      throw new Error('Not implemented yet')
    case 'anthropic':
      throw new Error('Not implemented yet')
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}
