import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const PolicyPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'policy') ?? false

  const records = useRecords('policy', allowed && hasType)
  const createRecord = useCreateRecord('policy')
  const archiveRecord = useArchiveRecord('policy')

  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('hr')
  const [version, setVersion] = useState('1.0')
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        title,
        category,
        version,
        effective_date: effectiveDate,
        summary,
        status: 'active',
      },
    })
    setShowForm(false)
    setTitle('')
    setSummary('')
  }

  const activePolicies = items.filter((r: any) => !r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Documents</div>
            <h1>Company Policies</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="shield" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "policy" record type to manage company policies.
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
          <h1>Company Policies</h1>
          <p>HR policies, compliance documents, and employee handbooks.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Add policy
          </button>
        </div>
      </div>

      <div className="grid g2 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="shield" size={16} /></i> Active Policies</div>
          <div className="v">{activePolicies.length}</div>
          <div className="d">Currently in effect</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="archive" size={16} /></i> Archived</div>
          <div className="v">{items.length - activePolicies.length}</div>
          <div className="d">Superseded versions</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Add Policy</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Policy Title</span>
                <input className="input" placeholder="e.g. Remote Work Policy" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="hr">HR & People</option>
                  <option value="it">IT & Security</option>
                  <option value="finance">Finance & Expenses</option>
                  <option value="compliance">Legal & Compliance</option>
                  <option value="safety">Health & Safety</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Version</span>
                <input className="input" value={version} onChange={(e) => setVersion(e.target.value)} required />
              </div>
              <div className="field">
                <span>Effective Date</span>
                <input className="input" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <span>Summary</span>
              <textarea className="input" rows={3} placeholder="Brief description of this policy..." value={summary} onChange={(e) => setSummary(e.target.value)} required />
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Saving…' : 'Publish Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>All Policies</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Policy</th>
                <th>Category</th>
                <th>Version</th>
                <th>Effective</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td>
                    <b>{r.data?.title ?? '—'}</b>
                    {r.data?.summary && (
                      <p className="muted" style={{ fontSize: 12, margin: '4px 0 0' }}>
                        {(r.data.summary as string).slice(0, 80)}{(r.data.summary as string).length > 80 ? '…' : ''}
                      </p>
                    )}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{r.data?.category}</td>
                  <td>v{r.data?.version}</td>
                  <td>{r.data?.effective_date}</td>
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
                  <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No policies published yet.
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
