import { Button } from '../primitives/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full border border-[var(--bg-tertiary)] flex items-center justify-center mb-4">
        <span className="text-2xl text-[var(--text-tertiary)]">∅</span>
      </div>
      <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-1">{title}</h3>
      {description && <p className="text-sm text-[var(--text-tertiary)] mb-4 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
