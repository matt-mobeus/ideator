import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
    return (
      <label
        htmlFor={inputId}
        className={clsx('inline-flex items-center gap-2 cursor-pointer text-sm', className)}
        style={{ color: 'var(--text-primary)' }}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--bg-surface)] accent-[var(--color-cyan)]"
          {...props}
        />
        {label}
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
export default Checkbox
