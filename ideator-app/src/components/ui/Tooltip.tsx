import { useState, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const positionStyles: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

export default function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            'absolute z-[var(--z-tooltip)] whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1 text-xs pointer-events-none animate-fade-in',
            positionStyles[position],
          )}
          style={{ color: 'var(--text-primary)' }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}
