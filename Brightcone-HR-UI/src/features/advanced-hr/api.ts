import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type Rule = components['schemas']['Rule']
export type RuleUpdate = components['schemas']['RuleUpdate']
export type RuleMetrics = components['schemas']['RuleMetrics']
export type Notification = components['schemas']['Notification']
export type NotificationPage = components['schemas']['NotificationPage']

const rulesKey = ['rules'] as const
const metricsKey = ['rules', 'metrics'] as const
const notificationsKey = ['notifications'] as const

export function useRules(enabled: boolean) {
  return useQuery({
    queryKey: rulesKey,
    queryFn: () => api<Rule[]>('/rules'),
    enabled,
    retry: 1,
  })
}

export function useRuleMetrics(enabled: boolean) {
  return useQuery({
    queryKey: metricsKey,
    queryFn: () => api<RuleMetrics>('/rules/metrics'),
    enabled,
    retry: 1,
  })
}

export function useUpdateRule() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: RuleUpdate }) =>
      api<Rule>(`/rules/${key}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: rulesKey }),
  })
}

export function useRetryRuleEvent() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) =>
      api<{ status: string }>(`/rules/events/${eventId}/retry`, { method: 'POST' }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: metricsKey })
      void client.invalidateQueries({ queryKey: rulesKey })
    },
  })
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: notificationsKey,
    queryFn: () => api<NotificationPage>('/notifications'),
    enabled,
    retry: 1,
  })
}

export function useMarkRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<Notification>(`/notifications/${id}/read`, { method: 'POST' }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: notificationsKey })
      void client.invalidateQueries({ queryKey: ['actions'] })
    },
  })
}
