// ============================================================================
// IDEATOR — Progress Bar Composite (FE-1.3)
// ============================================================================

interface ProgressBarProps {
  /** 0-100 */
  value: number;
  /** Label to display above the bar */
  label?: string;
  /** Phase label to display below */
  phase?: string;
  /** Color variant */
  color?: 'cyan' | 'green' | 'magenta' | 'orange';
}

const COLOR_MAP = {
  cyan: 'bg-[var(--accent-nav)]',
  green: 'bg-[var(--accent-success)]',
  magenta: 'bg-[var(--accent-creative)]',
  orange: 'bg-[var(--accent-warning)]',
};

export function ProgressBar({ value, label, phase, color = 'cyan' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
          <span className="text-sm text-[var(--text-tertiary)]">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <div
          className={`h-full ${COLOR_MAP[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {phase && (
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{phase}</p>
      )}
    </div>
  );
}
