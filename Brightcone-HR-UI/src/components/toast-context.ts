import { createContext, useContext } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'ok' | 'bad' | 'warn'

export interface ToastInput {
  title?: string
  message?: string
  type?: ToastType
  duration?: number
}

export interface ToastItem {
  id: string
  title: string
  message: string
  type: ToastType
  duration: number
}

export interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (input: ToastInput | string) => string
  showToast: (message: string, type?: ToastType) => string
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      toasts: [],
      addToast: () => '',
      showToast: () => '',
      removeToast: () => {},
    }
  }
  return ctx
}
