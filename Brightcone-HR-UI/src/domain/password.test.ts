import { describe, expect, it } from 'vitest'
import { passwordRules } from './password'

describe('passwordRules', () => {
  it('accepts a long, varied password', () => {
    expect(passwordRules.safeParse('correct horse battery staple').success).toBe(true)
  })

  it('rejects short passwords with the length in the message', () => {
    const result = passwordRules.safeParse('short')
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('12')
  })

  it('rejects one repeated character', () => {
    expect(passwordRules.safeParse('aaaaaaaaaaaaaaaa').success).toBe(false)
  })
})
