import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useUpdateRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

export const OnboardingPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'employee_onboarding') ?? false

  const records = useRecords('employee_onboarding', allowed && hasType)
  const createRecord = useCreateRecord('employee_onboarding')
  const updateRecord = useUpdateRecord('employee_onboarding')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')

  const defaultChecklist = [
    'HR documentation submitted',
    'IT equipment provisioned',
    'Access card issued',
    'Email account created',
    'Team introduction completed',
    'Company policies acknowledged',
    'Benefits enrollment',
    'First week plan shared',
  ]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const emp = empList.find((emp) => emp.id === empId)
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : empId,
        start_date: emp?.start_date ?? new Date().toISOString().slice(0, 10),
        checklist: defaultChecklist.map((item) => ({ task: item, done: false })),
        status: 'in_progress',
      },
    })
    setShowForm(false)
    setEmpId('')
  }

  const toggleTask = async (recordId: string, record: any, taskIdx: number) => {
    const checklist = [...(record.data?.checklist ?? [])]
    checklist[taskIdx] = { ...checklist[taskIdx], done: !checklist[taskIdx].done }
    const allDone = checklist.every((t: any) => t.done)
    await updateRecord.mutateAsync({
      id: recordId,
      payload: {
        reason: 'checklist_update',
        changes: { checklist, status: allDone ? 'completed' : 'in_progress' },
      },
    })
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const inProgress = items.filter((r: any) => r.data?.status !== 'completed' && !r.archived)
  const completed = items.filter((r: any) => r.data?.status === 'completed' || r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">People</div>
            <h1>Onboarding Checklists</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="login" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create an "onboarding" record type to enable onboarding checklists.
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
          <h1>Onboarding Checklists</h1>
          <p>Track new hire onboarding tasks and documentation completion.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Start onboarding
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> In Progress</div>
          <div className="v">{inProgress.length}</div>
          <div className="d">Active onboarding</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="check" size={16} /></i> Completed</div>
          <div className="v">{completed.length}</div>
          <div className="d">Fully onboarded</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> New Hires</div>
          <div className="v">{empList.filter((e) => e.status === 'probation').length}</div>
          <div className="d">On probation</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Start Onboarding</h3>
          <form onSubmit={handleCreate}>
            <div className="field">
              <span>New Employee</span>
              <select className="input" value={empId} onChange={(e) => setEmpId(e.target.value)} required>
                <option value="">Select employee</option>
                {empList.filter((e) => e.status === 'probation').map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Creating…' : 'Create Checklist'}
              </button>
            </div>
          </form>
        </div>
      )}

      {inProgress.map((r: any) => {
        const checklist = r.data?.checklist ?? []
        const doneCount = checklist.filter((t: any) => t.done).length
        const name = getEmpName(r.data?.employee_id ?? '')
        return (
          <div key={r.id} className="card mt">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="av" style={{ background: avatarColor(name) }}>{initials(name)}</div>
                <div>
                  <b>{name}</b>
                  <span className="muted"> · Started {r.data?.start_date}</span>
                </div>
              </div>
              <span className="pill p-warn">{doneCount}/{checklist.length} tasks</span>
            </div>
            <div style={{ marginTop: 14 }}>
              {checklist.map((task: any, idx: number) => (
                <label key={idx} style={{ display: 'flex', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(r.id, r, idx)}
                  />
                  <span style={{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>
                    {task.task}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {completed.length > 0 && (
        <div className="card mt">
          <h3>Completed Onboarding ({completed.length})</h3>
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Start Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((r: any) => (
                  <tr key={r.id}>
                    <td><b>{getEmpName(r.data?.employee_id ?? '')}</b></td>
                    <td>{r.data?.start_date}</td>
                    <td><span className="pill p-ok">Completed</span></td>
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
