import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const BenefitsPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'benefit') ?? false

  const records = useRecords('benefit', allowed && hasType)
  const createRecord = useCreateRecord('benefit')
  const archiveRecord = useArchiveRecord('benefit')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')
  const [planType, setPlanType] = useState('health_insurance')
  const [planName, setPlanName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // FINANCE_SCHEMA only allows: employee_id, name, amount, tax_amount,
    // currency, effective_date, status, description, metadata.
    // plan_type, plan_name, start_date, end_date must be stored inside metadata.
    // "enrolled" is not a valid enum value; use "active" instead.
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        name: planName,
        effective_date: startDate,
        status: 'active',
        metadata: {
          plan_type: planType,
          end_date: endDate || null,
        },
      },
    })
    setShowForm(false)
    setEmpId('')
    setPlanName('')
    setEndDate('')
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const planTypeLabels: Record<string, string> = {
    health_insurance: 'Health Insurance',
    life_insurance: 'Life Insurance',
    dental: 'Dental Plan',
    vision: 'Vision Plan',
    retirement: 'Retirement / PF',
    meal_voucher: 'Meal Vouchers',
    transport: 'Transport Allowance',
    wellness: 'Wellness Program',
  }

  const activeEnrollments = items.filter((r: any) => !r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Payroll & Benefits</div>
            <h1>Employee Benefits</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="heart" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "benefit" record type in the Records API to track employee benefit enrollments.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Payroll & Benefits</div>
          <h1>Employee Benefits</h1>
          <p>Insurance plans, retirement contributions, and employee perks.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Enroll employee
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="heart" size={16} /></i> Active Plans</div>
          <div className="v">{activeEnrollments.length}</div>
          <div className="d">Current enrollments</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Enrolled</div>
          <div className="v">{new Set(activeEnrollments.map((r: any) => r.data?.employee_id)).size}</div>
          <div className="d">Unique employees</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> Plan Types</div>
          <div className="v">{new Set(activeEnrollments.map((r: any) => r.data?.plan_type)).size}</div>
          <div className="d">Different plans offered</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Enroll in Benefit Plan</h3>
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
                <span>Plan Type</span>
                <select className="input" value={planType} onChange={(e) => setPlanType(e.target.value)}>
                  {Object.entries(planTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Plan Name / Provider</span>
                <input className="input" placeholder="e.g. ICICI Lombard Group Health" value={planName} onChange={(e) => setPlanName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Start Date</span>
                <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="field">
                <span>End Date (optional)</span>
                <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Enrolling…' : 'Enroll'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>Benefit Enrollments</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Plan Type</th>
                <th>Provider / Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{getEmpName(r.data?.employee_id ?? '')}</b></td>
                  <td>{planTypeLabels[r.data?.metadata?.plan_type ?? r.data?.plan_type] ?? r.data?.metadata?.plan_type ?? r.data?.plan_type}</td>
                  <td>{r.data?.name ?? r.data?.plan_name ?? '—'}</td>
                  <td>{r.data?.effective_date ?? r.data?.start_date}</td>
                  <td>{r.data?.metadata?.end_date ?? r.data?.end_date ?? '—'}</td>
                  <td>
                    <span className={`pill ${r.archived ? 'p-bad' : 'p-ok'}`}>
                      {r.archived ? 'Ended' : 'Enrolled'}
                    </span>
                  </td>
                  <td>
                    {!r.archived && (
                      <button className="btn sm" onClick={() => archiveRecord.mutate(r.id)}>
                        End
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No benefit enrollments yet.
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
