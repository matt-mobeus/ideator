import { logger } from '@/utils/logger'

export async function transcribeAudio(
  audioBlob: Blob,
  apiKey: string,
  provider: string
): Promise<string> {
  // Validate inputs
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Audio blob is required and cannot be empty')
  }

  if (!apiKey) {
    throw new Error('API key is required')
  }

  // Stub implementation - ready for Whisper API integration
  // TODO(#backlog): Implement actual transcription using OpenAI Whisper API when audio processing service is ready
  logger.warn(
    `Transcription requested for ${audioBlob.size} bytes using provider: ${provider}`
  )

  return '[Transcription not yet implemented]'
}
