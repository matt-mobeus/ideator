import { useEffect, type ReactNode } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={clsx(
          'relative z-10 w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 animate-fade-in',
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-cyan)' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors hover:text-[var(--color-red)]"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
