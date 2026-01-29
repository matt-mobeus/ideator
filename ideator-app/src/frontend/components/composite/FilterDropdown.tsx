import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '../primitives/Checkbox';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function FilterDropdown({ label, options, selected, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleOption = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[var(--bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:border-[var(--accent-nav)] transition-colors"
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-[var(--accent-nav)]/20 text-[var(--accent-nav)] text-xs px-1.5 rounded-full">
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-[var(--z-dropdown)] bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] rounded-[var(--radius-md)] p-2 min-w-[180px] max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div key={opt.value} className="py-1">
              <Checkbox
                label={opt.label}
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
            </div>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="mt-1 text-xs text-[var(--accent-nav)] hover:underline w-full text-left px-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
