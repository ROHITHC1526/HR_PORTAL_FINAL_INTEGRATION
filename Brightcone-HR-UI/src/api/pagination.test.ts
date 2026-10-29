import { describe, expect, it } from 'vitest'
import { pageQuery } from './pagination'

describe('pageQuery', () => {
  it('builds a query string from the given values only', () => {
    expect(pageQuery({ page: 2, pageSize: 25 })).toBe('?page=2&page_size=25')
    expect(pageQuery({ pageSize: 1 })).toBe('?page_size=1')
  })

  it('is empty when nothing is given', () => {
    expect(pageQuery()).toBe('')
    expect(pageQuery({})).toBe('')
  })
})
