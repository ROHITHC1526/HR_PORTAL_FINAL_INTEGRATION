import React from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { APPS } from '../data'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const TopBar: React.FC<{ onMenu?: () => void }> = ({ onMenu }) => {
  const { activeApp, theme, toggleTheme, user, viewAs, setViewAs, setPaletteOpen, toast } = usePeoplePlus()

  const app = APPS.find((a) => a.key === activeApp) || APPS[0]
  const currentRole = viewAs || user?.role || 'Employee'

  const toggleRole = () => {
    const next = currentRole === 'HR Admin' ? 'Employee' : 'HR Admin'
    setViewAs(next)
    toast(`Switched perspective to ${next}`)
  }

  return (
    <header className="top" style={{ '--ac': app.color } as React.CSSProperties}>
      <button
        type="button"
        className="icon-btn menu-btn"
        aria-label="Open mobile navigation"
        onClick={onMenu}
      >
        <Icon name="menu" size={18} />
      </button>

      <div className="crumb">
        <span>Brightcone</span>
        <Icon name="chevron" size={12} />
        <b>{app.name}</b>
      </div>

      <button type="button" className="cmd" onClick={() => setPaletteOpen(true)}>
        <Icon name="search" size={16} />
        <span>Search apps, people, or commands...</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Perspective / Role Switcher */}
        <button
          type="button"
          className="btn sm"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--line)',
            fontSize: '12.5px',
            gap: '6px',
          }}
          onClick={toggleRole}
          title="Toggle view between HR Admin and Employee"
        >
          <span className="muted">Viewing as:</span>
          <b>{currentRole}</b>
          <Icon name="swap" size={13} />
        </button>

        {/* Switch back to Main Portal */}
        <a
          href="/people/directory"
          className="btn sm"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--line)',
            fontSize: '12px',
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '8px',
          }}
          title="Return to Brightcone Main Portal"
        >
          <Icon name="arrow" size={14} />
          <span>Main Portal</span>
        </a>

        {/* Theme Toggle Button */}
        <button
          type="button"
          id="themeBtn"
          className="icon-btn"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Toggle theme"
          onClick={toggleTheme}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          id="bell"
          className="icon-btn"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => toast('No unread notifications at this time.')}
        >
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>

        {/* User Pill */}
        <div className="me">
          <div className="av" style={{ background: avatarColor(user?.name || 'User') }}>
            {initials(user?.name || 'U')}
          </div>
          <div>
            <b>{user?.name || 'Guest'}</b>
            <span>{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
