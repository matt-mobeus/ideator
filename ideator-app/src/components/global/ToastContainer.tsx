import Toast, { type ToastData } from '@/components/composites/Toast.tsx'

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

/**
 * Fixed position toast stack (top-right corner).
 * Renders a list of Toast components with proper z-index.
 */
export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed right-6 top-20 flex flex-col gap-2"
      style={{ zIndex: 'var(--z-toast)' }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
