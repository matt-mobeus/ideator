import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import Icon from '@/components/ui/Icon.tsx'

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
}

export default function FilterDropdown({ label, options, selected, onChange, className }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm transition-colors hover:border-[var(--text-muted)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Icon name="filter" size={16} />
        {label}
        {selected.length > 0 && (
          <span className="ml-1 rounded-full bg-[var(--color-cyan)] px-1.5 text-xs text-black font-medium">
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[var(--z-dropdown)] mt-1 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-1 animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-left transition-colors',
                selected.includes(opt.value) ? 'text-[var(--color-cyan)]' : 'text-[var(--text-secondary)]',
                'hover:bg-[var(--bg-surface)]',
              )}
            >
              <span className="w-4 text-center">{selected.includes(opt.value) ? '✓' : ''}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
