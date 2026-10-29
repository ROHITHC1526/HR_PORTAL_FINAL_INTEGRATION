import type { Employee } from './types'

export const AVC = ['#2457F5', '#14B8E6', '#7C5CFF', '#0FA37F', '#E0811D', '#D9466F', '#3B82C4', '#6366F1']

export const avatarColor = (s: string) =>
  AVC[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % AVC.length]

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const localISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const formatDate = (s?: string) => {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const formatDateShort = (s?: string) => {
  if (!s) return '—'
  const d = new Date(s + 'T00:00:00')
  return isNaN(d.getTime())
    ? s
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 864e5)

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return localISO(d)
}

export const addMonths = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00')
  d.setMonth(d.getMonth() + n)
  return localISO(d)
}

export function weekdays(a: string, b: string) {
  const d = new Date(a + 'T00:00:00')
  const e = new Date(b + 'T00:00:00')
  let n = 0
  if (e < d) return 0
  while (d <= e) {
    const w = d.getDay()
    if (w !== 0 && w !== 6) n++
    d.setDate(d.getDate() + 1)
  }
  return n
}

export function salary(e: Employee) {
  const m = e.ctc / 12
  const basic = m * 0.4
  const hra = basic * 0.5
  const pfE = Math.round(basic * 0.12)
  const special = m - basic - hra - pfE
  const pt = 200
  const tds = Math.max(0, ((e.ctc - 1000000) * 0.2) / 12)
  return {
    earn: [
      ['Basic', basic],
      ['House rent allowance', hra],
      ['Special allowance', special],
    ] as [string, number][],
    pfE,
    ded: [
      ['Provident fund', pfE],
      ['Professional tax', pt],
      ['Income tax (TDS)', tds],
    ] as [string, number][],
    gross: basic + hra + special,
    net: basic + hra + special - pfE - pt - tds,
  }
}

export const makeEmail = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '.') + '@brightcone.ai'
