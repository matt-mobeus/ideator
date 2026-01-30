import { clsx } from 'clsx'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={clsx('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: 'var(--text-muted)' }}>/</span>}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="transition-colors hover:text-[var(--color-cyan)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
