import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/auth/useAuth'
import { emptyState } from './initial-state'
import type { AppKey } from './data'
import type { Candidate, Employee, ExpenseClaim, LeaveRequest, SuiteState, Ticket } from './types'

export interface UserSession { email: string; name: string; role: 'HR Admin' | 'Employee' }
export interface ModalState { type: string; data?: Record<string, unknown> }
export interface DrawerState { type: string; data?: Record<string, unknown> }
export interface PeoplePlusContextType {
  state: SuiteState; user: UserSession | null; theme: 'light' | 'dark'; activeApp: AppKey
  activeView: string; modal: ModalState | null; drawer: DrawerState | null; paletteOpen: boolean
  toastMsg: string | null; viewAs: string | null
  login: (email: string, pass: string) => Promise<boolean>; logout: () => void
  setThemeMode: (mode: 'light' | 'dark') => void; toggleTheme: () => void
  setActiveApp: (app: AppKey) => void; setActiveView: (view: string) => void
  openModal: (type: string, data?: Record<string, unknown>) => void; closeModal: () => void
  openDrawer: (type: string, data?: Record<string, unknown>) => void; closeDrawer: () => void
  setPaletteOpen: (open: boolean) => void; toast: (msg: string) => void
  setViewAs: (role: string | null) => void; toggleClock: () => void
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status'>) => void
  approveLeave: (id: string) => void; rejectLeave: (id: string) => void
  claimExpense: (claim: Omit<ExpenseClaim, 'id' | 'status'>) => void
  approveExpense: (id: string) => void; rejectExpense: (id: string) => void; payExpense: (id: string) => void
  raiseTicket: (ticket: Omit<Ticket, 'id' | 'status' | 'date' | 'notes'>) => void
  addEmployee: (emp: Employee) => void; postKudos: (to: string, text: string) => void
  likePost: (id: string) => void; addComment: (id: string, text: string) => void
  signDoc: (id: string) => void; advancePayroll: () => void
  advanceCand: (id: string, stage: Candidate['s']) => void; updateGoal: (id: string, progress: number) => void
  auditLog: (action: string) => void
}

const Context = createContext<PeoplePlusContextType | null>(null)
const THEME_KEY = 'bc-theme'

export function PeoplePlusProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark',
  )
  const [activeApp, setActiveApp] = useState<AppKey>('plus')
  const [activeView, setActiveView] = useState('suiteDash')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
    localStorage.removeItem('bc-hr-state')
    localStorage.removeItem('bc-hr-session')
  }, [theme])
  const toast = useCallback((message: string) => {
    setToastMsg(message)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setToastMsg(null), 3000))
  }, [timer])
  const user = auth.user ? {
    email: auth.user.email, name: auth.user.name,
    role: auth.user.role === 'hr_admin' || auth.user.role === 'admin' ? 'HR Admin' as const : 'Employee' as const,
  } : null
  const state = useMemo(() => ({ ...emptyState(), role: user?.role === 'HR Admin' ? 'admin' as const : 'employee' as const }), [user?.role])
  const login = useCallback(async (email: string, pass: string) => {
    try { await auth.signIn(email, pass, true); return true }
    catch { toast('Sign in failed. Check your work email and password.'); return false }
  }, [auth, toast])
  const unavailable = useCallback(() => toast('This action is not available from the connected backend yet.'), [toast])
  const value = useMemo<PeoplePlusContextType>(() => ({
    state, user, theme, activeApp, activeView, modal, drawer, paletteOpen, toastMsg, viewAs: null,
    login, logout: () => { void auth.signOut() }, setThemeMode: setTheme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
    setActiveApp, setActiveView, openModal: (type, data) => setModal({ type, data }), closeModal: () => setModal(null),
    openDrawer: (type, data) => setDrawer({ type, data }), closeDrawer: () => setDrawer(null),
    setPaletteOpen, toast, setViewAs: () => toast('Role switching is disabled; permissions come from your account.'),
    toggleClock: unavailable, applyLeave: unavailable, approveLeave: unavailable, rejectLeave: unavailable,
    claimExpense: unavailable, approveExpense: unavailable, rejectExpense: unavailable, payExpense: unavailable,
    raiseTicket: unavailable, addEmployee: unavailable, postKudos: unavailable, likePost: unavailable,
    addComment: unavailable, signDoc: unavailable, advancePayroll: unavailable, advanceCand: unavailable,
    updateGoal: unavailable, auditLog: () => undefined,
  }), [state, user, theme, activeApp, activeView, modal, drawer, paletteOpen, toastMsg, login, auth, toast, unavailable])
  if (auth.status === 'loading') return <div className="login"><p>Connecting to Brightcone…</p></div>
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function usePeoplePlus() {
  const value = useContext(Context)
  if (!value) throw new Error('usePeoplePlus must be used within PeoplePlusProvider')
  return value
}
