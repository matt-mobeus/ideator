import type { SourceFile } from '@/types/file.ts'

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
      console.error('Worker error:', error)
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
