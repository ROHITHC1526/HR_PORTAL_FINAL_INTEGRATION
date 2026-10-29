import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { employee, jsonResponse, mockApi, sessionFor } from '@/test/fake-api'
import {
  api,
  ApiError,
  clearAccessToken,
  getAccessToken,
  onSessionChange,
  refreshSession,
} from './client'

beforeEach(() => clearAccessToken())
afterEach(() => vi.restoreAllMocks())

describe('api client', () => {
  it('keeps the access token in memory only', async () => {
    mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee, 'secret-token')) })
    await refreshSession()

    expect(getAccessToken()).toBe('secret-token')
    expect(JSON.stringify({ ...localStorage })).not.toContain('secret-token')
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('secret-token')
  })

  it('refreshes once and retries when the access token has expired', async () => {
    let attempt = 0
    const fake = mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(employee, 'fresh')),
      'GET /me': (init) => {
        attempt += 1
        const auth = new Headers(init?.headers).get('Authorization')
        return attempt === 1 || auth !== 'Bearer fresh'
          ? jsonResponse({ error: 'unauthorized' }, 401)
          : jsonResponse(employee)
      },
    })

    const me = await api<typeof employee>('/me')

    expect(me.email).toBe(employee.email)
    expect(fake.count('POST /auth/refresh')).toBe(1)
    expect(fake.count('GET /me')).toBe(2)
  })

  it('shares one refresh between parallel calls', async () => {
    let first = true
    const fake = mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(employee, 'fresh')),
      'GET /a': () => (first ? ((first = false), jsonResponse({}, 401)) : jsonResponse({ ok: 1 })),
      'GET /b': () => jsonResponse({ ok: 2 }),
    })
    // Make /b fail the same way once.
    await Promise.all([api('/a'), api('/b')])
    expect(fake.count('POST /auth/refresh')).toBeLessThanOrEqual(1)
  })

  it('tells the app when the session is gone', async () => {
    mockApi({
      'POST /auth/refresh': () => jsonResponse({ error: 'unauthorized' }, 401),
      'GET /me': () => jsonResponse({ error: 'unauthorized', description: 'Please sign in.' }, 401),
    })
    const listener = vi.fn()
    const off = onSessionChange(listener)

    await expect(api('/me')).rejects.toBeInstanceOf(ApiError)
    expect(listener).toHaveBeenCalledWith(null)
    expect(getAccessToken()).toBeNull()
    off()
  })

  it('does not try to refresh when the sign-in itself is rejected', async () => {
    const fake = mockApi({
      'POST /auth/login': () =>
        jsonResponse(
          { error: 'unauthorized', description: 'Email or password is incorrect.' },
          401,
        ),
    })
    await expect(api('/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 401,
      message: 'Email or password is incorrect.',
    })
    expect(fake.count('POST /auth/refresh')).toBe(0)
  })

  it('sends the anti-CSRF header and cookies on refresh', async () => {
    const fake = mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee)) })
    await refreshSession()
    const init = fake.calls[0].init!
    expect(init.credentials).toBe('include')
    expect(new Headers(init.headers).get('X-Requested-With')).toBe('brightcone')
  })
})
