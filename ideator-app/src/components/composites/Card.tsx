import { clsx } from 'clsx'
import type { ReactNode, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glow?: boolean
  glowColor?: string
}

export default function Card({ children, glow, glowColor, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4',
        glow && 'shadow-[0_0_10px_var(--border-glow)]',
        className,
      )}
      style={glow && glowColor ? { boxShadow: `0 0 10px ${glowColor}` } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
