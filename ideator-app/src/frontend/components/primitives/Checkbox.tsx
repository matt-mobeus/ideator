interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!disabled) onChange(!checked); } }}
        onClick={() => { if (!disabled) onChange(!checked); }}
        className={`w-4 h-4 border rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-150 ${
          checked
            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav)]/10 shadow-[0_0_6px_rgba(0,255,255,0.4)]'
            : 'border-[var(--bg-tertiary)]'
        }`}
      >
        {checked && <span className="text-[var(--accent-nav)] text-xs leading-none">✓</span>}
      </span>
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
    </label>
  );
}
