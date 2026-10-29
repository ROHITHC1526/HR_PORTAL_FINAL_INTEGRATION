import React, { useState } from 'react'
import { useEmployees, useReferences, type Employee } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

export const ProbationPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)

  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const empList = employees.data ?? []
  const deptList = departments.data ?? []

  const probationEmps = empList.filter((e) => e.status === 'probation')
  const confirmedEmps = empList.filter((e) => e.status === 'active')

  const getDeptLabel = (id?: string | null) =>
    deptList.find((d) => d.id === id)?.label ?? 'Unassigned'

  const getDaysInProbation = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (employees.isLoading) {
    return <div className="loader">Loading probation data…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People</div>
          <h1>Probation Tracker</h1>
          <p>Monitor probationary employees and confirmation timelines.</p>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> On Probation</div>
          <div className="v">{probationEmps.length}</div>
          <div className="d">Awaiting confirmation</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Confirmed</div>
          <div className="v">{confirmedEmps.length}</div>
          <div className="d">Full employees</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Total</div>
          <div className="v">{empList.length}</div>
          <div className="d">All statuses</div>
        </div>
      </div>

      <div className="tabs mb mt">
        <button className={tab === 'active' ? 'on' : ''} onClick={() => setTab('active')}>
          On Probation ({probationEmps.length})
        </button>
        <button className={tab === 'completed' ? 'on' : ''} onClick={() => setTab('completed')}>
          Recently Confirmed ({confirmedEmps.length})
        </button>
      </div>

      {tab === 'active' && (
        <div className="card mt">
          {probationEmps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="check" size={32} />
              <h3 style={{ marginTop: 12 }}>No probationary employees</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                All current employees have been confirmed.
              </p>
            </div>
          ) : (
            <ProbationTable
              employees={probationEmps}
              getDeptLabel={getDeptLabel}
              getDaysInProbation={getDaysInProbation}
              showDays
            />
          )}
        </div>
      )}

      {tab === 'completed' && (
        <div className="card mt">
          {confirmedEmps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="users" size={32} />
              <h3 style={{ marginTop: 12 }}>No confirmed employees</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Employees awaiting confirmation will appear on the probation tab.
              </p>
            </div>
          ) : (
            <ProbationTable
              employees={confirmedEmps}
              getDeptLabel={getDeptLabel}
              getDaysInProbation={getDaysInProbation}
              showDays={false}
            />
          )}
        </div>
      )}
    </div>
  )
}

function ProbationTable({
  employees,
  getDeptLabel,
  getDaysInProbation,
  showDays,
}: {
  employees: Employee[]
  getDeptLabel: (id?: string | null) => string
  getDaysInProbation: (startDate: string) => number
  showDays: boolean
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Start Date</th>
            {showDays && <th>Days in Probation</th>}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const name = `${emp.first_name} ${emp.last_name}`
            const days = getDaysInProbation(emp.start_date)
            const overdue = days > 180
            return (
              <tr key={emp.id}>
                <td>
                  <div className="who">
                    <div className="av" style={{ background: avatarColor(name) }}>
                      {initials(name)}
                    </div>
                    <div>
                      <b>{name}</b>
                      <span>{emp.work_email}</span>
                    </div>
                  </div>
                </td>
                <td>{getDeptLabel(emp.department_id)}</td>
                <td>{emp.start_date}</td>
                {showDays && (
                  <td>
                    <span className={`pill ${overdue ? 'p-bad' : 'p-warn'}`}>
                      {days} days {overdue ? '(overdue)' : ''}
                    </span>
                  </td>
                )}
                <td>
                  <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                    {emp.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
