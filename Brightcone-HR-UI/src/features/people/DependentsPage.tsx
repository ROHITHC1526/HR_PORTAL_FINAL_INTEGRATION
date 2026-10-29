import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const DependentsPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'employee_dependent') ?? false

  const records = useRecords('employee_dependent', allowed && hasType)
  const createRecord = useCreateRecord('employee_dependent')
  const archiveRecord = useArchiveRecord('employee_dependent')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('spouse')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        name,
        relationship,
        date_of_birth: dob || null,
        phone: phone || null,
      },
    })
    setShowForm(false)
    setName('')
    setEmpId('')
    setDob('')
    setPhone('')
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">People</div>
            <h1>Employee Dependents</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="users" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "dependent" record type in the Records API to enable dependent tracking.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">People</div>
          <h1>Employee Dependents</h1>
          <p>Manage dependent and family member records for insurance and benefits.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Add dependent
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Add Dependent</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Employee</span>
                <select className="input" value={empId} onChange={(e) => setEmpId(e.target.value)} required>
                  <option value="">Select employee</option>
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Dependent Name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Relationship</span>
                <select className="input" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <span>Date of Birth</span>
                <input className="input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div className="field">
                <span>Phone (optional)</span>
                <input className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Saving…' : 'Save Dependent'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dependent Name</th>
                <th>Relationship</th>
                <th>DOB</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{getEmpName(r.data?.employee_id)}</b></td>
                  <td>{r.data?.name ?? '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.data?.relationship ?? '—'}</td>
                  <td>{r.data?.date_of_birth ?? '—'}</td>
                  <td>{r.data?.phone ?? '—'}</td>
                  <td>
                    {!r.archived && (
                      <button
                        className="btn sm"
                        onClick={() => archiveRecord.mutate(r.id)}
                      >
                        Archive
                      </button>
                    )}
                    {r.archived && <span className="pill p-bad">Archived</span>}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No dependents recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
