import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type Notification = components['schemas']['Notification']
export type NotificationPage = components['schemas']['NotificationPage']
export type RuleMetrics = components['schemas']['RuleMetrics']

const actionsKey = ['actions', 'pending'] as const
const metricsKey = ['rules', 'metrics'] as const

export function usePendingActions(enabled: boolean) {
  return useQuery({
    queryKey: actionsKey,
    queryFn: () => api<NotificationPage>('/notifications'),
    enabled,
    retry: 1,
  })
}

export function useActionMetrics(enabled: boolean) {
  return useQuery({
    queryKey: metricsKey,
    queryFn: () => api<RuleMetrics>('/rules/metrics'),
    enabled,
    retry: 1,
  })
}
