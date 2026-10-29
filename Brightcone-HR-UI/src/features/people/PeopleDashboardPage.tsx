import React from 'react'
import { useEmployees, useReferences, type Employee } from './api'
import { useAuth } from '@/auth/useAuth'
import { usePeoplePlus } from '@/people-plus/people-plus-context'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials, formatDate } from '@/people-plus/helpers'

function StatusBreakdown({ employees }: { employees: Employee[] }) {
  const groups: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'p-ok' },
    probation: { label: 'Probation', cls: 'p-warn' },
    resigned: { label: 'Resigned', cls: 'p-bad' },
    terminated: { label: 'Terminated', cls: 'p-bad' },
    on_leave: { label: 'On Leave', cls: 'p-info' },
  }
  const counts = new Map<string, number>()
  employees.forEach((e) => counts.set(e.status, (counts.get(e.status) ?? 0) + 1))

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
      {[...counts.entries()].map(([status, count]) => {
        const g = groups[status] ?? { label: status.replace('_', ' '), cls: '' }
        return (
          <div key={status} className="pill-lg" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className={`pill ${g.cls}`}>{g.label}</span>
            <b>{count}</b>
          </div>
        )
      })}
    </div>
  )
}

function DeptBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="r">
      <span>{label}</span>
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
      <em>{count}</em>
    </div>
  )
}

export const PeopleDashboardPage: React.FC = () => {
  const { can } = useAuth()
  const { setActiveView, openModal } = usePeoplePlus()
  const allowed = can('people:manage') || can('users:manage')

  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const locList = locations.data ?? []

  const active = empList.filter((e) => e.status === 'active')
  const probation = empList.filter((e) => e.status === 'probation')
  const exited = empList.filter((e) => e.status === 'resigned' || e.status === 'terminated')
  const recentHires = [...empList]
    .sort((a, b) => b.start_date.localeCompare(a.start_date))
    .slice(0, 5)

  const attritionRate = empList.length > 0
    ? ((exited.length / empList.length) * 100).toFixed(1)
    : '0.0'

  if (employees.isLoading) {
    return <div className="loader">Loading people dashboard…</div>
  }

  return (
    <div className="view">
      <div className="head band">
        <div>
          <div className="eyebrow">People</div>
          <h1>People Dashboard</h1>
          <p>
            Workforce overview across {deptList.length} department{deptList.length !== 1 ? 's' : ''} and{' '}
            {locList.length} location{locList.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setActiveView('employees')}>
            <Icon name="users" size={16} /> View all
          </button>
          <button className="btn primary" onClick={() => openModal('addEmp')}>
            <Icon name="plus" size={16} /> Add employee
          </button>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card stat click" onClick={() => setActiveView('employees')}>
          <div className="k"><i><Icon name="users" size={16} /></i> Total Headcount</div>
          <div className="v">{empList.length}</div>
          <div className="d">All employees</div>
        </div>
        <div className="card stat click" onClick={() => setActiveView('employees')}>
          <div className="k"><i><Icon name="check" size={16} /></i> Active</div>
          <div className="v">{active.length}</div>
          <div className="d up">Confirmed employees</div>
        </div>
        <div className="card stat click" onClick={() => setActiveView('probation')}>
          <div className="k"><i><Icon name="clock" size={16} /></i> On Probation</div>
          <div className="v">{probation.length}</div>
          <div className="d">{probation.length > 0 ? 'Awaiting confirmation' : 'All confirmed'}</div>
        </div>
        <div className="card stat click" onClick={() => setActiveView('exits')}>
          <div className="k"><i><Icon name="logout" size={16} /></i> Attrition</div>
          <div className="v">{attritionRate}%</div>
          <div className="d">{exited.length} exit{exited.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <h3>Department Distribution</h3>
          <div className="dept-bars wide" style={{ marginTop: 14 }}>
            {deptList.map((d) => {
              const count = empList.filter((e) => e.department_id === d.id).length
              return <DeptBar key={d.id} label={d.label || d.name || ''} count={count} total={empList.length} />
            })}
            {deptList.length === 0 && (
              <p className="muted">No departments configured. Set them up in Org Structure.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Status Breakdown</h3>
          <StatusBreakdown employees={empList} />
          <div style={{ marginTop: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Locations</h4>
            {locList.length === 0 ? (
              <p className="muted">No locations configured yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {locList.map((loc) => {
                  const count = empList.filter((e) => e.location_id === loc.id).length
                  return (
                    <span key={loc.id} className="pill p-info">
                      {loc.label}: {count}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Hires</h3>
            <button className="btn sm" onClick={() => setActiveView('onboarding')}>
              View onboarding
            </button>
          </div>
          <div className="list" style={{ marginTop: 10 }}>
            {recentHires.map((emp) => {
              const name = `${emp.first_name} ${emp.last_name}`
              return (
                <div key={emp.id} className="row">
                  <div className="av" style={{ background: avatarColor(name) }}>{initials(name)}</div>
                  <div className="grow">
                    <b>{name}</b>
                    <div className="sub">{emp.work_email}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                      {emp.status.replace('_', ' ')}
                    </span>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {formatDate(emp.start_date)}
                    </div>
                  </div>
                </div>
              )
            })}
            {recentHires.length === 0 && (
              <div className="empty">No employees yet — add one to get started.</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            <button className="btn" onClick={() => setActiveView('employees')}>
              <Icon name="users" size={16} /> Employees
            </button>
            <button className="btn" onClick={() => setActiveView('orgStructure')}>
              <Icon name="org" size={16} /> Org Structure
            </button>
            <button className="btn" onClick={() => setActiveView('onboarding')}>
              <Icon name="login" size={16} /> Onboarding
            </button>
            <button className="btn" onClick={() => setActiveView('exits')}>
              <Icon name="logout" size={16} /> Exits
            </button>
            <button className="btn" onClick={() => setActiveView('leaveAdmin')}>
              <Icon name="leave" size={16} /> Leave Mgmt
            </button>
            <button className="btn" onClick={() => setActiveView('probation')}>
              <Icon name="clock" size={16} /> Probation
            </button>
            <button className="btn" onClick={() => setActiveView('assetsAdmin')}>
              <Icon name="laptop" size={16} /> Assets
            </button>
            <button className="btn" onClick={() => setActiveView('helpAdmin')}>
              <Icon name="chat" size={16} /> Helpdesk
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
