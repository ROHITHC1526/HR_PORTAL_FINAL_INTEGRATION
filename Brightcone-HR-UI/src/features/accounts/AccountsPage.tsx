import './accounts.css'
import { useAuth } from '@/auth/AuthContext'
import { ApiStatus } from '@/components/ApiStatus'
import { ModuleHeader } from '@/components/ModuleHeader'
import { SectionCard } from '@/components/SectionCard'
import { Alert, Avatar, DataTable, StatTile, StatusPill, type Column } from '@/components/ui'
import { formatDate } from '@/domain/dates'
import { roleLabel, summarizeAccounts } from '@/domain/people'
import { useAccounts, type AdminUser } from './api'

const columns: Column<AdminUser>[] = [
  {
    key: 'name',
    header: 'Person',
    sortable: true,
    render: (person) => (
      <div className="pp-person-cell">
        <Avatar name={person.name} />
        <span>
          <strong>{person.name}</strong>
          <small>{person.email}</small>
        </span>
      </div>
    ),
  },
  { key: 'role', header: 'Role', sortable: true, render: (p) => roleLabel(p.role) },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (p) => <StatusPill status={p.status} />,
  },
  { key: 'created_at', header: 'Created', sortable: true, render: (p) => formatDate(p.created_at) },
]

/** Live login accounts from `GET /api/admin/users`. HR Admin only (permission `users:manage`). */
export function AccountsPage() {
  const { can } = useAuth()
  const allowed = can('users:manage')
  const accounts = useAccounts(allowed)

  if (!allowed) {
    return (
      <div className="pp-page-stack">
        <ModuleHeader title="People directory" subtitle="Your Brightcone People Plus directory" />
        <SectionCard
          title="Directory access"
          subtitle="Employee directory is restricted to HR administrators"
        >
          <div className="pp-empty">
            Your current role does not include access to the connected admin account directory.
          </div>
        </SectionCard>
      </div>
    )
  }

  const rows = accounts.data?.results ?? []
  const summary = summarizeAccounts(rows)

  return (
    <div className="pp-page-stack">
      <ModuleHeader title="Portal accounts" subtitle="Accounts returned by the connected backend" />
      {accounts.isError ? (
        <Alert>Could not load accounts: {accounts.error.message}</Alert>
      ) : (
        <div className="pp-stat-row">
          <StatTile label="Accounts" value={summary.total} />
          <StatTile label="Active" value={summary.active} />
          <StatTile
            label="Locked"
            value={summary.locked}
            hint="Locked after repeated wrong passwords"
          />
          <StatTile label="Disabled" value={summary.disabled} />
        </div>
      )}
      <SectionCard
        title="Portal accounts"
        subtitle="Live login accounts from the admin users endpoint"
        action={<ApiStatus />}
      >
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(person) => person.pid}
          loading={accounts.isLoading}
          searchPlaceholder="Search by name, email or role…"
          emptyTitle="No accounts returned"
          emptyBody="The backend did not return any accounts."
        />
      </SectionCard>
    </div>
  )
}
