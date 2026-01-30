import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-[var(--radius-md)] border bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none transition-all duration-[var(--transition-default)]',
            'placeholder:text-[var(--text-muted)]',
            'focus:border-[var(--border-active)] focus:shadow-[var(--glow-cyan)]',
            error
              ? 'border-[var(--color-red)]'
              : 'border-[var(--border-default)]',
            className,
          )}
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          {...props}
        />
        {error && (
          <span className="text-xs" style={{ color: 'var(--color-red)' }}>
            {error}
          </span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
