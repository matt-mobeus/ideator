export interface ApiResponse<T> {
  data: T
  status: number
}

export interface ApiError {
  message: string
  status: number
  retryable: boolean
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmCompletionRequest {
  messages: LlmMessage[]
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

export interface LlmCompletionResponse {
  content: string
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  model: string
}

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
  publishedDate?: string
}

export interface SearchRequest {
  query: string
  maxResults?: number
  domains?: string[]
}
