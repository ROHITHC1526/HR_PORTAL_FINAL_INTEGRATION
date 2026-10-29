import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useUpdateRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const DocWorkflowPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'doc_workflow') ?? false

  const records = useRecords('doc_workflow', allowed && hasType)
  const createRecord = useCreateRecord('doc_workflow')
  const updateRecord = useUpdateRecord('doc_workflow')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('approval')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        title: docTitle,
        workflow_type: docType,
        assignee_id: assigneeId,
        due_date: dueDate || null,
        status: 'pending',
        created_date: new Date().toISOString().slice(0, 10),
      },
    })
    setShowForm(false)
    setDocTitle('')
    setAssigneeId('')
    setDueDate('')
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateRecord.mutateAsync({
      id,
      payload: {
        reason: 'status_update',
        changes: { status: newStatus },
      },
    })
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const pending = items.filter((r: any) => r.data?.status === 'pending' && !r.archived)
  const inReview = items.filter((r: any) => r.data?.status === 'in_review' && !r.archived)
  const completed = items.filter((r: any) => r.data?.status === 'completed' || r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Documents</div>
            <h1>Document Workflows</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="doc" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "doc_workflow" record type to enable document approval workflows.
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
          <h1>Document Workflows</h1>
          <p>Track document approvals, reviews, and sign-off workflows.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> New workflow
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
          <div className="v">{pending.length}</div>
          <div className="d">Awaiting action</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="search" size={16} /></i> In Review</div>
          <div className="v">{inReview.length}</div>
          <div className="d">Being reviewed</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Completed</div>
          <div className="v">{completed.length}</div>
          <div className="d">Finished workflows</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>New Document Workflow</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Document Title</span>
                <input className="input" placeholder="e.g. Q4 Promotion Letters" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
              </div>
              <div className="field">
                <span>Workflow Type</span>
                <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="approval">Approval</option>
                  <option value="review">Review & Feedback</option>
                  <option value="signature">Signature Collection</option>
                  <option value="distribution">Distribution</option>
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Assign To</span>
                <select className="input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} required>
                  <option value="">Select reviewer</option>
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
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Creating…' : 'Create Workflow'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>All Workflows</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.title ?? '—'}</b></td>
                  <td style={{ textTransform: 'capitalize' }}>{r.data?.workflow_type}</td>
                  <td>{getEmpName(r.data?.assignee_id ?? '')}</td>
                  <td>{r.data?.due_date ?? '—'}</td>
                  <td>
                    <span className={`pill ${
                      r.data?.status === 'completed' ? 'p-ok' :
                      r.data?.status === 'in_review' ? 'p-warn' : 'p-bad'
                    }`}>
                      {r.data?.status ?? 'pending'}
                    </span>
                  </td>
                  <td>
                    {r.data?.status === 'pending' && !r.archived && (
                      <button className="btn sm" onClick={() => handleStatusChange(r.id, 'in_review')}>
                        Start Review
                      </button>
                    )}
                    {r.data?.status === 'in_review' && !r.archived && (
                      <button className="btn sm" onClick={() => handleStatusChange(r.id, 'completed')}>
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No document workflows yet.
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
