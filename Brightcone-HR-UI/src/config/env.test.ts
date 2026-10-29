import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('applies safe defaults when nothing is set', () => {
    expect(parseEnv({})).toEqual({
      apiUrl: '/api',
      appName: 'Brightcone People Plus',
      uiKitEnabled: false,
      isDev: false,
    })
  })

  it('reads custom values and trims a trailing slash from the API URL', () => {
    const env = parseEnv({ VITE_API_URL: 'https://hr.example.com/api/', VITE_APP_NAME: 'Acme HR' })
    expect(env.apiUrl).toBe('https://hr.example.com/api')
    expect(env.appName).toBe('Acme HR')
  })

  it('shows the UI kit in development or when explicitly enabled', () => {
    expect(parseEnv({ DEV: true }).uiKitEnabled).toBe(true)
    expect(parseEnv({ VITE_ENABLE_UI_KIT: 'true' }).uiKitEnabled).toBe(true)
    expect(parseEnv({ VITE_ENABLE_UI_KIT: 'false' }).uiKitEnabled).toBe(false)
  })

  it('refuses malformed values with a message that names the variable', () => {
    expect(() => parseEnv({ VITE_ENABLE_UI_KIT: 'maybe' })).toThrow(/VITE_ENABLE_UI_KIT/)
    expect(() => parseEnv({ VITE_API_URL: '   ' })).toThrow(/VITE_API_URL/)
  })
})
