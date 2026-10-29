import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'

export type HrDocument = {
  id: string
  employee_id: string
  template_key: string
  title: string
  status: 'draft' | 'issued' | 'revoked'
  issued_date: string | null
  data: Record<string, unknown>
  archived: boolean
}

export type LetterTemplate = {
  id: string
  key: string
  name: string
  description: string
  fields: string[]
  body_template: string
}

const docsKey = ['documents', 'all'] as const
const templatesKey = ['documents', 'templates'] as const

export function useHrDocuments(enabled: boolean) {
  return useQuery({
    queryKey: docsKey,
    queryFn: () => api<{ items: HrDocument[] }>('/records/hr_document'),
    enabled,
    retry: 1,
  })
}

export function useLetterTemplates(enabled: boolean) {
  return useQuery({
    queryKey: templatesKey,
    queryFn: () => api<{ items: LetterTemplate[] }>('/records/letter_template'),
    enabled,
    retry: 1,
  })
}

export function useCreateHrDocument() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { data: Record<string, unknown> }) =>
      api<HrDocument>('/records/hr_document', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: docsKey }),
  })
}

export function useCreateLetterTemplate() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { data: Record<string, unknown> }) =>
      api<LetterTemplate>('/records/letter_template', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: templatesKey }),
  })
}

export function useArchiveDocument() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/records/hr_document/${id}/archive`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: docsKey }),
  })
}
