// ============================================================================
// IDEATOR — Card Composite (FE-1.3)
// ============================================================================

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'cyan' | 'green' | 'magenta' | 'orange' | 'blue' | 'none';
  children: ReactNode;
}

const GLOW_CLASSES = {
  cyan: 'hover:shadow-[0_0_12px_rgba(0,255,255,0.3)]',
  green: 'hover:shadow-[0_0_12px_rgba(0,255,136,0.3)]',
  magenta: 'hover:shadow-[0_0_12px_rgba(255,0,255,0.3)]',
  orange: 'hover:shadow-[0_0_12px_rgba(255,102,0,0.3)]',
  blue: 'hover:shadow-[0_0_12px_rgba(68,136,255,0.3)]',
  none: '',
};

export function Card({ glow = 'none', children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--bg-surface)] border border-[var(--bg-tertiary)]
        rounded-[var(--radius-md)] p-4
        transition-shadow duration-150
        ${GLOW_CLASSES[glow]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
