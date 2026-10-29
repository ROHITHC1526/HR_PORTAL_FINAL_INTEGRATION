import React, { useState } from 'react'
import { useEmployees, useUpdateEmployee, type Employee } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

export const ExitPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const updateEmployee = useUpdateEmployee()

  const [tab, setTab] = useState<'active' | 'exited'>('active')

  const empList = employees.data ?? []
  const exitedEmps = empList.filter((e) => e.status === 'resigned' || e.status === 'terminated')
  const activeEmps = empList.filter((e) => e.status !== 'resigned' && e.status !== 'terminated')

  const handleInitiateExit = async (emp: Employee) => {
    await updateEmployee.mutateAsync({
      id: emp.id,
      payload: {
        reason: 'voluntary_resignation',
        changes: { status: 'resigned', end_date: new Date().toISOString().slice(0, 10) },
      },
    })
  }

  if (employees.isLoading) {
    return <div className="loader">Loading employee data…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People</div>
          <h1>Exits & Offboarding</h1>
          <p>Employee separation, resignation tracking, and exit checklists.</p>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Active</div>
          <div className="v">{activeEmps.length}</div>
          <div className="d">Current employees</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="logout" size={16} /></i> Exited</div>
          <div className="v">{exitedEmps.length}</div>
          <div className="d">Resigned / terminated</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> Attrition</div>
          <div className="v">
            {empList.length > 0
              ? `${((exitedEmps.length / empList.length) * 100).toFixed(1)}%`
              : '0%'}
          </div>
          <div className="d">Overall rate</div>
        </div>
      </div>

      <div className="tabs mb mt">
        <button className={tab === 'active' ? 'on' : ''} onClick={() => setTab('active')}>
          Active Employees ({activeEmps.length})
        </button>
        <button className={tab === 'exited' ? 'on' : ''} onClick={() => setTab('exited')}>
          Exited ({exitedEmps.length})
        </button>
      </div>

      {tab === 'active' && (
        <div className="card mt">
          <h3>Initiate Exit</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Select an employee to begin the offboarding process.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeEmps.slice(0, 20).map((emp) => {
                  const name = `${emp.first_name} ${emp.last_name}`
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="who">
                          <div className="av" style={{ background: avatarColor(name) }}>
                            {initials(name)}
                          </div>
                          <div>
                            <b>{name}</b>
                            <span>{emp.employee_number}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>{emp.start_date}</td>
                      <td>
                        <button
                          className="btn sm"
                          onClick={() => handleInitiateExit(emp)}
                          disabled={updateEmployee.isPending}
                        >
                          Initiate Exit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'exited' && (
        <div className="card mt">
          {exitedEmps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="check" size={32} />
              <h3 style={{ marginTop: 12 }}>No exits recorded</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Employees who have resigned or been terminated will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {exitedEmps.map((emp) => {
                    const name = `${emp.first_name} ${emp.last_name}`
                    return (
                      <tr key={emp.id}>
                        <td>
                          <div className="who">
                            <div className="av" style={{ background: avatarColor(name) }}>
                              {initials(name)}
                            </div>
                            <b>{name}</b>
                          </div>
                        </td>
                        <td>
                          <span className="pill p-bad">{emp.status}</span>
                        </td>
                        <td>{emp.end_date ?? '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
