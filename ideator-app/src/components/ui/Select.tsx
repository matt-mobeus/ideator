import { type SelectHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'rounded-[var(--radius-md)] border bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none transition-all duration-[var(--transition-default)] appearance-none cursor-pointer',
            'focus:border-[var(--border-active)] focus:shadow-[var(--glow-cyan)]',
            error ? 'border-[var(--color-red)]' : 'border-[var(--border-default)]',
            className,
          )}
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs" style={{ color: 'var(--color-red)' }}>{error}</span>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
export default Select
