import React, { useState } from 'react'
import { useEmployees, useReferences } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const PayViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)

  const [tab, setTab] = useState<'overview' | 'register'>('overview')

  const empList = employees.data ?? []
  const deptList = departments.data ?? []

  if (employees.isLoading) {
    return <div className="loader">Loading payroll data…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Payroll & Tax</div>
          <h1>Payroll Management</h1>
          <p>Payroll processing, statutory deductions, and salary registers.</p>
        </div>
      </div>

      <div className="tabs mb">
        <button className={tab === 'overview' ? 'on' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>
          Employee Register ({empList.length})
        </button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid g3 mt">
            <div className="card stat">
              <div className="k"><i><Icon name="users" size={16} /></i> Active Employees</div>
              <div className="v">{empList.filter((e) => e.status === 'active').length}</div>
              <div className="d">Eligible for payroll</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="org" size={16} /></i> Departments</div>
              <div className="v">{deptList.length}</div>
              <div className="d">With active employees</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="pay" size={16} /></i> Payroll API</div>
              <div className="v">Pending</div>
              <div className="d">Payroll endpoints not yet built</div>
            </div>
          </div>

          <div className="card mt">
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="pay" size={32} />
              <h3 style={{ marginTop: 12 }}>Payroll processing coming soon</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                The payroll run stepper, salary calculations, and TDS processing
                require dedicated backend APIs. Employee data is ready from the People API.
              </p>
            </div>
          </div>
        </>
      )}

      {tab === 'register' && (
        <div className="card mt">
          <h3>Employee Register</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Employee records from the People API. Salary details require the payroll API.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Number</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {empList.map((emp) => {
                  const name = `${emp.first_name} ${emp.last_name}`
                  const dept = deptList.find((d) => d.id === emp.department_id)
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
                      <td className="muted">{emp.employee_number}</td>
                      <td>{dept?.label ?? 'Unassigned'}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {emp.employment_type.replace('_', ' ')}
                      </td>
                      <td>
                        <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {empList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                      No employees yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
