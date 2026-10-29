import React from 'react'
import { usePendingActions, useActionMetrics } from './api'
import { useMarkRead } from '@/features/advanced-hr/api'
import { ActionsErrorBoundary } from './ErrorBoundary'
import { Icon } from '@/people-plus/Icon'

function ActionsContent() {
  const actions = usePendingActions(true)
  const metrics = useActionMetrics(true)
  const markRead = useMarkRead()

  if (actions.isLoading) {
    return <div className="loader">Loading actions…</div>
  }

  if (actions.error) {
    return (
      <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
        <h2>Could not load actions</h2>
        <p className="muted">The actions API is not reachable.</p>
      </section>
    )
  }

  const items = actions.data?.items ?? []
  const unread = actions.data?.unread_count ?? 0
  const m = metrics.data

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Actions & Reminders</div>
          <h1>Pending Actions</h1>
          <p>{unread} action{unread !== 1 ? 's' : ''} requiring attention</p>
        </div>
      </div>

      {m && (
        <div className="grid g3 mt">
          <div className="card stat">
            <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
            <div className="v">{m.pending}</div>
          </div>
          <div className="card stat">
            <div className="k"><i><Icon name="shield" size={16} /></i> Complete</div>
            <div className="v">{m.complete}</div>
          </div>
          <div className="card stat">
            <div className="k"><i><Icon name="bell" size={16} /></i> Failed</div>
            <div className="v">{m.failed}</div>
          </div>
        </div>
      )}

      <div className="card mt">
        <h3>Action Items</h3>
        <ul className="tline">
          {items.map((n) => (
            <li key={n.id}>
              <div
                className="tdot"
                style={{ '--ac': n.read_at ? 'var(--muted)' : 'var(--bad)' } as React.CSSProperties}
              >
                <Icon name="bell" size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <b>{n.title}</b>
                <div className="sub">{n.body}</div>
                <span className="muted" style={{ fontSize: 12 }}>
                  {n.created_at.slice(0, 16).replace('T', ' ')}
                </span>
              </div>
              <span className={`pill ${n.read_at ? 'p-ok' : 'p-warn'}`}>
                {n.read_at ? 'Resolved' : 'Pending'}
              </span>
              {!n.read_at && <button className="btn sm" onClick={() => markRead.mutate(n.id)}>Mark read</button>}
            </li>
          ))}
          {items.length === 0 && (
            <li className="muted" style={{ textAlign: 'center', padding: 24 }}>
              No pending actions
            </li>
          )}
        </ul>
      </div>
      {markRead.error && <p className="card mt" role="alert">Could not update this reminder. Refresh and try again.</p>}
    </div>
  )
}

export const ActionsPage: React.FC = () => (
  <ActionsErrorBoundary>
    <ActionsContent />
  </ActionsErrorBoundary>
)
