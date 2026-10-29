import React, { useState } from 'react'
import { useEmployees, useReferences, useCreateReference, type Employee, type ReferenceItem } from './api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

function OrgNode({
  dept,
  departments,
  employees,
  expanded,
  onToggle,
}: {
  dept: ReferenceItem
  departments: ReferenceItem[]
  employees: Employee[]
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const children = departments.filter((d) => d.parent_id === dept.id)
  const members = employees.filter((e) => e.department_id === dept.id)
  const isOpen = expanded.has(dept.id)
  const hasChildren = children.length > 0 || members.length > 0

  return (
    <div style={{ marginLeft: 4 }}>
      <div
        className="node click"
        style={{ cursor: hasChildren ? 'pointer' : 'default', padding: '8px 12px', borderRadius: 8 }}
        onClick={() => hasChildren && onToggle(dept.id)}
      >
        {hasChildren && (
          <Icon name={isOpen ? 'arrow' : 'arrow'} size={14} />
        )}
        <div className="av" style={{ background: avatarColor(dept.label || ''), width: 32, height: 32 }}>
          {initials(dept.label || '')}
        </div>
        <div style={{ flex: 1 }}>
          <b>{dept.label}</b>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
            {dept.code} · {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      {isOpen && (
        <div style={{ marginLeft: 24, borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
          {children.map((child) => (
            <OrgNode
              key={child.id}
              dept={child}
              departments={departments}
              employees={employees}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
          {members.map((emp) => {
            const name = `${emp.first_name} ${emp.last_name}`
            return (
              <div key={emp.id} className="node" style={{ padding: '6px 12px' }}>
                <div className="av sm" style={{ background: avatarColor(name) }}>
                  {initials(name)}
                </div>
                <div>
                  <b style={{ fontSize: 13 }}>{name}</b>
                  <span className="muted" style={{ marginLeft: 6, fontSize: 12 }}>
                    {emp.employment_type.replace('_', ' ')}
                  </span>
                </div>
                <span className={`pill ${emp.status === 'active' ? 'p-ok' : 'p-warn'}`} style={{ marginLeft: 'auto' }}>
                  {emp.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const OrgStructurePage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')

  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)
  const createDept = useCreateReference('departments')

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const locList = locations.data ?? []

  const [tab, setTab] = useState<'tree' | 'list' | 'locations'>('tree')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [deptLabel, setDeptLabel] = useState('')
  const [deptCode, setDeptCode] = useState('')
  const [parentId, setParentId] = useState('')

  const roots = deptList.filter((d) => !d.parent_id)
  const unassigned = empList.filter((e) => !e.department_id || !deptList.some((d) => d.id === e.department_id))

  const toggleNode = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(deptList.map((d) => d.id)))
  const collapseAll = () => setExpanded(new Set())

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault()
    await createDept.mutateAsync({
      label: deptLabel,
      code: deptCode.toUpperCase(),
      parent_id: parentId || null,
    })
    setShowForm(false)
    setDeptLabel('')
    setDeptCode('')
    setParentId('')
  }

  if (employees.isLoading) {
    return <div className="loader">Loading org structure…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People</div>
          <h1>Organization Structure</h1>
          <p>Department hierarchy, team assignments, and office locations.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={expandAll}>Expand all</button>
          <button className="btn" onClick={collapseAll}>Collapse</button>
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Add department
          </button>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="org" size={16} /></i> Departments</div>
          <div className="v">{deptList.length}</div>
          <div className="d">Active departments</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Employees</div>
          <div className="v">{empList.length}</div>
          <div className="d">Total headcount</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="building" size={16} /></i> Locations</div>
          <div className="v">{locList.length}</div>
          <div className="d">Office sites</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Unassigned</div>
          <div className="v">{unassigned.length}</div>
          <div className="d">No department</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Add Department</h3>
          <form onSubmit={handleCreateDept}>
            <div className="frow">
              <div className="field">
                <span>Department Name</span>
                <input className="input" placeholder="e.g. Engineering" value={deptLabel} onChange={(e) => setDeptLabel(e.target.value)} required />
              </div>
              <div className="field">
                <span>Code</span>
                <input className="input" placeholder="e.g. ENG" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} required />
              </div>
              <div className="field">
                <span>Parent Department</span>
                <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">None (Top-level)</option>
                  {deptList.map((d) => (
                    <option key={d.id} value={d.id}>{d.label} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createDept.isPending}>
                {createDept.isPending ? 'Creating…' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs mb mt">
        <button className={tab === 'tree' ? 'on' : ''} onClick={() => setTab('tree')}>
          Org Tree
        </button>
        <button className={tab === 'list' ? 'on' : ''} onClick={() => setTab('list')}>
          Department List
        </button>
        <button className={tab === 'locations' ? 'on' : ''} onClick={() => setTab('locations')}>
          Locations ({locList.length})
        </button>
      </div>

      {tab === 'tree' && (
        <div className="card mt">
          {roots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="org" size={32} />
              <h3 style={{ marginTop: 12 }}>No departments yet</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Add departments to build your organizational hierarchy.
              </p>
            </div>
          ) : (
            <div className="org">
              {roots.map((dept) => (
                <OrgNode
                  key={dept.id}
                  dept={dept}
                  departments={deptList}
                  employees={empList}
                  expanded={expanded}
                  onToggle={toggleNode}
                />
              ))}
              {unassigned.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="navgroup">Unassigned Employees ({unassigned.length})</div>
                  {unassigned.map((emp) => {
                    const name = `${emp.first_name} ${emp.last_name}`
                    return (
                      <div key={emp.id} className="node" style={{ padding: '6px 12px' }}>
                        <div className="av sm" style={{ background: avatarColor(name) }}>
                          {initials(name)}
                        </div>
                        <b style={{ fontSize: 13 }}>{name}</b>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'list' && (
        <div className="card mt">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Parent</th>
                  <th>Headcount</th>
                </tr>
              </thead>
              <tbody>
                {deptList.map((d) => {
                  const parent = deptList.find((p) => p.id === d.parent_id)
                  const count = empList.filter((e) => e.department_id === d.id).length
                  return (
                    <tr key={d.id}>
                      <td>
                        <div className="who">
                          <div className="av sm" style={{ background: avatarColor(d.label || '') }}>
                            {initials(d.label || '')}
                          </div>
                          <b>{d.label}</b>
                        </div>
                      </td>
                      <td><code>{d.code}</code></td>
                      <td>{parent?.label ?? '—'}</td>
                      <td><b>{count}</b></td>
                    </tr>
                  )
                })}
                {deptList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                      No departments configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'locations' && (
        <div className="card mt">
          {locList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="building" size={32} />
              <h3 style={{ marginTop: 12 }}>No locations configured</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Add office locations via the Organization Setup page.
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Code</th>
                    <th>Headcount</th>
                  </tr>
                </thead>
                <tbody>
                  {locList.map((loc) => {
                    const count = empList.filter((e) => e.location_id === loc.id).length
                    return (
                      <tr key={loc.id}>
                        <td><b>{loc.label}</b></td>
                        <td><code>{loc.code}</code></td>
                        <td>{count}</td>
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
