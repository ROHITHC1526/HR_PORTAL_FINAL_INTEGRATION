/** One place that decides which colour a status or event gets, so every screen agrees. */
export type Tone = 'ok' | 'warn' | 'bad' | 'info'

const ACCOUNT_TONES: Record<string, Tone> = {
  active: 'ok',
  locked: 'bad',
  disabled: 'warn',
}

/** Portal account status -> tone. Unknown values read as neutral information. */
export function accountStatusTone(status: string): Tone {
  return ACCOUNT_TONES[status] ?? 'info'
}

/** Audit event name (`auth.login_failed`, `user.created`, ...) -> tone. */
export function auditActionTone(action: string): Tone {
  if (action.includes('created') || action.includes('unlocked')) return 'ok'
  if (action.includes('failed') || action.includes('locked') || action.includes('disabled')) {
    return 'bad'
  }
  if (action.includes('reset') || action.includes('role')) return 'warn'
  return 'info'
}

/** "hr_admin" or "login_failed" -> "Hr admin" / "Login failed". */
export function humanize(value: string): string {
  const spaced = value.replace(/[_.]+/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
