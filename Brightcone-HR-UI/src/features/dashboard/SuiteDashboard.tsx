import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getHealth } from '@/api/health'
import { useAuth } from '@/auth/AuthContext'
import { dayPart, formatLongDate } from '@/domain/dates'
import { firstName } from '@/domain/people'
import { Icon } from '@/people-plus/Icon'
import { APPS } from '@/people-plus/data'
import { fetchAccounts } from '@/features/accounts/api'
import { ComingSoonPanel, MetricTile } from './MetricTile'

function AccountsMetric() {
  const { can } = useAuth()
  const allowed = can('users:manage')
  const query = useQuery({
    queryKey: ['admin-users', 'summary'],
    queryFn: () => fetchAccounts(1, 1),
    enabled: allowed,
    staleTime: 30_000,
    retry: 1,
  })
  const total = query.data?.pagination.total_items
  const value = query.isLoading
    ? 'Loading…'
    : query.isError
      ? 'Unavailable'
      : (total ?? 'Coming soon')
  const note = !allowed
    ? 'HR account access required'
    : query.isError
      ? 'Could not load from API'
      : 'Connected admin account directory'
  return (
    <MetricTile label="Portal accounts" value={value} note={note} icon="users" color="#12A58E" />
  )
}

function ConnectionIndicator() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth, staleTime: 30_000, retry: 1 })
  const state = health.data?.status === 'ok' ? 'online' : health.isPending ? 'checking' : 'offline'
  const label = {
    online: 'All systems operational',
    checking: 'Checking connection',
    offline: 'API unavailable',
  }[state]
  return (
    <span className={`pp-api-indicator ${state}`}>
      <i />
      {label}
    </span>
  )
}

function AppGrid() {
  const navigate = useNavigate()
  return (
    <section className="pp-suite-apps">
      <div className="pp-suite-section-head">
        <div>
          <h2>Apps</h2>
          <p>Open an app to view its available workspace.</p>
        </div>
        <span>{APPS.length} apps</span>
      </div>
      <div className="pp-suite-app-grid">
        {APPS.map((app) => (
          <button
            type="button"
            key={app.key}
            className="pp-suite-app-card"
            style={{ '--app-accent': app.color } as React.CSSProperties}
            onClick={() => navigate(app.path)}
          >
            <span className="pp-suite-app-icon">
              <Icon name={app.icon} size={19} />
            </span>
            <span className="pp-suite-app-copy">
              <strong>{app.name}</strong>
              <small>{app.description}</small>
            </span>
            <span className="pp-suite-app-status">
              {app.key === 'plus' ? 'Overview' : 'Coming soon'}
            </span>
            <Icon name="arrow" size={15} />
          </button>
        ))}
      </div>
    </section>
  )
}

export function SuiteDashboard() {
  const { user, can } = useAuth()
  const [today] = useState(() => new Date())

  return (
    <div className="pp-suite-dashboard">
      <section className="pp-suite-welcome">
        <div>
          <div className="pp-suite-date">{formatLongDate(today)}</div>
          <h1>
            Good {dayPart(today.getHours())}, {firstName(user?.name)}{' '}
            <span className="pp-wave">✦</span>
          </h1>
          <p>Your people operations, connected in one place.</p>
        </div>
        <div className="pp-suite-welcome-actions">
          <ConnectionIndicator />
          {can('users:manage') && (
            <Link to="/employees" className="pp-button primary">
              <Icon name="users" size={15} />
              View accounts
            </Link>
          )}
        </div>
      </section>
      <section className="pp-dash-metrics">
        <AccountsMetric />
        <MetricTile
          label="Pending approvals"
          value="Coming soon"
          note="Live approvals summary unavailable"
          icon="check"
          color="#0B6FDB"
        />
        <MetricTile
          label="Payroll status"
          value="Coming soon"
          note="Payroll data is not connected"
          icon="chart"
          color="#7C5CFF"
        />
        <MetricTile
          label="Learning progress"
          value="Coming soon"
          note="Learning data is not connected"
          icon="learn"
          color="#E07A1D"
        />
      </section>
      <AppGrid />
      <section className="pp-suite-lower">
        <ComingSoonPanel title="Payroll overview" icon="pay" />
        <ComingSoonPanel title="Approvals" icon="check" />
        <ComingSoonPanel title="Coming up" icon="calendar" />
        <ComingSoonPanel title="Celebrations" icon="heart" />
      </section>
    </div>
  )
}
