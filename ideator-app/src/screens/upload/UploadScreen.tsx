import { useState } from 'react'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import DropZone from './DropZone.tsx'
import UploadQueue from './UploadQueue.tsx'
import IngestionProgress from './IngestionProgress.tsx'

interface QueuedFile {
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

  const handleBeginIngestion = () => {
    setIsProcessing(true)

    // Create mock jobs from queued files
    const newJobs: IngestionJob[] = queuedFiles.map((file, index) => ({
      id: `job-${Date.now()}-${index}`,
      fileName: file.name,
      status: 'running',
      progress: 0,
      progressLabel: 'Initializing...',
    }))

    setJobs(newJobs)

    // Simulate progress for each job
    newJobs.forEach((job, _jobIndex) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5 // Random increment between 5-20

        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? { ...j, status: 'completed', progress: 100, progressLabel: 'Complete' }
                : j
            )
          )

          // Check if all jobs are complete
          setJobs((currentJobs) => {
            const allComplete = currentJobs.every((j) => j.status === 'completed' || j.status === 'failed')
            if (allComplete) {
              setTimeout(() => {
                setIsProcessing(false)
                setQueuedFiles([])
                setJobs([])
              }, 2000)
            }
            return currentJobs
          })
        } else {
          const stage = progress < 30 ? 'Parsing...' : progress < 60 ? 'Extracting...' : 'Analyzing...'
          setJobs((prev) =>
            prev.map((j) =>
              j.id === job.id
                ? { ...j, progress, progressLabel: stage }
                : j
            )
          )
        }
      }, 500)
    })
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
