import { clsx } from 'clsx'

type BadgeVariant = 'cyan' | 'green' | 'magenta' | 'orange' | 'blue' | 'gray' | 'red' | 'yellow'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const colorMap: Record<BadgeVariant, string> = {
  cyan: 'border-[var(--color-cyan)] text-[var(--color-cyan)] bg-[rgba(0,255,255,0.08)]',
  green: 'border-[var(--color-green)] text-[var(--color-green)] bg-[rgba(0,255,136,0.08)]',
  magenta: 'border-[var(--color-magenta)] text-[var(--color-magenta)] bg-[rgba(255,0,255,0.08)]',
  orange: 'border-[var(--color-orange)] text-[var(--color-orange)] bg-[rgba(255,102,0,0.08)]',
  blue: 'border-[var(--color-blue)] text-[var(--color-blue)] bg-[rgba(68,136,255,0.08)]',
  gray: 'border-[var(--color-gray)] text-[var(--color-gray)] bg-[rgba(136,136,153,0.08)]',
  red: 'border-[var(--color-red)] text-[var(--color-red)] bg-[rgba(255,51,68,0.08)]',
  yellow: 'border-[var(--color-yellow)] text-[var(--color-yellow)] bg-[rgba(255,204,0,0.08)]',
}

export default function Badge({ children, variant = 'cyan', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-[var(--radius-full)] border px-2 py-0.5 text-xs font-medium',
        colorMap[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
