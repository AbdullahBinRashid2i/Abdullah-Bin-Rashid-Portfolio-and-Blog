import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-5 z-50 flex flex-col gap-2 w-[calc(100vw-2.5rem)] max-w-sm"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="flex items-start gap-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] shadow-xl"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          )}
          <p className="flex-1 text-xs leading-relaxed text-[var(--text)]">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
