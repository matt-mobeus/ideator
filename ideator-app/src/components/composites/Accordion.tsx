import { useState, type ReactNode } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

interface AccordionProps {
  title: ReactNode
  badge?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
  className?: string
}

export default function Accordion({ title, badge, defaultOpen = false, children, className }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={clsx('border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 bg-[var(--bg-surface)] px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-[var(--bg-elevated)]"
        style={{ color: 'var(--text-primary)' }}
      >
        <div className="flex items-center gap-2">
          {title}
          {badge}
        </div>
        <span className={clsx('transition-transform duration-[var(--transition-default)]', open && 'rotate-180')}>
          <Icon name="chevron-down" size={16} />
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
