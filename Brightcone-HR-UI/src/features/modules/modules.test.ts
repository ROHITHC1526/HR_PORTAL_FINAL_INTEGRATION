import { describe, expect, it } from 'vitest'
import { findModule, MODULE_ALIASES, MODULE_STUBS, titleFromSlug } from './modules'

describe('module stubs', () => {
  it('has a unique path, a phase and a ticket for each module', () => {
    const paths = MODULE_STUBS.map((m) => m.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const stub of MODULE_STUBS) {
      expect(stub.phase).toMatch(/^P\d/)
      expect(stub.ticket).toMatch(/^P\d-\d\d$/)
    }
  })

  it('points every alias at a real module', () => {
    for (const target of Object.values(MODULE_ALIASES)) {
      expect(MODULE_STUBS.some((m) => m.path === target)).toBe(true)
    }
  })

  it('finds a module by its path or an alias', () => {
    expect(findModule('leave')?.title).toBe('Leave')
    expect(findModule('my-expenses')?.path).toBe('expenses')
    expect(findModule('nothing-here')).toBeUndefined()
  })
})

describe('titleFromSlug', () => {
  it('turns a slug into a title', () => {
    expect(titleFromSlug('org-structure')).toBe('Org Structure')
    expect(titleFromSlug('')).toBe('')
  })
})
