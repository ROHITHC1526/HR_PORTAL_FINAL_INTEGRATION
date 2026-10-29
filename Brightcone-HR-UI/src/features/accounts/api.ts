import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { pageQuery, type PageOf } from '@/api/pagination'
import type { components } from '@/api/schema'

/** Backend ticket P1-11 (account administration). Typed from `openapi.json`. */
export type AdminUser = components['schemas']['AdminUserResponse']

const accountsKey = ['admin-users'] as const

export const fetchAccounts = (page = 1, pageSize = 100) =>
  api<PageOf<AdminUser>>(`/admin/users${pageQuery({ page, pageSize })}`)

/** Only asks the server when the signed-in user may manage accounts. */
export function useAccounts(enabled: boolean) {
  return useQuery({
    queryKey: accountsKey,
    queryFn: () => fetchAccounts(),
    enabled,
    retry: 1,
  })
}
