import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const FacilitiesPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'facility_request') ?? false

  const records = useRecords('facility_request', allowed && hasType)
  const createRecord = useCreateRecord('facility_request')
  const archiveRecord = useArchiveRecord('facility_request')

  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('meeting_room')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requestDate, setRequestDate] = useState(new Date().toISOString().slice(0, 10))
  const [priority, setPriority] = useState('normal')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        category,
        title,
        description,
        request_date: requestDate,
        priority,
        status: 'pending',
      },
    })
    setShowForm(false)
    setTitle('')
    setDescription('')
  }

  const pendingCount = items.filter((r: any) => r.data?.status === 'pending' && !r.archived).length
  const activeCount = items.filter((r: any) => !r.archived).length

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Workplace</div>
            <h1>Facilities Requests</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="building" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "facility_request" record type to enable office facility requests.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Workplace</div>
          <h1>Facilities Requests</h1>
          <p>Meeting room bookings, maintenance requests, and office services.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> New request
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
          <div className="v">{pendingCount}</div>
          <div className="d">Awaiting action</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Active</div>
          <div className="v">{activeCount}</div>
          <div className="d">Open requests</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="archive" size={16} /></i> Closed</div>
          <div className="v">{items.filter((r: any) => r.archived).length}</div>
          <div className="d">Completed / cancelled</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>New Facility Request</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="meeting_room">Meeting Room Booking</option>
                  <option value="maintenance">Maintenance / Repair</option>
                  <option value="cleaning">Cleaning / Housekeeping</option>
                  <option value="parking">Parking Spot</option>
                  <option value="furniture">Furniture / Equipment</option>
                  <option value="access">Access / Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <span>Priority</span>
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="field">
              <span>Title</span>
              <input className="input" placeholder="Brief summary of your request" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="frow">
              <div className="field" style={{ flex: 2 }}>
                <span>Description</span>
                <textarea className="input" rows={2} placeholder="Details..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="field">
                <span>Date Needed</span>
                <input className="input" type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} required />
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>All Requests</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.title ?? '—'}</b></td>
                  <td style={{ textTransform: 'capitalize' }}>{(r.data?.category ?? '').replace('_', ' ')}</td>
                  <td>
                    <span className={`pill ${r.data?.priority === 'urgent' ? 'p-bad' : r.data?.priority === 'high' ? 'p-warn' : 'p-ok'}`}>
                      {r.data?.priority}
                    </span>
                  </td>
                  <td>{r.data?.request_date}</td>
                  <td>
                    <span className={`pill ${r.archived ? 'p-ok' : 'p-warn'}`}>
                      {r.archived ? 'Closed' : r.data?.status ?? 'Open'}
                    </span>
                  </td>
                  <td>
                    {!r.archived && (
                      <button className="btn sm" onClick={() => archiveRecord.mutate(r.id)}>
                        Close
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No facility requests yet.
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
