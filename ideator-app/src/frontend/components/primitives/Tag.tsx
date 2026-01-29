interface TagProps {
  label: string;
  onRemove?: () => void;
  color?: 'cyan' | 'green' | 'magenta' | 'orange' | 'blue' | 'neutral';
}

const TAG_COLORS: Record<string, string> = {
  cyan: 'border-[var(--accent-nav)] text-[var(--accent-nav)]',
  green: 'border-[var(--accent-success)] text-[var(--accent-success)]',
  magenta: 'border-[var(--accent-creative)] text-[var(--accent-creative)]',
  orange: 'border-[var(--accent-warning)] text-[var(--accent-warning)]',
  blue: 'border-[var(--accent-info)] text-[var(--accent-info)]',
  neutral: 'border-[var(--accent-neutral)] text-[var(--accent-neutral)]',
};

export function Tag({ label, onRemove, color = 'cyan' }: TagProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border rounded-[var(--radius-sm)] ${TAG_COLORS[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 transition-opacity leading-none ml-0.5" aria-label={`Remove ${label}`}>
          ×
        </button>
      )}
    </span>
  );
}
