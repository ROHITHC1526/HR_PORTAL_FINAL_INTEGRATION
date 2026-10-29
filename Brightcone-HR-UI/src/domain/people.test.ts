import { describe, expect, it } from 'vitest'
import { firstName, initials, roleLabel, summarizeAccounts } from './people'

describe('initials', () => {
  it('takes the first letters of up to two words', () => {
    expect(initials('Rahul Varma')).toBe('RV')
    expect(initials('  naresh   vemparala  rao ')).toBe('NV')
    expect(initials('Cher')).toBe('C')
  })

  it('copes with empty input', () => {
    expect(initials('')).toBe('')
    expect(initials('   ')).toBe('')
  })
})

describe('firstName', () => {
  it('returns the first word or an empty string', () => {
    expect(firstName('Rahul Varma')).toBe('Rahul')
    expect(firstName('  Ananya ')).toBe('Ananya')
    expect(firstName(null)).toBe('')
    expect(firstName(undefined)).toBe('')
  })
})

describe('roleLabel', () => {
  it('maps the known backend roles', () => {
    expect(roleLabel('hr_admin')).toBe('HR Admin')
    expect(roleLabel('employee')).toBe('Employee')
  })

  it('makes an unknown role readable', () => {
    expect(roleLabel('payroll_auditor')).toBe('Payroll auditor')
  })
})

describe('summarizeAccounts', () => {
  it('counts accounts by status', () => {
    const accounts = [
      { status: 'active' },
      { status: 'active' },
      { status: 'locked' },
      { status: 'disabled' },
    ]
    expect(summarizeAccounts(accounts)).toEqual({ total: 4, active: 2, locked: 1, disabled: 1 })
    expect(summarizeAccounts([])).toEqual({ total: 0, active: 0, locked: 0, disabled: 0 })
  })
})
