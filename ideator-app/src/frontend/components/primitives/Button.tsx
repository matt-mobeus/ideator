// ============================================================================
// IDEATOR — Button Primitive (FE-1.2)
// ============================================================================

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'creative';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-transparent border-[var(--accent-nav)] text-[var(--accent-nav)] hover:shadow-[0_0_12px_rgba(0,255,255,0.6)]',
  secondary: 'bg-transparent border-[var(--accent-neutral)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]',
  danger: 'bg-transparent border-[var(--accent-warning)] text-[var(--accent-warning)] hover:shadow-[0_0_12px_rgba(255,102,0,0.6)]',
  creative: 'bg-transparent border-[var(--accent-creative)] text-[var(--accent-creative)] hover:shadow-[0_0_12px_rgba(255,0,255,0.6)]',
};

export function Button({ variant = 'primary', loading, children, disabled, className = '', ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 text-sm font-medium
        border rounded-[var(--radius-sm)]
        transition-all duration-150 ease-out
        active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...props}
    >
      {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
      {children}
    </button>
  );
}
