import type { LlmProvider } from './types.ts'
import type { LlmCompletionRequest, LlmCompletionResponse } from '@/types/network.ts'
import { logger } from '@/utils/logger.ts'

interface GeminiPart {
  text: string
}

interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

interface GeminiGenerationConfig {
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: string
}

interface GeminiRequestBody {
  system_instruction?: { parts: GeminiPart[] }
  contents: GeminiContent[]
  generationConfig: GeminiGenerationConfig
}

interface GeminiUsageMetadata {
  promptTokenCount: number
  candidatesTokenCount: number
  totalTokenCount: number
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: GeminiPart[]
    }
  }>
  usageMetadata?: GeminiUsageMetadata
}

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

export class GeminiProvider implements LlmProvider {
  private readonly apiKey: string
  private readonly model: string

  constructor(apiKey: string, model: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required')
    }
    this.apiKey = apiKey
    this.model = model
  }

  async complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse> {
    const systemMessages = request.messages.filter((m) => m.role === 'system')
    const conversationMessages = request.messages.filter((m) => m.role !== 'system')

    const body: GeminiRequestBody = {
      contents: conversationMessages.map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }],
      })),
      generationConfig: {},
    }

    if (systemMessages.length > 0) {
      body.system_instruction = {
        parts: systemMessages.map((m) => ({ text: m.content })),
      }
    }

    if (request.temperature !== undefined) {
      body.generationConfig.temperature = request.temperature
    }
    if (request.maxTokens !== undefined) {
      body.generationConfig.maxOutputTokens = request.maxTokens
    }
    if (request.jsonMode) {
      body.generationConfig.responseMimeType = 'application/json'
    }

    const url = `${GEMINI_API_BASE}/${this.model}:generateContent`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.error(`Gemini API error: ${response.status} ${errorBody}`)
      throw new Error(`Gemini API error (${response.status}): ${errorBody}`)
    }

    const data = (await response.json()) as GeminiResponse

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini')
    }

    const text = data.candidates[0].content.parts[0].text
    const usage = data.usageMetadata

    return {
      content: text,
      usage: {
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      },
      model: this.model,
    }
  }
}
