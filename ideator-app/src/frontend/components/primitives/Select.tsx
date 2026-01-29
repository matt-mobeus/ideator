import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm text-[var(--text-secondary)]">{label}</label>}
      <select
        id={inputId}
        className={`bg-[var(--bg-primary)] border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-nav)] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition-all duration-150 appearance-none cursor-pointer ${error ? 'border-[var(--accent-danger)]' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--accent-danger)]">{error}</span>}
    </div>
  );
}
