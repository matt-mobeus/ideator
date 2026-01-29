// ============================================================================
// IDEATOR — Badge Primitive (FE-1.2)
// ============================================================================

type BadgeVariant = 'cyan' | 'green' | 'magenta' | 'orange' | 'blue' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  cyan: 'border-[var(--accent-nav)] text-[var(--accent-nav)]',
  green: 'border-[var(--accent-success)] text-[var(--accent-success)]',
  magenta: 'border-[var(--accent-creative)] text-[var(--accent-creative)]',
  orange: 'border-[var(--accent-warning)] text-[var(--accent-warning)]',
  blue: 'border-[var(--accent-info)] text-[var(--accent-info)]',
  neutral: 'border-[var(--accent-neutral)] text-[var(--accent-neutral)]',
};

export function Badge({ variant = 'cyan', children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium border rounded-[var(--radius-sm)]
        ${BADGE_CLASSES[variant]}
      `}
    >
      {children}
    </span>
  );
}
