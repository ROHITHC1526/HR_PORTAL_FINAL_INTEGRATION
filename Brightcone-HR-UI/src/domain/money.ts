/**
 * Money is always an integer number of paise (1 rupee = 100 paise), never a float. The backend
 * stores and returns paise; this is the only place that turns it into text for people.
 */
const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const rupeesAndPaise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 123456700 -> "₹12,34,567". Pass `exact` to keep the paise: "₹12,34,567.00". */
export function formatInr(paise: number, options: { exact?: boolean } = {}): string {
  if (!Number.isSafeInteger(paise)) throw new RangeError('Money must be a whole number of paise')
  const value = paise / 100
  return (options.exact ? rupeesAndPaise : rupees).format(value)
}

/** Converts a typed amount in rupees (for example "1499.50") to paise without float drift. */
export function rupeesToPaise(input: string): number | null {
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(input.trim().replace(/,/g, ''))
  if (!match) return null
  const [, whole, fraction = ''] = match
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
