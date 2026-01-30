import { type InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
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
          type="radio"
          id={inputId}
          className="h-4 w-4 border-[var(--border-default)] bg-[var(--bg-surface)] accent-[var(--color-cyan)]"
          {...props}
        />
        {label}
      </label>
    )
  },
)

Radio.displayName = 'Radio'
export default Radio
