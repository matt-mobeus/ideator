import { useState } from 'react'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import DropZone from './DropZone.tsx'
import UploadQueue from './UploadQueue.tsx'
import IngestionProgress from './IngestionProgress.tsx'
import { processFileWithProgress } from '@/services/file-processing.service'
import type { FileFormat } from '@/types/file'
import { logger } from '@/utils/logger'

interface QueuedFile {
  file: File
  name: string
  size: number
  format: string
}

interface IngestionJob {
  id: string
  fileName: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  progressLabel?: string
}

export default function UploadScreen() {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobs, setJobs] = useState<IngestionJob[]>([])

  const handleFilesAdded = (files: File[]) => {
    const newFiles: QueuedFile[] = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown',
    }))
    setQueuedFiles((prev) => [...prev, ...newFiles])
  }

  const handleRemoveFile = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearQueue = () => {
    setQueuedFiles([])
  }

  const handleBeginIngestion = async () => {
    setIsProcessing(true)

    // Create jobs from queued files
    const newJobs: IngestionJob[] = queuedFiles.map((file, index) => ({
      id: `job-${Date.now()}-${index}`,
      fileName: file.name,
      status: 'running' as const,
      progress: 0,
      progressLabel: 'Initializing...',
    }))

    setJobs(newJobs)

    // Process each file with real progress tracking
    const processingPromises = queuedFiles.map(async (queuedFile, index) => {
      const job = newJobs[index]
      const format = queuedFile.format as FileFormat

      try {
        await processFileWithProgress(
          queuedFile.file,
          format,
          (progress, label) => {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === job.id
                  ? { ...j, progress, progressLabel: label }
                  : j
              )
            )
          }
        )

        // Mark as completed
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: 'completed' as const, progress: 100, progressLabel: 'Complete' }
              : j
          )
        )
      } catch (error) {
        logger.error('File processing failed', {
          context: 'upload-screen',
          data: { fileName: queuedFile.name, error: String(error) }
        })

        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: 'failed' as const, progressLabel: 'Failed' }
              : j
          )
        )
      }
    })

    // Wait for all files to complete
    await Promise.all(processingPromises)

    // Clean up after a brief delay
    setTimeout(() => {
      setIsProcessing(false)
      setQueuedFiles([])
      setJobs([])
    }, 2000)
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          UPLOAD & INGEST
        </h1>
      </div>

      {/* Drop Zone */}
      <DropZone onFilesAdded={handleFilesAdded} />

      {/* Upload Queue or Ingestion Progress */}
      {isProcessing ? (
        <IngestionProgress jobs={jobs} />
      ) : (
        queuedFiles.length > 0 && (
          <UploadQueue
            files={queuedFiles}
            onRemove={handleRemoveFile}
            onClear={handleClearQueue}
          />
        )
      )}

      {/* Begin Ingestion Button */}
      {!isProcessing && queuedFiles.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleBeginIngestion}
            disabled={queuedFiles.length === 0 || isProcessing}
          >
            <Icon name="zap" size={20} />
            BEGIN INGESTION
          </Button>
        </div>
      )}
    </div>
  )
}
