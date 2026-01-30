import type { FileFormat, FileCategory } from '@/types/file.ts'
import { processTextFile } from './text-processor.ts'
import { processMultimediaFile } from './multimedia-processor.ts'
import { processStructuredFile } from './structured-processor.ts'

interface WorkerMessage {
  type: 'process'
  fileId: string
  blob: Blob
  format: FileFormat
  category: FileCategory
}

interface ProgressMessage {
  type: 'progress'
  fileId: string
  progress: number
  label: string
}

interface ResultMessage {
  type: 'result'
  fileId: string
  text: string
}

interface ErrorMessage {
  type: 'error'
  fileId: string
  error: string
}


self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, fileId, blob, format, category } = event.data

  if (type !== 'process') {
    return
  }

  try {
    // Send initial progress
    postProgress(fileId, 0, 'Starting processing...')

    let extractedText: string

    // Route to appropriate processor based on category
    switch (category) {
      case 'text':
        extractedText = await processTextFile(blob, format)
        break

      case 'multimedia':
        extractedText = await processMultimediaFile(blob, format)
        break

      case 'structured':
        extractedText = await processStructuredFile(blob, format)
        break

      default:
        throw new Error(`Unsupported category: ${category}`)
    }

    // Send completion progress
    postProgress(fileId, 100, 'Processing complete')

    // Send result
    const resultMessage: ResultMessage = {
      type: 'result',
      fileId,
      text: extractedText,
    }
    self.postMessage(resultMessage)

  } catch (error) {
    const errorMessage: ErrorMessage = {
      type: 'error',
      fileId,
      error: error instanceof Error ? error.message : String(error),
    }
    self.postMessage(errorMessage)
  }
}

function postProgress(fileId: string, progress: number, label: string): void {
  const progressMessage: ProgressMessage = {
    type: 'progress',
    fileId,
    progress,
    label,
  }
  self.postMessage(progressMessage)
}
