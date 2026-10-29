import { z } from 'zod'

/**
 * The only place that reads `import.meta.env`. Everything else imports `env` from here, so a
 * missing or malformed variable fails once, loudly, at start-up instead of as a confusing bug later.
 *
 * Never put a secret in a `VITE_` variable: every one of them is public in the browser bundle.
 * Variables are documented in `.env.example`.
 */
const schema = z.object({
  /** Base path (or full URL) of the backend API. Keep `/api` so dev and production behave alike. */
  VITE_API_URL: z.string().trim().min(1).default('/api'),
  /** Product name shown on the sign-in page and in the sidebar. */
  VITE_APP_NAME: z.string().trim().min(1).default('Brightcone People Plus'),
  /** Shows the internal UI-kit page. Always on in development, off by default in production. */
  VITE_ENABLE_UI_KIT: z.enum(['true', 'false']).default('false'),
  DEV: z.boolean().default(false),
})

export type Env = {
  apiUrl: string
  appName: string
  uiKitEnabled: boolean
  isDev: boolean
}

/** Validates raw variables. Exported separately so tests can feed it plain objects. */
export function parseEnv(raw: Record<string, unknown>): Env {
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid environment configuration (see .env.example): ${problems}`)
  }
  const v = parsed.data
  return {
    apiUrl: v.VITE_API_URL.replace(/\/+$/, ''),
    appName: v.VITE_APP_NAME,
    uiKitEnabled: v.DEV || v.VITE_ENABLE_UI_KIT === 'true',
    isDev: v.DEV,
  }
}

export const env: Env = parseEnv(import.meta.env as Record<string, unknown>)
