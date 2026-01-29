interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full border transition-all duration-200 ${
          checked
            ? 'border-[var(--accent-nav)] bg-[var(--accent-nav)]/20 shadow-[0_0_8px_rgba(0,255,255,0.3)]'
            : 'border-[var(--bg-tertiary)] bg-[var(--bg-tertiary)]'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all duration-200 ${
            checked ? 'translate-x-5 bg-[var(--accent-nav)]' : 'bg-[var(--accent-neutral)]'
          }`}
        />
      </button>
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
    </label>
  );
}
