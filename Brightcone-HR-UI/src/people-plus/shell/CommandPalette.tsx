import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APPS, NAV_BY_ROLE } from '../data'
import { useAuth } from '@/auth/AuthContext'
import { Icon } from '../Icon'

export function CommandPalette({ close }: { close: () => void }) {
  const [query, setQuery] = useState('')
  const { user, can } = useAuth()
  const navigate = useNavigate()
  const entries = useMemo(() => {
    const role = user?.role === 'hr_admin' ? 'admin' : 'employee'
    return [
      ...APPS.map((app) => ({
        label: app.name,
        path: app.path,
        icon: app.icon,
        hint: app.description,
      })),
      ...Object.values(NAV_BY_ROLE[role])
        .flat()
        .filter((item) => !item.permission || can(item.permission))
        .map((item) => ({
          label: item.label,
          path: item.to,
          icon: item.icon,
          hint: item.comingSoon ? 'Coming soon' : 'Page',
        })),
    ]
  }, [user?.role, can])
  const filtered = entries
    .filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 9)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])
  return (
    <div
      className="pp-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section className="pp-command" role="dialog" aria-modal="true" aria-label="Search pages">
        <div className="pp-command-input">
          <Icon name="search" />
          <input
            autoFocus
            placeholder="Search people, pages or actions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="pp-command-results">
          {filtered.length ? (
            filtered.map((item, index) => (
              <button
                key={`${item.path}-${index}`}
                type="button"
                onClick={() => {
                  close()
                  navigate(item.path)
                }}
              >
                <Icon name={item.icon} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
                <Icon name="arrow" size={15} />
              </button>
            ))
          ) : (
            <p>No matching pages</p>
          )}
        </div>
        <footer>Use ↑ ↓ to navigate · Enter to open · Esc to close</footer>
      </section>
    </div>
  )
}
