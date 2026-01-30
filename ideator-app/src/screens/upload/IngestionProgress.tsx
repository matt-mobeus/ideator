import { clsx } from 'clsx'
import ProgressBar from '@/components/composites/ProgressBar.tsx'

type JobStatus = 'running' | 'completed' | 'failed'

interface IngestionJob {
  id: string
  fileName: string
  status: JobStatus
  progress: number
  progressLabel?: string
}

interface IngestionProgressProps {
  jobs: IngestionJob[]
}

const statusColors: Record<JobStatus, 'cyan' | 'green' | 'orange'> = {
  running: 'cyan',
  completed: 'green',
  failed: 'orange',
}

const statusLabels: Record<JobStatus, string> = {
  running: 'Processing...',
  completed: 'Completed',
  failed: 'Failed',
}

const statusTextColors: Record<JobStatus, string> = {
  running: 'var(--color-cyan)',
  completed: 'var(--color-green)',
  failed: 'var(--color-red)',
}

export default function IngestionProgress({ jobs }: IngestionProgressProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      {/* Header */}
      <h3 className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
        INGESTION PROGRESS ({jobs.length})
      </h3>

      {/* Job list */}
      <div className="flex flex-col gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={clsx(
              'flex flex-col gap-2 rounded-[var(--radius-md)] border bg-[var(--bg-base)] p-3',
              job.status === 'running' && 'border-[var(--color-cyan)] shadow-[var(--glow-cyan-sm)]',
              job.status === 'completed' && 'border-[var(--color-green)]',
              job.status === 'failed' && 'border-[var(--color-red)]',
            )}
          >
            {/* File name and status */}
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {job.fileName}
              </p>
              <span
                className="text-xs font-medium uppercase tracking-wide shrink-0"
                style={{ color: statusTextColors[job.status] }}
              >
                {statusLabels[job.status]}
              </span>
            </div>

            {/* Progress bar */}
            <ProgressBar
              value={job.progress}
              max={100}
              label={job.progressLabel}
              variant={statusColors[job.status]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
