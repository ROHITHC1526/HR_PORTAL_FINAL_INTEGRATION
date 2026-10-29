import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type ReferenceItem = { id: string; name?: string; label: string; [k: string]: any }
export type Employee = any
export type EmployeeInput = any
export type EmployeeMutationInput = any
export type CsvDryRun = any

const employeeKey = ['people', 'employees'] as const
const referenceKey = (kind: string) => ['people', kind] as const

export function useEmployees(enabled: boolean) {
  return useQuery({
    queryKey: employeeKey,
    queryFn: async () => {
      try {
        const res = await api<Employee[]>('/people/employees');
        if (res && res.length > 0) return res;
      } catch {
        // fallback
      }
      const { getUnifiedEmployees } = await import('@/services/employeeData');
      const unified = getUnifiedEmployees();
      return unified.map((u) => {
        const parts = u.name.trim().split(' ');
        const first = parts[0] || 'Employee';
        const last = parts.slice(1).join(' ') || '';
        return {
          id: u.id,
          first_name: first,
          last_name: last,
          work_email: u.email,
          title: u.role,
          department_id: u.dept,
          status: 'active',
        };
      });
    },
    enabled,
    retry: 1,
  })
}

export function useReferences(kind: 'departments' | 'grades' | 'locations', enabled: boolean) {
  return useQuery({
    queryKey: referenceKey(kind),
    queryFn: async () => {
      try {
        const res = await api<ReferenceItem[]>(`/people/${kind}`);
        if (res && res.length > 0) return res;
      } catch {
        // fallback
      }
      if (kind === 'departments') {
        return [
          { id: 'eng', name: 'Engineering', label: 'Engineering' },
          { id: 'design', name: 'Design', label: 'Design' },
          { id: 'product', name: 'Product', label: 'Product' },
          { id: 'hr', name: 'People Ops', label: 'People Ops' },
          { id: 'sales', name: 'Sales & Growth', label: 'Sales & Growth' },
          { id: 'finance', name: 'Finance & Legal', label: 'Finance & Legal' },
        ];
      }
      if (kind === 'locations') {
        return [
          { id: 'hyd', name: 'Hyderabad HQ', label: 'Hyderabad HQ' },
          { id: 'blr', name: 'Bengaluru Tech Hub', label: 'Bengaluru Tech Hub' },
          { id: 'remote', name: 'Remote Global', label: 'Remote Global' },
        ];
      }
      return [
        { id: 'l1', name: 'L1 - Associate', label: 'L1 - Associate' },
        { id: 'l2', name: 'L2 - Senior', label: 'L2 - Senior' },
        { id: 'l3', name: 'L3 - Lead / Principal', label: 'L3 - Lead / Principal' },
      ];
    },
    enabled,
    retry: 1,
  })
}

export function useCreateEmployee() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: EmployeeInput) =>
      api<Employee>('/people/employees', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: employeeKey }),
  })
}

export function useUpdateEmployee() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeMutationInput }) =>
      api<Employee>(`/people/employees/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => client.invalidateQueries({ queryKey: employeeKey }),
  })
}

export function useEmployeeLifecycle(action: 'archive' | 'restore') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api<void>(`/people/employees/${id}/${action}`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: employeeKey }),
  })
}

export function useCreateReference(kind: 'departments' | 'grades' | 'locations') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: Record<string, string | number | null>) =>
      api<ReferenceItem>(`/people/${kind}`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: referenceKey(kind) }),
  })
}
