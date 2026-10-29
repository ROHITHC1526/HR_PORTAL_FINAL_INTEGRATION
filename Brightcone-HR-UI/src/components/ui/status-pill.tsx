import { accountStatusTone, humanize, type Tone } from '@/domain/status'
import { Pill } from './primitives'

/**
 * A coloured badge for a status such as `active`, `locked` or `disabled`.
 * Use this instead of hand-picking `Pill` tones so every screen shows a status the same way.
 * Pass `tone` to override the default mapping (for example for audit events).
 */
export function StatusPill({
  status,
  tone,
  label,
}: {
  status: string
  tone?: Tone
  label?: string
}) {
  return <Pill tone={tone ?? accountStatusTone(status)}>{label ?? humanize(status)}</Pill>
}
