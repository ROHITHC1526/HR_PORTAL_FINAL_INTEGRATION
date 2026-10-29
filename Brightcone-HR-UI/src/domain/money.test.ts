import { describe, expect, it } from 'vitest'
import { formatInr, rupeesToPaise } from './money'

const normalise = (s: string) => s.replace(/ /g, ' ')

describe('formatInr', () => {
  it('uses Indian digit grouping', () => {
    expect(normalise(formatInr(123_456_700))).toBe('₹12,34,567')
    expect(normalise(formatInr(0))).toBe('₹0')
  })

  it('can show the paise', () => {
    expect(normalise(formatInr(149_950, { exact: true }))).toBe('₹1,499.50')
  })

  it('refuses fractional paise so a float can never slip into money', () => {
    expect(() => formatInr(10.5)).toThrow(RangeError)
    expect(() => formatInr(Number.NaN)).toThrow(RangeError)
  })
})

describe('rupeesToPaise', () => {
  it('converts typed amounts exactly', () => {
    expect(rupeesToPaise('1499.50')).toBe(149_950)
    expect(rupeesToPaise('1,499')).toBe(149_900)
    expect(rupeesToPaise('0.1')).toBe(10)
    expect(rupeesToPaise('19.99')).toBe(1_999)
  })

  it('rejects anything that is not a plain amount', () => {
    for (const bad of ['', 'abc', '-5', '1.234', '1e3', '12,34,5.678']) {
      expect(rupeesToPaise(bad)).toBeNull()
    }
  })
})
