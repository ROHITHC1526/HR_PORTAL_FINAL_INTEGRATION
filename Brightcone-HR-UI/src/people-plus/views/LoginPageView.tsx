import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePeoplePlus } from '../people-plus-context'
import { Icon } from '../Icon'

export const LoginPageView: React.FC = () => {
  const { login, theme, toggleTheme } = usePeoplePlus()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const success = await login(email, password)
    if (!success) setError('Unable to sign in. Check your credentials or contact your administrator.')
    setSubmitting(false)
  }

  return (
    <div className="login">
      {/* Brand & Product Showcase Pane */}
      <section className="lp">
        <div>
          <div className="logo">
            <img src="/brightcone-mark.png" alt="Brightcone" style={{ width: 36, height: 'auto' }} />
            <span>Brightcone <b>People Plus</b></span>
          </div>
          <p className="lede">
            The intelligent operating system for people operations, autonomous payroll, and talent intelligence.
          </p>

          <div className="glasses">
            <div className="glass">
              <b>All 9 Suite Apps in One Unified Core</b>
              <p>People, Recruit, Payroll, Expense, Sign, Connect, Learn, Shift, and Advanced HR.</p>
            </div>
            <div className="glass">
              <b>Autonomous Statutory Compliance</b>
              <p>Automated EPF, ESI, TDS calculations with instant bank transfer file generation.</p>
            </div>
            <div className="glass">
              <b>AI Applicant Tracking System</b>
              <p>Instant resume parsing, skill matching scores, and streamlined offer-to-hire pipelines.</p>
            </div>
          </div>
        </div>

        <div className="foot">
          © {new Date().getFullYear()} Brightcone, Inc. Enterprise Grade · SOC-2 Type II Certified
        </div>
      </section>

      {/* Authentication Form Pane */}
      <section className="lf">
        <div style={{ position: 'absolute', top: '24px', right: '28px' }}>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>

        <div className="lcard">
          <h2>Sign in to Brightcone</h2>
          <p className="sub">Access your employee self-service portal or administrative suite.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <span>Work Email</span>
              <input
                className="input"
                type="email"
                placeholder="name@brightcone.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Password</span>
                <Link className="muted" style={{ fontSize: '12px' }} to="/forgot-password">Forgot password?</Link>
              </div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="lerr" role="alert">
                {error}
              </div>
            )}

            <button disabled={submitting} type="submit" className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
              {submitting ? 'Signing in…' : 'Sign in to People Plus'}
            </button>
          </form>

          <div className="or">
            <span>Sign in with your work account</span>
          </div>
          <p className="muted">Use the credentials issued by your Brightcone administrator.</p>
        </div>
      </section>
    </div>
  )
}
