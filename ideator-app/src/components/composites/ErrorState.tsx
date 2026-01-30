import { clsx } from 'clsx'
import Button from '@/components/ui/Button.tsx'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <h3 className="text-base font-medium" style={{ color: 'var(--color-red)' }}>
        {title}
      </h3>
      <p className="max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  )
}
