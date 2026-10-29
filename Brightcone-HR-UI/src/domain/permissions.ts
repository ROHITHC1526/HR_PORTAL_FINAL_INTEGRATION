/**
 * Permissions arrive from the backend as `resource:action:scope` strings, for example
 * `approvals:decide:team`. Hiding a button with these is for comfort only: the server checks every
 * request again and is the real guard.
 */
export type Scope = 'own' | 'team' | 'all'

/** True when a permission equals `permission` or starts with `permission:` (the scope is ignored). */
export function hasPermission(permissions: readonly string[], permission: string): boolean {
  // A permission is at least `resource:action`; a bare resource name never matches.
  if (permission.split(':').length < 2) return false
  return permissions.some((p) => p === permission || p.startsWith(`${permission}:`))
}

/** The widest scope granted for `resource:action`, or `null` when the permission is missing. */
export function widestScope(permissions: readonly string[], permission: string): Scope | null {
  const order: Scope[] = ['own', 'team', 'all']
  const granted = permissions
    .filter((p) => p.startsWith(`${permission}:`))
    .map((p) => p.slice(permission.length + 1))
    .filter((s): s is Scope => order.includes(s as Scope))
  if (granted.length === 0) return null
  return granted.reduce((widest, s) => (order.indexOf(s) > order.indexOf(widest) ? s : widest))
}
