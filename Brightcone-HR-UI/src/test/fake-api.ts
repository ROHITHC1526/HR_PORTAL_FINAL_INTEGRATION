import { vi } from 'vitest'
import type { Me, Session } from '@/api/client'

export const employee: Me = {
  pid: '11111111-1111-1111-1111-111111111111',
  email: 'rahul.varma@brightcone.ai',
  name: 'Rahul Varma',
  role: 'employee',
  must_change_password: false,
  permissions: ['profile:read:own', 'approvals:submit:own'],
}

export const sessionFor = (user: Me, token = 'access-1'): Session => ({
  access_token: token,
  token_type: 'Bearer',
  expires_in: 900,
  user,
})

export type Handler = (init: RequestInit | undefined, url: string) => Response | Promise<Response>

export const jsonResponse = (body: unknown, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Replaces fetch with a tiny router keyed by "METHOD /path" (the /api prefix is dropped). */
export function mockApi(routes: Record<string, Handler>) {
  const calls: { key: string; init?: RequestInit }[] = []
  const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = String(input).replace(/^\/api/, '')
    const key = `${(init?.method ?? 'GET').toUpperCase()} ${url}`
    calls.push({ key, init })
    const handler = routes[key]
    if (!handler) return jsonResponse({ error: 'not_mocked', description: key }, 500)
    return handler(init, url)
  })
  return { calls, spy, count: (key: string) => calls.filter((c) => c.key === key).length }
}
