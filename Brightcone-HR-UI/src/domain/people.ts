/** Wording and shapes for people. Pure and framework-free. */

/** "Rahul Varma" -> "RV". Never throws on empty or odd input. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** "Rahul Varma" -> "Rahul". */
export function firstName(name: string | null | undefined): string {
  return name?.trim().split(/\s+/)[0] ?? ''
}

const ROLE_LABELS: Record<string, string> = {
  employee: 'Employee',
  manager: 'Manager',
  finance: 'Finance',
  hr_admin: 'HR Admin',
}

/** Backend role code -> label. Unknown codes are made readable instead of shown raw. */
export function roleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

export type AccountLike = { status: string }

export type AccountSummary = { total: number; active: number; locked: number; disabled: number }

/** Headline numbers for the accounts page, from the rows already loaded. */
export function summarizeAccounts(accounts: readonly AccountLike[]): AccountSummary {
  const count = (status: string) => accounts.filter((a) => a.status === status).length
  return {
    total: accounts.length,
    active: count('active'),
    locked: count('locked'),
    disabled: count('disabled'),
  }
}
