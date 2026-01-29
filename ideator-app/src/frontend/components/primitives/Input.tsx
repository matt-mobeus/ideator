// ============================================================================
// IDEATOR — Input Primitive (FE-1.2)
// ============================================================================

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          bg-transparent border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)]
          px-3 py-2 text-sm text-[var(--text-primary)]
          placeholder:text-[var(--text-tertiary)]
          focus:border-[var(--accent-nav)] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)]
          transition-all duration-150
          ${error ? 'border-[var(--accent-danger)]' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-[var(--accent-danger)]">{error}</span>}
    </div>
  );
}
