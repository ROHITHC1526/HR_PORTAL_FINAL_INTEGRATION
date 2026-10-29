import React, { useState } from 'react'
import { useEmployees, useReferences, type Employee, type ReferenceItem } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { usePeoplePlus } from '../people-plus-context'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const PeopleViews: React.FC = () => {
  const { openDrawer, openModal } = usePeoplePlus()
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')

  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)

  const [tab, setTab] = useState<'directory' | 'org'>('directory')
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  const empList: Employee[] = employees.data ?? []
  const deptList: ReferenceItem[] = departments.data ?? []

  const filteredEmployees = empList.filter((e) => {
    const term = search.toLowerCase()
    const matchesSearch = !term
      || `${e.first_name} ${e.last_name}`.toLowerCase().includes(term)
      || e.employee_number.toLowerCase().includes(term)
      || e.work_email.toLowerCase().includes(term)
    const matchesDept = deptFilter === 'All' || e.department_id === deptFilter
    return matchesSearch && matchesDept
  })

  if (employees.isLoading) {
    return <div className="loader">Loading employee records…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People App</div>
          <h1>People & Organization</h1>
          <p>Employee records and organizational hierarchy from the live API.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => openModal('addEmp')}>
            <Icon name="plus" size={16} /> Add employee
          </button>
        </div>
      </div>

      <div className="tabs mb">
        <button className={tab === 'directory' ? 'on' : ''} onClick={() => setTab('directory')}>
          Directory ({empList.length})
        </button>
        <button className={tab === 'org' ? 'on' : ''} onClick={() => setTab('org')}>
          Org structure
        </button>
      </div>

      {tab === 'directory' && (
        <div className="card mt">
          <div className="toolbar">
            <div className="search">
              <Icon name="search" size={16} />
              <input
                className="input"
                type="search"
                placeholder="Search employees by name, number or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {deptList.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Number</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Start date</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const name = `${emp.first_name} ${emp.last_name}`
                  const dept = deptList.find((d) => d.id === emp.department_id)
                  return (
                    <tr
                      key={emp.id}
                      className="click"
                      onClick={() => openDrawer('empProfile', { emp })}
                    >
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
                      <td><span className="muted">{emp.employee_number}</span></td>
                      <td>{dept?.label ?? 'Unassigned'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{emp.employment_type.replace('_', ' ')}</td>
                      <td>
                        <span className={`pill ${emp.status === 'active' ? 'p-ok' : emp.status === 'probation' ? 'p-warn' : 'p-bad'}`}>
                          {emp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{emp.start_date}</td>
                    </tr>
                  )
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                      {empList.length === 0 ? 'No employees yet — add one to get started.' : 'No matches.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'org' && (
        <div className="card mt">
          <h3>Department Hierarchy</h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Departments and their assigned employees from the live People API.
          </p>
          <OrgTree departments={deptList} employees={empList} />
        </div>
      )}
    </div>
  )
}

function OrgTree({ departments, employees }: {
  departments: ReferenceItem[]
  employees: Employee[]
}) {
  const roots = departments.filter((d) => !d.parent_id)

  if (departments.length === 0) {
    return <p className="muted">No departments configured. Set them up in Organization Setup.</p>
  }

  return (
    <div className="org">
      {roots.map((dept) => (
        <DeptNode key={dept.id} dept={dept} departments={departments} employees={employees} />
      ))}
    </div>
  )
}

function DeptNode({ dept, departments, employees }: {
  dept: ReferenceItem
  departments: ReferenceItem[]
  employees: Employee[]
}) {
  const children = departments.filter((d) => d.parent_id === dept.id)
  const members = employees.filter((e) => e.department_id === dept.id)

  return (
    <div style={{ marginBottom: 12 }}>
      <div className="node">
        <div className="av" style={{ background: avatarColor(dept.label) }}>
          {initials(dept.label)}
        </div>
        <div>
          <b>{dept.label}</b>
          <span>{dept.code} · {members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {(children.length > 0 || members.length > 0) && (
        <ul>
          {children.map((child) => (
            <li key={child.id}>
              <DeptNode dept={child} departments={departments} employees={employees} />
            </li>
          ))}
          {members.map((emp) => {
            const name = `${emp.first_name} ${emp.last_name}`
            return (
              <li key={emp.id}>
                <div className="node">
                  <div className="av" style={{ background: avatarColor(name) }}>
                    {initials(name)}
                  </div>
                  <div>
                    <b>{name}</b>
                    <span>{emp.employment_type.replace('_', ' ')} · {emp.status}</span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
