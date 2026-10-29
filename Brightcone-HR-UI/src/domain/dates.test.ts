import { describe, expect, it } from 'vitest'
import { dayPart, formatDate, formatDateTime, formatLongDate } from './dates'

describe('formatDate', () => {
  it('formats ISO strings and Date objects', () => {
    expect(formatDate('2026-10-12T09:30:00Z', 'en-GB')).toBe('12 Oct 2026')
    expect(formatDate(new Date(2026, 9, 12), 'en-GB')).toBe('12 Oct 2026')
  })

  it('shows an em dash instead of "Invalid Date"', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
    expect(formatDate('not a date')).toBe('—')
  })
})

describe('formatDateTime and formatLongDate', () => {
  it('include the time and weekday respectively', () => {
    expect(formatDateTime(new Date(2026, 9, 12, 9, 5), 'en-GB')).toContain('09:05')
    expect(formatLongDate(new Date(2026, 9, 12), 'en-GB')).toContain('Monday')
    expect(formatDateTime('nope')).toBe('—')
  })
})

describe('dayPart', () => {
  it('splits the day at noon and five o clock', () => {
    expect([0, 11].map(dayPart)).toEqual(['morning', 'morning'])
    expect([12, 16].map(dayPart)).toEqual(['afternoon', 'afternoon'])
    expect([17, 23].map(dayPart)).toEqual(['evening', 'evening'])
  })
})
