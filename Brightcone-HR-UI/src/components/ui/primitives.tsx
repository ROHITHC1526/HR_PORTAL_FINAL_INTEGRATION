import {
  forwardRef,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { initials } from '@/domain/people'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger' | 'ghost' | 'link'
  block?: boolean
  loading?: boolean
}

export function Button({
  variant,
  block,
  loading,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const cls = ['btn', variant, block ? 'block' : '', className].filter(Boolean).join(' ')
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? 'Please wait…' : children}
    </button>
  )
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

function Messages({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  return (
    <>
      {hint && !error && (
        <span id={`${id}-hint`} className="hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className="error" role="alert">
          {error}
        </span>
      )}
    </>
  )
}

const describedBy = (id: string, error?: string, hint?: string) =>
  [error ? `${id}-err` : '', hint && !error ? `${id}-hint` : ''].filter(Boolean).join(' ') ||
  undefined

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, id, ...rest },
  ref,
) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <input
          ref={ref}
          id={inputId}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/** A password input with a Show/Hide button. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, 'type'>>(
  function PasswordField({ label, error, hint, id, ...rest }, ref) {
    const auto = useId()
    const inputId = id ?? auto
    const [shown, setShown] = useState(false)
    return (
      <div className="field">
        <label htmlFor={inputId}>{label}</label>
        <div className="input-wrap">
          <input
            ref={ref}
            id={inputId}
            className="input"
            type={shown ? 'text' : 'password'}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, error, hint)}
            {...rest}
          />
          <button
            type="button"
            className="btn link toggle"
            onClick={() => setShown((s) => !s)}
            aria-pressed={shown}
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        </div>
        <Messages id={inputId} error={error} hint={hint} />
      </div>
    )
  },
)

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'ok' | 'info'
  children: ReactNode
}) {
  return (
    <div className={`alert ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="center-screen" role="status">
      <div className="spinner" />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}

export function Pill({
  tone,
  children,
}: {
  tone?: 'ok' | 'warn' | 'bad' | 'info'
  children: ReactNode
}) {
  return <span className={`pill ${tone ?? ''}`}>{children}</span>
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initials(name)}
    </span>
  )
}

type LabelProps = { label: string; error?: string; hint?: string }

/** A native `<select>` with the same label / error / hint treatment as `TextField`. */
export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & LabelProps
>(function SelectField({ label, error, hint, id, children, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <select
          ref={ref}
          id={inputId}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        >
          {children}
        </select>
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/** A multi-line text input with the same label / error / hint treatment as `TextField`. */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & LabelProps
>(function TextareaField({ label, error, hint, id, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="input-wrap">
        <textarea
          ref={ref}
          id={inputId}
          className="input"
          rows={rest.rows ?? 4}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, error, hint)}
          {...rest}
        />
      </div>
      <Messages id={inputId} error={error} hint={hint} />
    </div>
  )
})

/**
 * Tabs following the WAI-ARIA tabs pattern. Only the selected panel is mounted, so a panel's
 * contents never sit in the DOM where a screen reader would read them out of context.
 */
export function Tabs({
  tabs,
  initial,
  active: activeProp,
  onChange,
}: {
  tabs: { id: string; label: string; panel?: ReactNode }[]
  initial?: string
  active?: string
  onChange?: (id: string) => void
}) {
  const [internalActive, setInternalActive] = useState(initial ?? tabs[0]?.id ?? '')
  const active = activeProp !== undefined ? activeProp : internalActive
  const handleSelect = (id: string) => {
    setInternalActive(id)
    onChange?.(id)
  }
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  if (!current) return null
  return (
    <div className="tabs">
      <div role="tablist" aria-label="Sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === current.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={t.id === current.id ? 0 : -1}
            className={`tab${t.id === current.id ? ' active' : ''}`}
            onClick={() => handleSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {current.panel && (
        <div role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
          {current.panel}
        </div>
      )}
    </div>
  )
}

/**
 * A determinate progress bar. `value` is a percentage; the accessible name and the numeric
 * readout are both exposed so the bar is not just a coloured rectangle.
 */
export function ProgressBar({
  label,
  value,
}: {
  label: string
  /** Percentage complete, 0-100. */
  value: number
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="progress">
      <div className="progress-head">
        <span>{label}</span>
        <span className="progress-value">{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="progress-track"
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** A single headline number, used in rows on dashboards. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

/** Shown when a list has no rows. `action` is optional, for a "create the first one" button. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <p className="empty-title">{title}</p>
      {body && <p className="empty-body">{body}</p>}
      {action}
    </div>
  )
}

/**
 * A placeholder shown while data loads. Marked `aria-hidden` because the live region next to it
 * already announces the loading state; announcing both would talk over itself.
 */
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton-group" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  )
}
