import React, { useState } from 'react'
import { useEmployees, useReferences, type Employee, type ReferenceItem } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

export const CompanyDirectoryPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [locFilter, setLocFilter] = useState('All')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const empList: Employee[] = employees.data ?? []
  const deptList: ReferenceItem[] = departments.data ?? []
  const locList: ReferenceItem[] = locations.data ?? []

  const filtered = empList.filter((e) => {
    const term = search.toLowerCase()
    const matchesSearch = !term
      || `${e.first_name} ${e.last_name}`.toLowerCase().includes(term)
      || e.work_email.toLowerCase().includes(term)
      || e.employee_number.toLowerCase().includes(term)
    const matchesDept = deptFilter === 'All' || e.department_id === deptFilter
    const matchesLoc = locFilter === 'All' || e.location_id === locFilter
    return matchesSearch && matchesDept && matchesLoc
  })

  const getDeptLabel = (id?: string | null) => deptList.find((d) => d.id === id)?.label ?? 'Unassigned'
  const getLocLabel = (id?: string | null) => locList.find((l) => l.id === id)?.label ?? 'Unknown'

  if (employees.isLoading) {
    return <div className="loader">Loading directory…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Company</div>
          <h1>People Directory</h1>
          <p>Find anyone in the organization — browse by name, department, or location.</p>
        </div>
        <div className="actions">
          <button className={`btn ${view === 'grid' ? 'primary' : ''}`} onClick={() => setView('grid')}>
            <Icon name="grid" size={16} />
          </button>
          <button className={`btn ${view === 'list' ? 'primary' : ''}`} onClick={() => setView('list')}>
            <Icon name="menu" size={16} />
          </button>
        </div>
      </div>

      <div className="toolbar mt">
        <div className="search">
          <Icon name="search" size={16} />
          <input
            className="input"
            type="search"
            placeholder="Search by name, email, or employee number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="All">All Departments</option>
          {deptList.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <select className="input" value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
          <option value="All">All Locations</option>
          {locList.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>

      <p className="muted mt">{filtered.length} of {empList.length} people</p>

      {view === 'grid' ? (
        <div className="grid g3 mt">
          {filtered.slice(0, 30).map((emp) => {
            const name = `${emp.first_name} ${emp.last_name}`
            return (
              <div key={emp.id} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div className="av lg" style={{ background: avatarColor(name), margin: '0 auto' }}>
                  {initials(name)}
                </div>
                <h4 style={{ marginTop: 10 }}>{name}</h4>
                <p className="muted" style={{ fontSize: 13 }}>{emp.work_email}</p>
                <div style={{ marginTop: 8 }}>
                  <span className="pill p-ok" style={{ fontSize: 11 }}>{getDeptLabel(emp.department_id)}</span>
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>{getLocLabel(emp.location_id)}</p>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40 }}>
              <Icon name="search" size={28} />
              <p className="muted" style={{ marginTop: 8 }}>No people match your filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card mt">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((emp) => {
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
                      <td className="muted">{emp.work_email}</td>
                      <td>{getDeptLabel(emp.department_id)}</td>
                      <td>{getLocLabel(emp.location_id)}</td>
                      <td>
                        <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
