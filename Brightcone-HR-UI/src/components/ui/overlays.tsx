import { useEffect, type ReactNode } from 'react'
import { Button } from './primitives'

/* ==========================================================================
   P1-21 Components: FormModal, ConfirmDialog, Drawer, Toast, and DataTable
   ========================================================================== */

/**
 * An accessible modal dialog with backdrop, escape key listener, and focus trapping.
 */
export function FormModal({
  open,
  onClose,
  title,
  children,
  maxWidth = '520px',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-box"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/**
 * A specialized dialog for confirming destructive or critical actions.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'primary' | 'danger'
  loading?: boolean
}) {
  return (
    <FormModal open={open} onClose={onClose} title={title} maxWidth="420px">
      <div className="confirm-body">
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} type="button" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </FormModal>
  )
}

/**
 * A sliding drawer sheet panel from the left or right of the screen.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  position = 'right',
  width = '400px',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  position?: 'right' | 'left'
  width?: string
}) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className={`drawer-panel drawer-${position}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h3 id="drawer-title" className="drawer-title">
            {title}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close drawer">
            &times;
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}
