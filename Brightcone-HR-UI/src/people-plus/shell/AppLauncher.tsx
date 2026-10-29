import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppDefinition } from '../data'
import { Icon } from '../Icon'

export function AppLauncher({ apps, close }: { apps: AppDefinition[]; close: () => void }) {
  const navigate = useNavigate()
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
      <section className="pp-launcher" role="dialog" aria-modal="true" aria-label="App launcher">
        <div className="pp-card-head">
          <div>
            <h2 className="pp-card-title">Brightcone apps</h2>
            <p className="pp-card-subtitle">Choose an app in your suite</p>
          </div>
          <button className="pp-icon-button" onClick={close} aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="pp-launcher-grid">
          {apps.map((app) => (
            <button
              key={app.key}
              type="button"
              onClick={() => {
                close()
                navigate(app.path)
              }}
            >
              <span style={{ color: app.color, background: `${app.color}16` }}>
                <Icon name={app.icon} size={20} />
              </span>
              <strong>{app.name}</strong>
              <small>{app.description}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
