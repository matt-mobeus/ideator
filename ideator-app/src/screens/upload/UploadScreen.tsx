import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button.tsx'
import Icon from '@/components/ui/Icon.tsx'
import { PageHeader } from '@/components/global'
import DropZone from './DropZone.tsx'
import UploadQueue from './UploadQueue.tsx'
import IngestionProgress from './IngestionProgress.tsx'
import { processFileWithProgress } from '@/services/file-processing.service'
import type { FileFormat } from '@/types/file'
import { logger } from '@/utils/logger'
import { buildTaskGraph } from '@/services/pipeline/graph-builder.ts'
import { PipelineOrchestrator } from '@/services/pipeline/orchestrator.ts'
import { pipelineStore } from '@/services/pipeline/store.ts'
import { db } from '@/db/database.ts'
import { decryptValue, isEncrypted } from '@/utils/crypto.ts'

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
  const navigate = useNavigate()
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

    // Track per-file results
    const results: (string | null)[] = new Array(queuedFiles.length).fill(null)

    // Process each file with real progress tracking
    const processingPromises = queuedFiles.map(async (queuedFile, index) => {
      const job = newJobs[index]
      const format = queuedFile.format as FileFormat

      try {
        const text = await processFileWithProgress(
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
        results[index] = text

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

    // Collect successful file inputs for the pipeline
    const fileInputs = queuedFiles
      .filter((_, i) => results[i] !== null)
      .map((qf) => ({
        blob: qf.file as Blob,
        name: qf.name,
        format: qf.format as FileFormat,
      }))

    if (fileInputs.length === 0) {
      setIsProcessing(false)
      setQueuedFiles([])
      setJobs([])
      return
    }

    try {
      const allSettings = await db.settings.toArray()
      const settings = allSettings[0]
      if (!settings?.llm?.apiKey) {
        logger.error('No LLM API key configured', { context: 'upload-screen' })
        setIsProcessing(false)
        return
      }

      // Decrypt the API key before passing to pipeline
      let plainKey: string
      if (typeof settings.llm.apiKey === 'string') {
        plainKey = settings.llm.apiKey
      } else if (isEncrypted(settings.llm.apiKey)) {
        plainKey = await decryptValue(settings.llm.apiKey)
      } else {
        logger.error('Invalid API key format', { context: 'upload-screen' })
        setIsProcessing(false)
        return
      }

      if (!plainKey) {
        logger.error('API key is empty after decryption', { context: 'upload-screen' })
        setIsProcessing(false)
        return
      }

      const plan = buildTaskGraph(fileInputs, {
        domain: undefined,
        generateDocument: true,
        generateVisual: true,
        trackProvenance: true,
        generateTimeline: true,
        generateNodeMap: true,
      })

      const llmConfig = { ...settings.llm, apiKey: plainKey }
      const orchestrator = new PipelineOrchestrator(plan, llmConfig, pipelineStore)
      sessionStorage.setItem('active-pipeline-id', plan.id)

      orchestrator.run().catch((err) => {
        logger.error('Pipeline execution failed', {
          context: 'upload-screen',
          data: { planId: plan.id, error: String(err) },
        })
      })

      navigate('/concepts')
    } catch (err) {
      logger.error('Failed to start pipeline', {
        context: 'upload-screen',
        data: { error: String(err) },
      })
    } finally {
      setIsProcessing(false)
      setQueuedFiles([])
      setJobs([])
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <PageHeader title="Upload & Ingest" />

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
