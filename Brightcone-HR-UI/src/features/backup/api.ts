import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type BackupDocument = components['schemas']['BackupDocument']
export type BackupImport = components['schemas']['BackupImport']

const backupKey = ['backup'] as const

export function useExportBackup() {
  return useMutation({
    mutationFn: () => api<BackupDocument>('/backup'),
  })
}

export function useImportBackup() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: BackupImport) =>
      api<{ imported: number; duplicates_skipped: number }>('/backup/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: backupKey }),
  })
}

export function useCsvExportUrl() {
  const base = import.meta.env.VITE_API_URL ?? '/api'
  return `${base}/records/export.csv`
}
