import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useUpdateRecord } from '@/features/records/api'
import { useEmployees } from './api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials, todayISO, weekdays } from '@/people-plus/helpers'

const LEAVE_TYPES = [
  { key: 'casual', label: 'Casual Leave', days: 12 },
  { key: 'sick', label: 'Sick Leave', days: 12 },
  { key: 'privilege', label: 'Privilege / Earned Leave', days: 15 },
  { key: 'maternity', label: 'Maternity Leave', days: 182 },
  { key: 'paternity', label: 'Paternity Leave', days: 15 },
  { key: 'comp_off', label: 'Compensatory Off', days: 0 },
  { key: 'unpaid', label: 'Leave Without Pay', days: 0 },
] as const

type LeaveItem = {
  id: string
  data?: {
    employee_id?: string
    leave_type?: string
    start_date?: string
    end_date?: string
    reason?: string
    status?: string
    days?: number
  }
  archived?: boolean
}

function LeaveTable({
  items,
  getEmpName,
  onAction,
  showActions,
}: {
  items: LeaveItem[]
  getEmpName: (id: string) => string
  onAction?: (id: string, action: 'approve' | 'reject') => void
  showActions: boolean
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const d = r.data ?? {}
            const statusCls = d.status === 'approved' ? 'p-ok' : d.status === 'rejected' ? 'p-bad' : 'p-warn'
            return (
              <tr key={r.id}>
                <td>
                  <div className="who">
                    <div className="av" style={{ background: avatarColor(getEmpName(d.employee_id ?? '')) }}>
                      {initials(getEmpName(d.employee_id ?? ''))}
                    </div>
                    <b>{getEmpName(d.employee_id ?? '')}</b>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{(d.leave_type ?? '').replace('_', ' ')}</td>
                <td>{d.start_date ?? '—'}</td>
                <td>{d.end_date ?? '—'}</td>
                <td>{d.days ?? '—'}</td>
                <td className="muted">{d.reason ?? '—'}</td>
                <td><span className={`pill ${statusCls}`}>{d.status ?? 'pending'}</span></td>
                {showActions && (
                  <td>
                    {d.status === 'pending' && onAction && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn sm" onClick={() => onAction(r.id, 'approve')}>Approve</button>
                        <button className="btn sm" onClick={() => onAction(r.id, 'reject')}>Reject</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                No leave requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export const LeaveManagementPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'leave_request') ?? false

  const records = useRecords('leave_request', allowed && hasType)
  const createRecord = useCreateRecord('leave_request')
  const updateRecord = useUpdateRecord('leave_request')

  const empList = employees.data ?? []
  const items = ((records.data as { items?: LeaveItem[] })?.items ?? []) as LeaveItem[]

  const [tab, setTab] = useState<'pending' | 'all' | 'policy'>('pending')
  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')
  const [leaveType, setLeaveType] = useState('casual')
  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(todayISO())
  const [reason, setReason] = useState('')

  const dayCount = startDate && endDate ? weekdays(startDate, endDate) : 0

  const pending = items.filter((r) => r.data?.status === 'pending' && !r.archived)
  const approved = items.filter((r) => r.data?.status === 'approved')
  const rejected = items.filter((r) => r.data?.status === 'rejected')

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason,
        days: dayCount,
        status: 'pending',
      },
    })
    setShowForm(false)
    setReason('')
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    await updateRecord.mutateAsync({
      id,
      payload: {
        reason: `leave_${action}`,
        changes: { status: action === 'approve' ? 'approved' : 'rejected' },
      },
    })
  }

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Time Off</div>
            <h1>Leave Management</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="leave" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "leave_request" record type in the Records API to enable leave management.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Time Off</div>
          <h1>Leave Management</h1>
          <p>Track leave requests, approvals, and balances for all employees.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Apply leave
          </button>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
          <div className="v">{pending.length}</div>
          <div className="d">Awaiting approval</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Approved</div>
          <div className="v">{approved.length}</div>
          <div className="d">This period</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="shield" size={16} /></i> Rejected</div>
          <div className="v">{rejected.length}</div>
          <div className="d">Declined requests</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> On Leave</div>
          <div className="v">
            {approved.filter((r) => {
              const end = r.data?.end_date
              return end && end >= todayISO()
            }).length}
          </div>
          <div className="d">Currently away</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Apply Leave</h3>
          <form onSubmit={handleCreate}>
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
                <span>Leave Type</span>
                <select className="input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  {LEAVE_TYPES.map((lt) => (
                    <option key={lt.key} value={lt.key}>{lt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Start Date</span>
                <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="field">
                <span>End Date</span>
                <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <div className="field">
                <span>Working Days</span>
                <input className="input" type="text" value={dayCount} readOnly />
              </div>
            </div>
            <div className="field">
              <span>Reason</span>
              <textarea className="input" rows={2} placeholder="Reason for leave" value={reason} onChange={(e) => setReason(e.target.value)} required />
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

      <div className="tabs mb mt">
        <button className={tab === 'pending' ? 'on' : ''} onClick={() => setTab('pending')}>
          Pending ({pending.length})
        </button>
        <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
          All Requests ({items.length})
        </button>
        <button className={tab === 'policy' ? 'on' : ''} onClick={() => setTab('policy')}>
          Leave Policy
        </button>
      </div>

      {tab === 'pending' && (
        <div className="card mt">
          <LeaveTable items={pending} getEmpName={getEmpName} onAction={handleAction} showActions />
        </div>
      )}

      {tab === 'all' && (
        <div className="card mt">
          <LeaveTable items={items} getEmpName={getEmpName} showActions={false} />
        </div>
      )}

      {tab === 'policy' && (
        <div className="card mt">
          <h3>Leave Policy</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Standard leave entitlements per financial year.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Annual Entitlement</th>
                  <th>Carry Forward</th>
                </tr>
              </thead>
              <tbody>
                {LEAVE_TYPES.map((lt) => (
                  <tr key={lt.key}>
                    <td><b>{lt.label}</b></td>
                    <td>{lt.days > 0 ? `${lt.days} days` : 'As applicable'}</td>
                    <td>{lt.key === 'privilege' ? 'Up to 30 days' : lt.key === 'sick' ? 'Up to 6 days' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
