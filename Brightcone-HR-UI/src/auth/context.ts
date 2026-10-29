import { createContext } from 'react'
import type { Me, Session } from '@/api/client'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'
export type AuthState = {
  status: AuthStatus
  user: Me | null
  notice: string | null
  signIn: (email: string, password: string, remember: boolean) => Promise<Me>
  signOut: () => Promise<void>
  adopt: (session: Session) => void
  can: (permission: string) => boolean
  clearNotice: () => void
}

export const AuthStateContext = createContext<AuthState | null>(null)
