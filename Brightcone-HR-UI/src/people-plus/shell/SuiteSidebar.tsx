import React from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { APPS, NAV_STRUCTURE } from '../data'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const SuiteSidebar: React.FC<{ mobileOpen?: boolean; close?: () => void }> = ({
  mobileOpen = false,
  close,
}) => {
  const { activeApp, activeView, setActiveView, user, viewAs, logout, state } = usePeoplePlus()

  const effectiveRole = (viewAs || user?.role || 'Employee') === 'HR Admin' ? 'admin' : 'employee'
  const app = APPS.find((entry) => entry.key === activeApp) || APPS[0]
  const groups = NAV_STRUCTURE[effectiveRole]?.[activeApp] || []

  const pendingLeaves = state.leaves.filter((l) => l.status === 'Pending').length
  const pendingExpenses = state.expenses.filter((e) => e.status === 'Pending').length

  const getItemCount = (itemKey: string) => {
    if (itemKey === 'approvals') return pendingLeaves + pendingExpenses
    if (itemKey === 'claims') return pendingExpenses
    if (itemKey === 'leave') return pendingLeaves
    return undefined
  }

  const handleNavClick = (viewKey: string) => {
    setActiveView(viewKey)
    close?.()
  }

  return (
    <aside className={`side ${mobileOpen ? 'on' : ''}`} style={{ '--ac': app.color } as React.CSSProperties}>
      <div className="apphead">
        <i>
          <Icon name={app.icon} size={20} />
        </i>
        <div>
          <b>{app.name}</b>
          <span>{app.description}</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '8px 0' }} aria-label={`${app.name} navigation`}>
        {groups.map((g) => (
          <div key={g.group}>
            <div className="navgroup">{g.group}</div>
            <div className="ngitems">
              {g.items.map((item) => {
                const isActive = activeView === item.key
                const count = getItemCount(item.key)
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={`nav ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <Icon name={item.icon} size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {count !== undefined && count > 0 && <span className="count">{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <div className="agent-card" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />
            <b style={{ fontSize: '12.5px' }}>Bright HR Agent</b>
          </div>
          <p className="muted" style={{ fontSize: '11.5px', margin: 0, lineHeight: 1.4 }}>
            Autonomous intelligence monitoring statutory deadlines & compliance.
          </p>
        </div>

        <div className="side-user">
          <div className="av" style={{ background: avatarColor(user?.name || 'User') }}>
            {initials(user?.name || 'U')}
          </div>
          <div>
            <b>{user?.name || 'Guest User'}</b>
            <span>{effectiveRole === 'admin' ? 'HR Administrator' : 'Employee Portal'}</span>
          </div>
          <button type="button" aria-label="Sign out" title="Sign out" onClick={logout}>
            <Icon name="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
