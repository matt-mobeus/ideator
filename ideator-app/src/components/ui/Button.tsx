import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'border-[var(--color-cyan)] text-[var(--color-cyan)] hover:shadow-[var(--glow-cyan)] bg-[var(--bg-surface)]',
  secondary: 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] bg-transparent',
  ghost: 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] bg-transparent',
  danger: 'border-[var(--color-red)] text-[var(--color-red)] hover:shadow-[var(--glow-red)] bg-[var(--bg-surface)]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border font-medium transition-all duration-[var(--transition-default)]',
        'active:scale-[0.98] disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}
