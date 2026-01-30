import { useEffect } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastData {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-[var(--color-green)] shadow-[var(--glow-green)]',
  info: 'border-[var(--color-cyan)] shadow-[var(--glow-cyan)]',
  warning: 'border-[var(--color-orange)] shadow-[var(--glow-orange)]',
  error: 'border-[var(--color-red)] shadow-[var(--glow-red)]',
}

const durations: Record<ToastType, number> = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 0,
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const ms = durations[toast.type]
    if (ms === 0) return
    const timer = setTimeout(() => onDismiss(toast.id), ms)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-[var(--radius-md)] border bg-[var(--bg-elevated)] px-4 py-3 text-sm animate-slide-right',
        typeStyles[toast.type],
      )}
      style={{ color: 'var(--text-primary)' }}
      role="alert"
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 transition-colors hover:text-[var(--color-red)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Dismiss"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}
