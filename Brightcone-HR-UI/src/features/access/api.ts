import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type AdminUser = components['schemas']['AdminUserResponse']
type AdminUserPage = { results: AdminUser[]; pagination: { page: number; page_size: number; total_items: number; total_pages: number } }
type TemporaryPassword = { user: AdminUser; temporary_password: string }

const usersKey = ['admin', 'users'] as const

export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: usersKey,
    queryFn: () => api<AdminUserPage>('/admin/users?page=1&page_size=100'),
    enabled,
    retry: 1,
  })
}

export function useCreateUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: components['schemas']['CreateUserParams']) =>
      api<TemporaryPassword>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: usersKey }),
  })
}

export function useDisableUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (pid: string) =>
      api<void>(`/admin/users/${pid}/disable`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: usersKey }),
  })
}

export function useUnlockUser() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (pid: string) =>
      api<void>(`/admin/users/${pid}/unlock`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: usersKey }),
  })
}

export function useResetPassword() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (pid: string) =>
      api<TemporaryPassword>(`/admin/users/${pid}/reset-password`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: usersKey }),
  })
}

export function useSetRole() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ pid, role }: { pid: string; role: string }) =>
      api<void>(`/admin/users/${pid}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: usersKey }),
  })
}
