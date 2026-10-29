import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, DataTable, StatusPill, type Column } from '@/components/ui'
import { formatDateTime } from '@/domain/dates'
import { auditActionTone } from '@/domain/status'

interface AuditItem {
  id: number
  at: string
  actor_email?: string | null
  action: string
  target_type?: string | null
  target_id?: string | null
  summary?: string | null
  ip?: string | null
}

interface AuditPageResponse {
  items: AuditItem[]
  next_before_id?: number | null
}

export function AuditLogPage() {
  const { data, isLoading, error } = useQuery<AuditPageResponse>({
    queryKey: ['audit-logs'],
    queryFn: () => api<AuditPageResponse>('/audit'),
  })

  const columns: Column<AuditItem>[] = [
    {
      key: 'at',
      header: 'Timestamp',
      sortable: true,
      render: (r) => (
        <span style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{formatDateTime(r.at)}</span>
      ),
    },
    {
      key: 'actor_email',
      header: 'Actor',
      sortable: true,
      render: (r) => <strong>{r.actor_email ?? 'System'}</strong>,
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (r) => (
        <StatusPill status={r.action} tone={auditActionTone(r.action)} label={r.action} />
      ),
    },
    {
      key: 'target',
      header: 'Target',
      render: (r) => (
        <span>
          {r.target_type ? `${r.target_type}${r.target_id ? ` #${r.target_id}` : ''}` : '—'}
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      render: (r) => <span style={{ color: 'var(--muted)' }}>{r.summary ?? '—'}</span>,
    },
    {
      key: 'ip',
      header: 'IP Address',
      render: (r) => <code style={{ fontSize: '0.75rem' }}>{r.ip ?? '—'}</code>,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ margin: '0 0 6px 0' }}>Audit Log</h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Immutable record of security and administrative actions across the organization.
        </p>
      </div>

      <Card>
        {error ? (
          <p style={{ color: 'var(--bad)' }}>
            Failed to load audit trail: {(error as Error).message}
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            keyExtractor={(item) => item.id}
            searchable
            searchPlaceholder="Filter by action, actor, or summary…"
            loading={isLoading}
            emptyTitle="No audit records yet"
            emptyBody="Security events and administrative actions will be recorded here automatically."
          />
        )}
      </Card>
    </div>
  )
}
