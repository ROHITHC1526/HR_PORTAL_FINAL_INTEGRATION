import { env } from '@/config/env'
import { useState, type ReactNode } from 'react'
import { currentTheme, toggleTheme } from '@/theme'
import { APPS } from '@/people-plus/data'
import { Icon } from '@/people-plus/Icon'
import './auth-reference.css'

/** Split sign-in frame from the Brightcone People Plus reference. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const [theme, setTheme] = useState(currentTheme())
  return (
    <div className="auth-reference">
      <section className="auth-reference-hero" aria-label={env.appName}>
        <div className="auth-reference-glow" />
        <img
          className="auth-reference-wordmark"
          src="/brightcone-wordmark.png"
          alt="brightcone.ai — Clarity. Focus. Impact"
        />
        <h2>
          Everything about work
          <br />
          at Brightcone, in one
          <br />
          place.
        </h2>
        <p className="auth-reference-product">{env.appName}</p>
        <p className="auth-reference-copy">
          Employees apply for leave, download payslips and raise requests. HR runs payroll,
          approvals and hiring from one inbox.
        </p>
        <div className="auth-reference-apps">
          {APPS.map((app) => (
            <span key={app.key} style={{ '--dot': app.color } as React.CSSProperties}>
              <i />
              {app.name}
            </span>
          ))}
        </div>
        <div className="auth-reference-updates">
          <div>
            <span className="auth-update-icon">
              <Icon name="check" size={16} />
            </span>
            <span>
              <strong>People updates</strong>
              <small>Coming soon · Live updates will appear here.</small>
            </span>
          </div>
          <div>
            <span className="auth-update-icon payroll">
              <Icon name="pay" size={16} />
            </span>
            <span>
              <strong>Payroll updates</strong>
              <small>Coming soon · Payroll notices will appear here.</small>
            </span>
          </div>
        </div>
        <footer>
          <span>SOC 2 Type II aligned</span>
          <span>HIPAA-ready</span>
          <a href="mailto:hello@brightcone.ai">Need help? hello@brightcone.ai</a>
        </footer>
      </section>
      <section className="auth-reference-panel">
        <button
          type="button"
          className="auth-reference-theme"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => setTheme(toggleTheme())}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
        </button>
        <div className="auth-reference-form">
          <h1>{title}</h1>
          {subtitle && <p className="auth-reference-subtitle">{subtitle}</p>}
          {children}
        </div>
      </section>
    </div>
  )
}
