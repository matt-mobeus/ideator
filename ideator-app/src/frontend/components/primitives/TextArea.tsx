import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', id, ...props }: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm text-[var(--text-secondary)]">{label}</label>}
      <textarea
        id={inputId}
        className={`bg-transparent border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-nav)] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition-all duration-150 resize-y min-h-[80px] ${error ? 'border-[var(--accent-danger)]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--accent-danger)]">{error}</span>}
    </div>
  );
}
