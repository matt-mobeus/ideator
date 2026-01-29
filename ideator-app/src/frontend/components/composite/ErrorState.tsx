import { Button } from '../primitives/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full border border-[var(--accent-danger)] flex items-center justify-center mb-4">
        <span className="text-2xl text-[var(--accent-danger)]">!</span>
      </div>
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-md">{message}</p>
      {onRetry && <Button variant="danger" onClick={onRetry}>Retry</Button>}
    </div>
  );
}
