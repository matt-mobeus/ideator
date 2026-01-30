import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
        <textarea
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-[var(--radius-md)] border bg-[var(--bg-surface)] px-3 py-2 text-sm outline-none transition-all duration-[var(--transition-default)] resize-y min-h-[80px]',
            'placeholder:text-[var(--text-muted)]',
            'focus:border-[var(--border-active)] focus:shadow-[var(--glow-cyan)]',
            error ? 'border-[var(--color-red)]' : 'border-[var(--border-default)]',
            className,
          )}
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
          {...props}
        />
        {error && (
          <span className="text-xs" style={{ color: 'var(--color-red)' }}>{error}</span>
        )}
      </div>
    )
  },
)

TextArea.displayName = 'TextArea'
export default TextArea
