import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const TemplatesPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'letter_template') ?? false

  const records = useRecords('letter_template', allowed && hasType)
  const createRecord = useCreateRecord('letter_template')
  const archiveRecord = useArchiveRecord('letter_template')

  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('employment')
  const [fields, setFields] = useState('')
  const [bodyTemplate, setBodyTemplate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        name,
        category,
        fields: fields.split(',').map((f) => f.trim()).filter(Boolean),
        body_template: bodyTemplate,
        status: 'active',
      },
    })
    setShowForm(false)
    setName('')
    setFields('')
    setBodyTemplate('')
  }

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Documents</div>
            <h1>Letter Templates</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="doc" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "letter_template" record type to manage document templates.
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
          <h1>Letter Templates</h1>
          <p>Manage reusable templates for HR letters and documents.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Add template
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Create Template</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Template Name</span>
                <input className="input" placeholder="e.g. Internship Offer" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="employment">Employment Letters</option>
                  <option value="certification">Certifications</option>
                  <option value="compliance">Compliance / Legal</option>
                  <option value="general">General Purpose</option>
                </select>
              </div>
            </div>
            <div className="field">
              <span>Fields (comma separated)</span>
              <input className="input" placeholder="e.g. position, salary, start_date" value={fields} onChange={(e) => setFields(e.target.value)} required />
            </div>
            <div className="field">
              <span>Body Template</span>
              <textarea
                className="input"
                rows={5}
                placeholder="Use {{field_name}} for merge fields..."
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                required
              />
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Saving…' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>All Templates ({items.length})</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Template</th>
                <th>Category</th>
                <th>Fields</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.name ?? '—'}</b></td>
                  <td style={{ textTransform: 'capitalize' }}>{r.data?.category}</td>
                  <td className="muted">
                    {Array.isArray(r.data?.fields) ? (r.data.fields as string[]).join(', ') : '—'}
                  </td>
                  <td>
                    <span className={`pill ${r.archived ? 'p-bad' : 'p-ok'}`}>
                      {r.archived ? 'Archived' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {!r.archived && (
                      <button className="btn sm" onClick={() => archiveRecord.mutate(r.id)}>
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No templates created yet.
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
