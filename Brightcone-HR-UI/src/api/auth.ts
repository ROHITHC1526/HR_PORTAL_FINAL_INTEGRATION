import { api, csrfHeaders, json, type Session } from './client'

export const login = (email: string, password: string, remember: boolean) =>
  api<Session>('/auth/login', json({ email, password, remember }))

export const logout = () => api<void>('/auth/logout', { method: 'POST', headers: csrfHeaders })

export const forgotPassword = (email: string) =>
  api<{ message: string }>('/auth/forgot', json({ email }))

export const resetPassword = (token: string, password: string) =>
  api<{ message: string }>('/auth/reset', json({ token, password }))

export const changePassword = (current_password: string, new_password: string) =>
  api<Session>('/me/password', {
    method: 'PUT',
    body: JSON.stringify({ current_password, new_password }),
  })
