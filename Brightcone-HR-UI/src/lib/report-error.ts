import { env } from '@/config/env'

/**
 * The single place unexpected errors go. Today it logs to the console in development; when a
 * monitoring service is chosen (Sentry, Datadog, ...) only this function changes.
 *
 * Never pass passwords, tokens or personal data in `context`.
 */
export function reportError(error: unknown, context: Record<string, string> = {}): void {
  if (!env.isDev) return
  console.error('[app error]', error, context)
}
