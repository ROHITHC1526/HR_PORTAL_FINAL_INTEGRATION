import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext, type ToastInput, type ToastItem, type ToastType } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (input: ToastInput | string) => {
      const id = Math.random().toString(36).slice(2, 9)
      const item: ToastItem =
        typeof input === 'string'
          ? { id, title: '', message: input, type: 'info', duration: 4000 }
          : {
              id,
              title: input.title ?? '',
              message: input.message ?? '',
              type: input.type ?? 'info',
              duration: input.duration ?? 4000,
            }
      setToasts((prev) => [...prev, item])
      if (item.duration > 0) {
        window.setTimeout(() => removeToast(id), item.duration)
      }
      return id
    },
    [removeToast],
  )

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      return addToast({ message, type })
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, showToast, removeToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => {
          const variantClass =
            t.type === 'success' || t.type === 'ok'
              ? 'toast-ok'
              : t.type === 'error' || t.type === 'bad'
                ? 'toast-bad'
                : t.type === 'warning' || t.type === 'warn'
                  ? 'toast-warn'
                  : 'toast-info'
          return (
            <div key={t.id} className={`toast ${variantClass} toast-${t.type}`}>
              {t.title && <strong className="toast-title">{t.title}</strong>}
              {t.message && <span className="toast-msg">{t.message}</span>}
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss toast"
              >
                &times;
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
