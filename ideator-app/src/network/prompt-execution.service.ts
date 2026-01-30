import type { LlmProvider } from './llm/types.ts'

export interface ExecutePromptOptions {
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export async function executePrompt(
  provider: LlmProvider,
  systemPrompt: string,
  userPrompt: string,
  opts?: ExecutePromptOptions
): Promise<string> {
  const response = await provider.complete({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    jsonMode: opts?.jsonMode,
  })

  return response.content
}
