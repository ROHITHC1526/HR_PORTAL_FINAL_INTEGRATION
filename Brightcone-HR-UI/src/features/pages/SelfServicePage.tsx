import React from 'react'
import { useEmployees, useReferences } from '@/features/people/api'
import { useRecordCatalog, useRecords } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { usePeoplePlus } from '@/people-plus/people-plus-context'
import { Icon } from '@/people-plus/Icon'

export const SelfServicePage: React.FC = () => {
  const { can, user } = useAuth()
  const { setActiveApp, setActiveView, openModal } = usePeoplePlus()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const catalog = useRecordCatalog(allowed)

  const hasDocType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'hr_document') ?? false

  const docs = useRecords('hr_document', allowed && hasDocType)

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const docItems = (docs.data as { items?: any[] })?.items ?? []

  const myEmp = empList.find((e) => e.work_email === user?.email)
  const myDocs = docItems.filter((d: any) => d.data?.employee_id === myEmp?.id)
  const myDept = deptList.find((d) => d.id === myEmp?.department_id)

  const quickActions = [
    { label: 'Apply for Leave', icon: 'leave', action: () => openModal('applyLeave') },
    { label: 'Claim Expense', icon: 'receipt', action: () => openModal('claimExpense') },
    { label: 'HR Helpdesk', icon: 'chat', action: () => openModal('raiseTicket') },
    { label: 'My Documents', icon: 'doc', action: () => { setActiveApp('people'); setActiveView('myDocs') } },
    { label: 'My Performance', icon: 'chart', action: () => { setActiveApp('people'); setActiveView('myPerformance') } },
    { label: 'People Directory', icon: 'users', action: () => { setActiveApp('connect'); setActiveView('directory') } },
  ]

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Self Service</div>
          <h1>Employee Self-Service Portal</h1>
          <p>Quick access to your HR information, actions, and documents.</p>
        </div>
      </div>

      {myEmp && (
        <div className="card mt">
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div>
              <h3>{myEmp.first_name} {myEmp.last_name}</h3>
              <p className="muted">{myEmp.employee_number} · {myEmp.work_email}</p>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span className={`pill ${myEmp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                  {myEmp.status}
                </span>
                <span className="pill">{myDept?.label ?? 'No department'}</span>
                <span className="pill" style={{ textTransform: 'capitalize' }}>
                  {myEmp.employment_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="mt" style={{ marginBottom: 8 }}>Quick Actions</h3>
      <div className="grid g3">
        {quickActions.map((qa) => (
          <div
            key={qa.label}
            className="card"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}
            onClick={qa.action}
          >
            <Icon name={qa.icon} size={22} />
            <b>{qa.label}</b>
          </div>
        ))}
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <h3>My Documents</h3>
          {myDocs.length === 0 ? (
            <p className="muted" style={{ padding: '16px 0' }}>
              {!hasDocType
                ? 'Document tracking is not configured yet.'
                : 'No documents on file for your account.'}
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 10 }}>
              <table>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myDocs.slice(0, 5).map((d: any) => (
                    <tr key={d.id}>
                      <td><b>{d.data?.title ?? '—'}</b></td>
                      <td>{d.data?.issued_date}</td>
                      <td>
                        <span className={`pill ${d.data?.status === 'issued' ? 'p-ok' : 'p-warn'}`}>
                          {d.data?.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>At a Glance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Total Employees</span>
              <b>{empList.length}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Departments</span>
              <b>{deptList.length}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">My Documents</span>
              <b>{myDocs.length}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="muted">Member Since</span>
              <b>{myEmp?.start_date ?? '—'}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
