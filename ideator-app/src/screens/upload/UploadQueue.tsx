import { clsx } from 'clsx'
import Button from '@/components/ui/Button.tsx'
import Badge from '@/components/ui/Badge.tsx'
import Icon from '@/components/ui/Icon.tsx'
import EmptyState from '@/components/composites/EmptyState.tsx'

interface QueuedFile {
  name: string
  size: number
  format: string
}

interface UploadQueueProps {
  files: QueuedFile[]
  onRemove: (index: number) => void
  onClear: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function UploadQueue({ files, onRemove, onClear }: UploadQueueProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        title="No files queued"
        description="Add files using the drop zone above"
      />
    )
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>
          UPLOAD QUEUE ({files.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className={clsx(
              'flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-base)] p-3 transition-all duration-[var(--transition-default)]',
              'hover:border-[var(--color-cyan)] hover:shadow-[var(--glow-cyan-sm)]',
            )}
          >
            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {file.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Format badge */}
            <Badge variant="cyan" className="shrink-0">
              {file.format.toUpperCase()}
            </Badge>

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              className="shrink-0"
              aria-label={`Remove ${file.name}`}
            >
              <Icon name="x" size={16} />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t border-[var(--border-default)] pt-3 text-xs"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>Total: {files.length} file{files.length !== 1 ? 's' : ''}</span>
        <span>{formatFileSize(totalSize)}</span>
      </div>
    </div>
  )
}
