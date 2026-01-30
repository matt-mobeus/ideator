import type { SourceFile, FileFormat } from '@/types/file.ts'
import { processTextFile } from '@/workers/text-processor'
import { logger } from '@/utils/logger'

export type ProgressCallback = (progress: number, label: string) => void

interface WorkerMessage {
  type: 'process'
  fileId: string
  blob: Blob
  format: string
  category: string
}

interface WorkerResponse {
  type: 'progress' | 'result' | 'error'
  fileId: string
  progress?: number
  label?: string
  text?: string
  error?: string
}

class FileProcessingService {
  private worker: Worker | null = null
  private pendingRequests: Map<string, {
    resolve: (text: string) => void
    reject: (error: Error) => void
    onProgress?: (progress: number, label: string) => void
  }> = new Map()

  private initWorker(): void {
    if (this.worker) return

    this.worker = new Worker(
      new URL('../workers/file-processing.worker.ts', import.meta.url),
      { type: 'module' }
    )

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { type, fileId } = event.data
      const request = this.pendingRequests.get(fileId)

      if (!request) return

      switch (type) {
        case 'progress':
          if (request.onProgress && event.data.progress !== undefined && event.data.label) {
            request.onProgress(event.data.progress, event.data.label)
          }
          break

        case 'result':
          if (event.data.text !== undefined) {
            request.resolve(event.data.text)
            this.pendingRequests.delete(fileId)
          }
          break

        case 'error':
          if (event.data.error) {
            request.reject(new Error(event.data.error))
            this.pendingRequests.delete(fileId)
          }
          break
      }
    }

    this.worker.onerror = (error) => {
      logger.error('Worker error:', error)
      // Reject all pending requests
      for (const [fileId, request] of this.pendingRequests.entries()) {
        request.reject(new Error('Worker crashed'))
        this.pendingRequests.delete(fileId)
      }
    }
  }

  public async processFile(
    file: SourceFile,
    onProgress?: (progress: number, label: string) => void
  ): Promise<string> {
    if (!file.blob) {
      throw new Error('File blob is required for processing')
    }

    this.initWorker()

    return new Promise<string>((resolve, reject) => {
      this.pendingRequests.set(file.id, { resolve, reject, onProgress })

      const message: WorkerMessage = {
        type: 'process',
        fileId: file.id,
        blob: file.blob!,
        format: file.format,
        category: file.category,
      }

      this.worker!.postMessage(message)
    })
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingRequests.clear()
  }
}

export const fileProcessingService = new FileProcessingService()

/**
 * Process a file with progress tracking (direct, non-worker version)
 * @param file - File to process
 * @param format - File format
 * @param onProgress - Progress callback
 * @returns Extracted text content
 */
export async function processFileWithProgress(
  file: File,
  format: FileFormat,
  onProgress: ProgressCallback
): Promise<string> {
  try {
    // Phase 1: Reading file (0-20%)
    onProgress(0, 'Reading file...')
    const blob = await readFileWithProgress(file, (readProgress) => {
      onProgress(readProgress * 0.2, 'Reading file...')
    })

    // Phase 2: Parsing content (20-80%)
    onProgress(20, 'Parsing content...')
    const text = await processTextFile(blob, format)

    // Phase 3: Finalizing (80-100%)
    onProgress(80, 'Finalizing...')
    await new Promise(resolve => setTimeout(resolve, 100)) // Brief pause for UI feedback
    onProgress(100, 'Complete')

    logger.info('File processed successfully', {
      context: 'file-processing',
      data: { fileName: file.name, format, textLength: text.length }
    })

    return text
  } catch (error) {
    logger.error('File processing failed', {
      context: 'file-processing',
      data: { fileName: file.name, format, error: String(error) }
    })
    throw error
  }
}

/**
 * Read a file as Blob with progress tracking
 */
async function readFileWithProgress(
  file: File,
  onProgress: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = event.loaded / event.total
        onProgress(progress)
      }
    }

    reader.onload = () => {
      onProgress(1)
      resolve(new Blob([reader.result as ArrayBuffer]))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}
