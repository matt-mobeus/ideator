import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
      <h3 className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
