import { z } from 'zod'

const MIN_PASSWORD_LENGTH = 12

/**
 * Quick feedback in the browser. The server applies the same rules plus a common-password list
 * and is the one that decides.
 */
export const passwordRules = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`)
  .refine((p) => new Set(p).size > 1, 'Password must not be a single repeated character.')
