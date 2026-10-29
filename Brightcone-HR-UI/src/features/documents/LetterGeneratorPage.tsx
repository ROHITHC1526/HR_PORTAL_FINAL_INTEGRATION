import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

const BUILT_IN_TEMPLATES = [
  { key: 'offer_letter', name: 'Offer Letter', fields: ['position', 'salary', 'start_date'] },
  { key: 'experience_letter', name: 'Experience Letter', fields: ['last_working_date', 'designation'] },
  { key: 'address_proof', name: 'Address Proof Letter', fields: ['address'] },
  { key: 'salary_certificate', name: 'Salary Certificate', fields: ['annual_ctc', 'purpose'] },
  { key: 'noc', name: 'No Objection Certificate', fields: ['purpose', 'valid_until'] },
  { key: 'relieving_letter', name: 'Relieving Letter', fields: ['last_working_date', 'reason'] },
]

export const LetterGeneratorPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'hr_document') ?? false

  const records = useRecords('hr_document', allowed && hasType)
  const createRecord = useCreateRecord('hr_document')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [empId, setEmpId] = useState('')
  const [templateKey, setTemplateKey] = useState('offer_letter')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  const selectedTemplate = BUILT_IN_TEMPLATES.find((t) => t.key === templateKey)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emp = empList.find((emp) => emp.id === empId)
    await createRecord.mutateAsync({
      data: {
        employee_id: empId,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : empId,
        template_key: templateKey,
        title: `${selectedTemplate?.name} — ${emp?.first_name} ${emp?.last_name}`,
        status: 'draft',
        issued_date: new Date().toISOString().slice(0, 10),
        ...fieldValues,
      },
    })
    setShowForm(false)
    setEmpId('')
    setFieldValues({})
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
            <div className="eyebrow">Documents</div>
            <h1>Letter Generator</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="doc" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create an "hr_document" record type to enable letter generation.
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
          <h1>Letter Generator</h1>
          <p>Generate offer letters, experience certificates, and HR documents.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Generate letter
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        {BUILT_IN_TEMPLATES.slice(0, 3).map((tpl) => (
          <div key={tpl.key} className="card" style={{ cursor: 'pointer' }} onClick={() => { setTemplateKey(tpl.key); setShowForm(true) }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Icon name="doc" size={24} />
              <div>
                <b>{tpl.name}</b>
                <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                  Fields: {tpl.fields.join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && selectedTemplate && (
        <div className="card mt">
          <h3>Generate: {selectedTemplate.name}</h3>
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
                <span>Template</span>
                <select className="input" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)}>
                  {BUILT_IN_TEMPLATES.map((tpl) => (
                    <option key={tpl.key} value={tpl.key}>{tpl.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {selectedTemplate.fields.map((field) => (
              <div className="field" key={field}>
                <span style={{ textTransform: 'capitalize' }}>{field.replace(/_/g, ' ')}</span>
                <input
                  className="input"
                  value={fieldValues[field] ?? ''}
                  onChange={(e) => setFieldValues({ ...fieldValues, [field]: e.target.value })}
                  required
                />
              </div>
            ))}
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Generating…' : 'Generate Document'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>Generated Documents</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.title ?? '—'}</b></td>
                  <td>{getEmpName(r.data?.employee_id ?? '')}</td>
                  <td>{BUILT_IN_TEMPLATES.find((t) => t.key === r.data?.template_key)?.name ?? r.data?.template_key}</td>
                  <td>{r.data?.issued_date}</td>
                  <td>
                    <span className={`pill ${r.data?.status === 'issued' ? 'p-ok' : r.data?.status === 'revoked' ? 'p-bad' : 'p-warn'}`}>
                      {r.data?.status ?? 'draft'}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No documents generated yet.
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
