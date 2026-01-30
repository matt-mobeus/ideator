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
  // TODO: Implement actual transcription using provider (e.g., OpenAI Whisper)
  console.warn(
    `Transcription requested for ${audioBlob.size} bytes using provider: ${provider}`
  )

  return '[Transcription not yet implemented]'
}
