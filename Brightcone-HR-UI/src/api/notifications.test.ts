import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { adoptSession, clearAccessToken } from './client'
import { listNotifications, markNotificationRead } from './notifications'
import { employee, jsonResponse, mockApi, sessionFor } from '@/test/fake-api'

beforeEach(() => {
  clearAccessToken()
  adoptSession(sessionFor(employee))
})

afterEach(() => {
  clearAccessToken()
  vi.restoreAllMocks()
})

describe('notification API', () => {
  it('loads notices and unread count from the authenticated API', async () => {
    const fake = mockApi({
      'GET /notifications': () => jsonResponse({ items: [], unread_count: 0 }),
    })

    await expect(listNotifications()).resolves.toEqual({ items: [], unread_count: 0 })
    expect(fake.count('GET /notifications')).toBe(1)
    expect(new Headers(fake.calls[0].init?.headers).get('Authorization')).toBe('Bearer access-1')
  })

  it('marks a notice read with an encoded id', async () => {
    const fake = mockApi({
      'POST /notifications/id%2Fwith%20space/read': () =>
        jsonResponse({ id: 'id/with space', read_at: 'now' }),
    })

    await markNotificationRead('id/with space')
    expect(fake.count('POST /notifications/id%2Fwith%20space/read')).toBe(1)
  })
})
