import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type Record = components['schemas']['Record']
export type RecordPage = components['schemas']['RecordPage']
export type RecordInput = { data: any; source_id?: string | null; reason?: string; [key: string]: any }
export type RecordUpdateInput = { data?: any; changes?: any; source_id?: string | null; reason?: string; [key: string]: any }
export type HistoryEntry = components['schemas']['HistoryEntry']
export type RecordTypeSchema = components['schemas']['RecordTypeSchema']
export type RecordCatalog = components['schemas']['RecordCatalog']

const recordsKey = (type: string) => ['records', type] as const
const catalogKey = ['records', 'catalog'] as const
const historyKey = (type: string, id: string) =>
  ['records', type, id, 'history'] as const

export function useRecordCatalog(enabled: boolean) {
  return useQuery({
    queryKey: catalogKey,
    queryFn: () => api<RecordCatalog>('/record-types'),
    enabled,
    retry: 1,
  })
}

export function useRecords(type: string, enabled: boolean) {
  return useQuery({
    queryKey: recordsKey(type),
    queryFn: () => api<RecordPage>(`/records/${type}`),
    enabled: enabled && !!type,
    retry: 1,
  })
}

export function useRecordHistory(
  type: string,
  id: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: historyKey(type, id),
    queryFn: () => api<HistoryEntry[]>(`/records/${type}/${id}/history`),
    enabled: enabled && !!id,
    retry: 1,
  })
}

export function useCreateRecord(type: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: RecordInput) =>
      api<Record>(`/records/${type}`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: recordsKey(type) }),
  })
}

export function useUpdateRecord(type: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordUpdateInput }) =>
      api<Record>(`/records/${type}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: recordsKey(type) }),
  })
}

export function useArchiveRecord(type: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/records/${type}/${id}/archive`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: recordsKey(type) }),
  })
}

export function useRestoreRecord(type: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/records/${type}/${id}/restore`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: recordsKey(type) }),
  })
}
