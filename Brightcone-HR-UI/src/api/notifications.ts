import type { components } from './schema'
import { api } from './client'

export type Notification = components['schemas']['Notification']
export type NotificationPage = components['schemas']['NotificationPage']

export const listNotifications = () => api<NotificationPage>('/notifications')

export const markNotificationRead = (id: string) =>
  api<Notification>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' })
