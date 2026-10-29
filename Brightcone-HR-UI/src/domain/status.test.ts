import { describe, expect, it } from 'vitest'
import { accountStatusTone, auditActionTone, humanize } from './status'

describe('accountStatusTone', () => {
  it('maps the three account states', () => {
    expect(accountStatusTone('active')).toBe('ok')
    expect(accountStatusTone('locked')).toBe('bad')
    expect(accountStatusTone('disabled')).toBe('warn')
  })

  it('treats anything else as neutral', () => {
    expect(accountStatusTone('pending')).toBe('info')
  })
})

describe('auditActionTone', () => {
  it('flags failures and locks as bad, resets and role changes as a warning', () => {
    expect(auditActionTone('auth.login_failed')).toBe('bad')
    expect(auditActionTone('auth.account_locked')).toBe('bad')
    expect(auditActionTone('user.disabled')).toBe('bad')
    expect(auditActionTone('user.password_reset_by_admin')).toBe('warn')
    expect(auditActionTone('user.role_changed')).toBe('warn')
  })

  it('shows creation and unlocking as good news, the rest as information', () => {
    expect(auditActionTone('user.created')).toBe('ok')
    expect(auditActionTone('user.unlocked')).toBe('ok')
    expect(auditActionTone('auth.login')).toBe('info')
  })
})

describe('humanize', () => {
  it('turns codes into sentences', () => {
    expect(humanize('hr_admin')).toBe('Hr admin')
    expect(humanize('auth.login_failed')).toBe('Auth login failed')
    expect(humanize('')).toBe('')
  })
})
