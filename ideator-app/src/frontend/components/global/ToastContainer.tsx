import { useToast } from '../../contexts/ToastContext';

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm">
      {toasts.slice(0, 3).map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-[var(--radius-md)] border text-sm flex items-start gap-3 animate-slide-in ${
            toast.type === 'success' ? 'border-[var(--accent-success)] bg-[var(--bg-surface)]' :
            toast.type === 'error' ? 'border-[var(--accent-danger)] bg-[var(--bg-surface)]' :
            toast.type === 'warning' ? 'border-[var(--accent-warning)] bg-[var(--bg-surface)]' :
            'border-[var(--accent-info)] bg-[var(--bg-surface)]'
          }`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
