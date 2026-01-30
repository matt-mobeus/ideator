import { clsx } from 'clsx'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export default function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <label
      className={clsx('inline-flex items-center gap-2 cursor-pointer text-sm', disabled && 'opacity-[var(--opacity-disabled)] pointer-events-none', className)}
      style={{ color: 'var(--text-primary)' }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={clsx(
          'relative inline-flex h-5 w-9 items-center rounded-full border transition-colors duration-[var(--transition-default)]',
          checked
            ? 'bg-[var(--color-cyan)] border-[var(--color-cyan)]'
            : 'bg-[var(--bg-surface)] border-[var(--border-default)]',
        )}
      >
        <span
          className={clsx(
            'inline-block h-3.5 w-3.5 rounded-full bg-[var(--text-primary)] transition-transform duration-[var(--transition-default)]',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          )}
        />
      </button>
      {label}
    </label>
  )
}
