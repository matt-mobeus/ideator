import type {
  LlmCompletionRequest,
  LlmCompletionResponse,
} from '@/types/network.ts'

export interface LlmProvider {
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResponse>
}
