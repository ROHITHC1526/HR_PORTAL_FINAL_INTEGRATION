import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useUpdateRecord, useArchiveRecord } from '@/features/records/api'
import { useEmployees } from './api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials, todayISO } from '@/people-plus/helpers'

const TICKET_CATEGORIES = [
  { key: 'payroll', label: 'Payroll & Compensation' },
  { key: 'leave', label: 'Leave & Attendance' },
  { key: 'benefits', label: 'Benefits & Insurance' },
  { key: 'it_access', label: 'IT Access & Systems' },
  { key: 'policy', label: 'Policy Clarification' },
  { key: 'documents', label: 'Documents & Letters' },
  { key: 'onboarding', label: 'Onboarding Support' },
  { key: 'general', label: 'General HR Query' },
] as const

const PRIORITIES = [
  { key: 'low', label: 'Low', cls: 'p-ok' },
  { key: 'medium', label: 'Medium', cls: 'p-warn' },
  { key: 'high', label: 'High', cls: 'p-bad' },
  { key: 'critical', label: 'Critical', cls: 'p-bad' },
] as const

type TicketItem = {
  id: string
  data?: {
    subject?: string
    description?: string
    category?: string
    priority?: string
    raised_by?: string
    assigned_to?: string
    status?: string
    created_date?: string
    resolved_date?: string
    notes?: string
  }
  archived?: boolean
}

export const HelpdeskQueuePage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'ticket') ?? false

  const records = useRecords('ticket', allowed && hasType)
  const createRecord = useCreateRecord('ticket')
  const updateRecord = useUpdateRecord('ticket')
  const archiveRecord = useArchiveRecord('ticket')

  const empList = employees.data ?? []
  const items = ((records.data as { items?: TicketItem[] })?.items ?? []) as TicketItem[]

  const [tab, setTab] = useState<'open' | 'resolved' | 'all'>('open')
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('medium')
  const [raisedBy, setRaisedBy] = useState('')

  const open = items.filter((r) => !r.archived && r.data?.status !== 'resolved')
  const resolved = items.filter((r) => r.archived || r.data?.status === 'resolved')

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id || '—'
  }

  const getPriorityCls = (p: string) =>
    PRIORITIES.find((pr) => pr.key === p)?.cls ?? ''

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        subject,
        description,
        category,
        priority,
        raised_by: raisedBy || null,
        status: 'open',
        created_date: todayISO(),
      },
    })
    setShowForm(false)
    setSubject('')
    setDescription('')
  }

  const handleResolve = async (id: string) => {
    await updateRecord.mutateAsync({
      id,
      payload: {
        reason: 'ticket_resolved',
        changes: { status: 'resolved', resolved_date: todayISO() },
      },
    })
  }

  const filteredItems = tab === 'open' ? open : tab === 'resolved' ? resolved : items

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Operations</div>
            <h1>HR Helpdesk Queue</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="chat" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "ticket" record type in the Records API to enable the HR helpdesk.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Operations</div>
          <h1>HR Helpdesk Queue</h1>
          <p>Manage employee support tickets, queries, and service requests.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> New ticket
          </button>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="inbox" size={16} /></i> Open</div>
          <div className="v">{open.length}</div>
          <div className="d">Awaiting resolution</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Resolved</div>
          <div className="v">{resolved.length}</div>
          <div className="d">Closed tickets</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> High Priority</div>
          <div className="v">
            {open.filter((r) => r.data?.priority === 'high' || r.data?.priority === 'critical').length}
          </div>
          <div className="d">Need attention</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> Total</div>
          <div className="v">{items.length}</div>
          <div className="d">All time</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Raise New Ticket</h3>
          <form onSubmit={handleCreate}>
            <div className="frow">
              <div className="field">
                <span>Subject</span>
                <input className="input" placeholder="Brief summary of the issue" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {TICKET_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Raised By</span>
                <select className="input" value={raisedBy} onChange={(e) => setRaisedBy(e.target.value)}>
                  <option value="">Select employee</option>
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Priority</span>
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <span>Description</span>
              <textarea className="input" rows={3} placeholder="Describe the issue in detail…" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs mb mt">
        <button className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>
          Open ({open.length})
        </button>
        <button className={tab === 'resolved' ? 'on' : ''} onClick={() => setTab('resolved')}>
          Resolved ({resolved.length})
        </button>
        <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
          All ({items.length})
        </button>
      </div>

      <div className="card mt">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Category</th>
                <th>Raised By</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => {
                const d = r.data ?? {}
                const isResolved = r.archived || d.status === 'resolved'
                return (
                  <tr key={r.id}>
                    <td><b>{d.subject ?? '—'}</b></td>
                    <td style={{ textTransform: 'capitalize' }}>{(d.category ?? '').replace('_', ' ')}</td>
                    <td>
                      {d.raised_by ? (
                        <div className="who">
                          <div className="av sm" style={{ background: avatarColor(getEmpName(d.raised_by)) }}>
                            {initials(getEmpName(d.raised_by))}
                          </div>
                          <span>{getEmpName(d.raised_by)}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`pill ${getPriorityCls(d.priority ?? '')}`}>
                        {d.priority ?? '—'}
                      </span>
                    </td>
                    <td>{d.created_date ?? '—'}</td>
                    <td>
                      <span className={`pill ${isResolved ? 'p-ok' : 'p-warn'}`}>
                        {isResolved ? 'Resolved' : d.status ?? 'Open'}
                      </span>
                    </td>
                    <td>
                      {!isResolved && (
                        <button className="btn sm" onClick={() => handleResolve(r.id)}>
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No tickets in this view.
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
