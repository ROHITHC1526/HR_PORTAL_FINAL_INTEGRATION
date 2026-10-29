/** Date and time wording for the UI. Pure, so it is easy to test with a fixed `Date`. */

/** "2026-10-12T09:30:00+05:30" -> "12 Oct 2026". Returns an em dash for empty or invalid input. */
export function formatDate(value: string | Date | null | undefined, locale?: string): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | Date | null | undefined, locale?: string): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** "Monday, 12 October 2026" for dashboard headers. */
export function formatLongDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export type DayPart = 'morning' | 'afternoon' | 'evening'

/** Which greeting fits an hour of the day (0 to 23). */
export function dayPart(hour: number): DayPart {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
