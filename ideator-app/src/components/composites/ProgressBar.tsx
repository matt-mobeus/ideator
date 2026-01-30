import { clsx } from 'clsx'

type ProgressVariant = 'cyan' | 'green' | 'magenta' | 'orange'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  variant?: ProgressVariant
  className?: string
}

const variantColors: Record<ProgressVariant, string> = {
  cyan: 'var(--color-cyan)',
  green: 'var(--color-green)',
  magenta: 'var(--color-magenta)',
  orange: 'var(--color-orange)',
}

export default function ProgressBar({ value, max = 100, label, variant = 'cyan', className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={clsx('flex flex-col gap-1', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>{label}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: variantColors[variant] }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
