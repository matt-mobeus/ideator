import { type InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export function SearchInput({ value, onClear, className = '', ...props }: SearchInputProps) {
  const hasValue = value !== undefined && value !== '';
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] text-xs pointer-events-none">⌕</span>
      <input
        type="text"
        value={value}
        className="w-full bg-transparent border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] pl-8 pr-8 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-nav)] focus:shadow-[0_0_8px_rgba(0,255,255,0.3)] transition-all duration-150"
        {...props}
      />
      {hasValue && onClear && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-sm"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
