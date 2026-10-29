import { describe, expect, it } from 'vitest'
import { hasPermission, widestScope } from './permissions'

const manager = ['profile:read:own', 'approvals:decide:team', 'approvals:read:team']

describe('hasPermission', () => {
  it('matches on resource and action whatever the scope', () => {
    expect(hasPermission(manager, 'approvals:decide')).toBe(true)
    expect(hasPermission(manager, 'profile:read')).toBe(true)
  })

  it('also accepts a full resource:action:scope string', () => {
    expect(hasPermission(manager, 'approvals:decide:team')).toBe(true)
    expect(hasPermission(manager, 'approvals:decide:all')).toBe(false)
  })

  it('is deny-by-default', () => {
    expect(hasPermission(manager, 'audit:read')).toBe(false)
    expect(hasPermission([], 'profile:read')).toBe(false)
  })

  it('does not match a longer permission by prefix', () => {
    expect(hasPermission(['approvals:decide:team'], 'approvals')).toBe(false)
    expect(hasPermission(['approvals:decide:team'], 'approvals:dec')).toBe(false)
  })
})

describe('widestScope', () => {
  it('returns the widest scope granted', () => {
    expect(widestScope(manager, 'approvals:decide')).toBe('team')
    expect(widestScope(['files:read:own', 'files:read:all'], 'files:read')).toBe('all')
  })

  it('returns null when missing or when the scope is unknown', () => {
    expect(widestScope(manager, 'audit:read')).toBeNull()
    expect(widestScope(['x:y:galaxy'], 'x:y')).toBeNull()
  })
})
