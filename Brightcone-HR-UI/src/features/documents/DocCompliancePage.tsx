import React from 'react'
import { useRecordCatalog, useRecords } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const DocCompliancePage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasDocType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'hr_document') ?? false
  const hasPolicyType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'policy') ?? false

  const docs = useRecords('hr_document', allowed && hasDocType)
  const policies = useRecords('policy', allowed && hasPolicyType)

  const empList = employees.data ?? []
  const docItems = (docs.data as { items?: any[] })?.items ?? []
  const policyItems = (policies.data as { items?: any[] })?.items ?? []

  const activePolicies = policyItems.filter((r: any) => !r.archived)
  const issuedDocs = docItems.filter((r: any) => r.data?.status === 'issued')
  const draftDocs = docItems.filter((r: any) => r.data?.status === 'draft' && !r.archived)

  const empsWithDocs = new Set(docItems.map((d: any) => d.data?.employee_id).filter(Boolean))
  const empsWithoutDocs = empList.filter((e) => !empsWithDocs.has(e.id))

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Documents</div>
          <h1>Document Compliance</h1>
          <p>Track document completion rates and policy acknowledgements.</p>
        </div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <h3>Document Status</h3>
          <div className="grid g3" style={{ marginTop: 14 }}>
            <div className="card stat">
              <div className="k">Total Docs</div>
              <div className="v">{docItems.length}</div>
            </div>
            <div className="card stat">
              <div className="k">Issued</div>
              <div className="v" style={{ color: 'var(--ok, #12A58E)' }}>{issuedDocs.length}</div>
            </div>
            <div className="card stat">
              <div className="k">Drafts</div>
              <div className="v" style={{ color: 'var(--warn, #E07A1D)' }}>{draftDocs.length}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Policy Coverage</h3>
          <div className="grid g2" style={{ marginTop: 14 }}>
            <div className="card stat">
              <div className="k">Active Policies</div>
              <div className="v">{activePolicies.length}</div>
            </div>
            <div className="card stat">
              <div className="k">Total Policies</div>
              <div className="v">{policyItems.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt">
        <h3>Employees Missing Documents</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Employees with no HR documents on file.
        </p>
        {(!hasDocType && !hasPolicyType) ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Icon name="shield" size={28} />
            <p className="muted" style={{ marginTop: 8 }}>
              Create "hr_document" and "policy" record types to track document compliance.
            </p>
          </div>
        ) : empsWithoutDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Icon name="check" size={28} />
            <p className="muted" style={{ marginTop: 8 }}>
              {empList.length === 0
                ? 'No employees in the system yet.'
                : 'All employees have at least one document on file.'}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Number</th>
                  <th>Status</th>
                  <th>Start Date</th>
                </tr>
              </thead>
              <tbody>
                {empsWithoutDocs.slice(0, 15).map((emp) => (
                  <tr key={emp.id}>
                    <td><b>{emp.first_name} {emp.last_name}</b></td>
                    <td className="muted">{emp.employee_number}</td>
                    <td>
                      <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>{emp.start_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activePolicies.length > 0 && (
        <div className="card mt">
          <h3>Active Policies</h3>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Effective</th>
                </tr>
              </thead>
              <tbody>
                {activePolicies.map((r: any) => (
                  <tr key={r.id}>
                    <td><b>{r.data?.title}</b></td>
                    <td style={{ textTransform: 'capitalize' }}>{r.data?.category}</td>
                    <td>v{r.data?.version}</td>
                    <td>{r.data?.effective_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
