import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useUpdateRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const DocAcknowledgePage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'doc_acknowledge') ?? false

  const records = useRecords('doc_acknowledge', allowed && hasType)
  const createRecord = useCreateRecord('doc_acknowledge')
  const updateRecord = useUpdateRecord('doc_acknowledge')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [selectedEmps, setSelectedEmps] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    for (const eid of selectedEmps) {
      const emp = empList.find((emp) => emp.id === eid)
      await createRecord.mutateAsync({
        data: {
          document_title: docTitle,
          employee_id: eid,
          employee_name: emp ? `${emp.first_name} ${emp.last_name}` : eid,
          due_date: dueDate || null,
          status: 'pending',
          sent_date: new Date().toISOString().slice(0, 10),
        },
      })
    }
    setShowForm(false)
    setDocTitle('')
    setSelectedEmps([])
    setDueDate('')
  }

  const handleAcknowledge = async (id: string) => {
    await updateRecord.mutateAsync({
      id,
      payload: {
        reason: 'acknowledged',
        changes: { status: 'acknowledged', acknowledged_date: new Date().toISOString().slice(0, 10) },
      },
    })
  }

  const pending = items.filter((r: any) => r.data?.status === 'pending' && !r.archived)
  const acknowledged = items.filter((r: any) => r.data?.status === 'acknowledged')

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Documents</div>
            <h1>Document Acknowledgements</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="check" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "doc_acknowledge" record type to track policy acknowledgements.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Documents</div>
          <h1>Document Acknowledgements</h1>
          <p>Send documents for employee acknowledgement and track responses.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Send for acknowledgement
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
          <div className="v">{pending.length}</div>
          <div className="d">Awaiting acknowledgement</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Acknowledged</div>
          <div className="v">{acknowledged.length}</div>
          <div className="d">Confirmed by employees</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> Rate</div>
          <div className="v">
            {items.length > 0
              ? `${((acknowledged.length / items.length) * 100).toFixed(0)}%`
              : '—'}
          </div>
          <div className="d">Completion rate</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Send for Acknowledgement</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <span>Document / Policy Title</span>
              <input className="input" placeholder="e.g. Updated Code of Conduct 2026" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
            </div>
            <div className="frow">
              <div className="field" style={{ flex: 2 }}>
                <span>Employees (hold Ctrl to select multiple)</span>
                <select
                  className="input"
                  multiple
                  size={5}
                  value={selectedEmps}
                  onChange={(e) => setSelectedEmps(Array.from(e.target.selectedOptions, (o) => o.value))}
                >
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Due Date</span>
                <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending || selectedEmps.length === 0}>
                {createRecord.isPending ? 'Sending…' : `Send to ${selectedEmps.length} employee(s)`}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>Pending Acknowledgements</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Employee</th>
                <th>Sent</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.document_title ?? '—'}</b></td>
                  <td>{r.data?.employee_name ?? '—'}</td>
                  <td>{r.data?.sent_date}</td>
                  <td>{r.data?.due_date ?? '—'}</td>
                  <td>
                    <span className={`pill ${r.data?.status === 'acknowledged' ? 'p-ok' : 'p-warn'}`}>
                      {r.data?.status}
                    </span>
                  </td>
                  <td>
                    {r.data?.status === 'pending' && !r.archived && (
                      <button className="btn sm" onClick={() => handleAcknowledge(r.id)}>
                        Mark Acknowledged
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No acknowledgement requests yet.
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
