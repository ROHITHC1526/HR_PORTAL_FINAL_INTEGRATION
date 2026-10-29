import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const AccessCardPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'access_request') ?? false

  const records = useRecords('access_request', allowed && hasType)
  const createRecord = useCreateRecord('access_request')
  const archiveRecord = useArchiveRecord('access_request')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [accessLevel, setAccessLevel] = useState('standard')
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        card_number: cardNumber,
        access_level: accessLevel,
        issued_date: issuedDate,
        status: 'active',
      },
    })
    setShowForm(false)
    setEmpId('')
    setCardNumber('')
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const activeCards = items.filter((r: any) => !r.archived)
  const revokedCards = items.filter((r: any) => r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">People</div>
            <h1>Access Card Management</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="key" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create an "access_card" record type in the Records API to track physical access cards.
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
          <h1>Access Card Management</h1>
          <p>Issue, track, and revoke building access cards for employees.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Issue card
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="key" size={16} /></i> Active Cards</div>
          <div className="v">{activeCards.length}</div>
          <div className="d">Currently issued</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="shield" size={16} /></i> Revoked</div>
          <div className="v">{revokedCards.length}</div>
          <div className="d">Deactivated cards</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Employees</div>
          <div className="v">{empList.length}</div>
          <div className="d">Total headcount</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Issue New Access Card</h3>
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
                <span>Card Number</span>
                <input className="input" placeholder="e.g. AC-0001" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Access Level</span>
                <select className="input" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}>
                  <option value="standard">Standard (Office floors)</option>
                  <option value="restricted">Restricted (Server room)</option>
                  <option value="executive">Executive (All areas)</option>
                  <option value="visitor">Visitor (Lobby only)</option>
                </select>
              </div>
              <div className="field">
                <span>Issue Date</span>
                <input className="input" type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} required />
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Issuing…' : 'Issue Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>Issued Cards</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Card #</th>
                <th>Access Level</th>
                <th>Issued</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{getEmpName(r.data?.employee_id ?? '')}</b></td>
                  <td><code>{r.data?.card_number}</code></td>
                  <td style={{ textTransform: 'capitalize' }}>{r.data?.access_level}</td>
                  <td>{r.data?.issued_date}</td>
                  <td>
                    <span className={`pill ${r.archived ? 'p-bad' : 'p-ok'}`}>
                      {r.archived ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {!r.archived && (
                      <button className="btn sm" onClick={() => archiveRecord.mutate(r.id)}>
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No access cards issued yet.
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
