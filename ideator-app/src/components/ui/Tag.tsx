import { clsx } from 'clsx'

interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  className?: string
}

export default function Tag({ children, onRemove, className }: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-0.5 text-xs',
        className,
      )}
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:text-[var(--color-red)] transition-colors"
          aria-label="Remove"
        >
          &times;
        </button>
      )}
    </span>
  )
}
