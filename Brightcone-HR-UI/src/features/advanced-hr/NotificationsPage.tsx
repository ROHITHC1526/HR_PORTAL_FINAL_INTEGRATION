import React from 'react'
import { useNotifications, useMarkRead } from './api'
import { AdvancedHrErrorBoundary } from './ErrorBoundary'
import { Icon } from '@/people-plus/Icon'

function NotificationsContent() {
  const notifications = useNotifications(true)
  const markRead = useMarkRead()

  if (notifications.isLoading) {
    return <div className="loader">Loading notifications…</div>
  }

  if (notifications.error) {
    return (
      <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
        <h2>Could not load notifications</h2>
        <p className="muted">The notifications API is not reachable.</p>
      </section>
    )
  }

  const page = notifications.data
  const items = page?.items ?? []
  const unread = page?.unread_count ?? 0

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Notifications</div>
          <h1>Notification Centre</h1>
          <p>{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card mt">
        <ul className="tline">
          {items.map((n) => (
            <li key={n.id}>
              <div
                className="tdot"
                style={{ '--ac': n.read_at ? 'var(--muted)' : 'var(--brand)' } as React.CSSProperties}
              >
                <Icon name="bell" size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <b>{n.title}</b>
                <div className="sub">{n.body}</div>
                <span className="muted" style={{ fontSize: 12 }}>{n.created_at.slice(0, 16).replace('T', ' ')}</span>
              </div>
              {!n.read_at && (
                <button
                  className="btn sm primary"
                  onClick={() => markRead.mutate(n.id)}
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="muted" style={{ textAlign: 'center', padding: 24 }}>No notifications yet</li>
          )}
        </ul>
      </div>
    </div>
  )
}

export const NotificationsPage: React.FC = () => (
  <AdvancedHrErrorBoundary>
    <NotificationsContent />
  </AdvancedHrErrorBoundary>
)
