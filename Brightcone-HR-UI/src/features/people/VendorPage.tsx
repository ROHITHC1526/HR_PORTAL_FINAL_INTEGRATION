import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'

export const VendorPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'vendor') ?? false

  const records = useRecords('vendor', allowed && hasType)
  const createRecord = useCreateRecord('vendor')
  const archiveRecord = useArchiveRecord('vendor')

  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('staffing')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contractEnd, setContractEnd] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        name,
        category,
        contact_name: contactName,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        contract_end_date: contractEnd || null,
        status: 'active',
      },
    })
    setShowForm(false)
    setName('')
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setContractEnd('')
  }

  const activeVendors = items.filter((r: any) => !r.archived)

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Administration</div>
            <h1>Vendor Management</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="building" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "vendor" record type in the Records API to track vendors and contracts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Administration</div>
          <h1>Vendor Management</h1>
          <p>Track third-party vendors, service providers, and contract details.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Add vendor
          </button>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="building" size={16} /></i> Active</div>
          <div className="v">{activeVendors.length}</div>
          <div className="d">Current vendors</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="archive" size={16} /></i> Archived</div>
          <div className="v">{items.length - activeVendors.length}</div>
          <div className="d">Past vendors</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Expiring Soon</div>
          <div className="v">
            {activeVendors.filter((r: any) => {
              const end = r.data?.contract_end_date
              if (!end) return false
              const diff = new Date(end).getTime() - Date.now()
              return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
            }).length}
          </div>
          <div className="d">Within 30 days</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Add Vendor</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Vendor Name</span>
                <input className="input" placeholder="e.g. ABC Staffing Solutions" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="staffing">Staffing / Recruitment</option>
                  <option value="it_services">IT Services</option>
                  <option value="facilities">Facilities Management</option>
                  <option value="payroll">Payroll / Benefits</option>
                  <option value="training">Training / L&D</option>
                  <option value="legal">Legal / Compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Contact Person</span>
                <input className="input" placeholder="Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Contact Email</span>
                <input className="input" type="email" placeholder="email@vendor.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="field">
                <span>Phone</span>
                <input className="input" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <span>Contract End Date</span>
              <input className="input" type="date" value={contractEnd} onChange={(e) => setContractEnd(e.target.value)} />
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Saving…' : 'Save Vendor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card mt">
        <h3>Vendor Directory</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Contract End</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any) => (
                <tr key={r.id}>
                  <td><b>{r.data?.name ?? '—'}</b></td>
                  <td style={{ textTransform: 'capitalize' }}>{(r.data?.category ?? '').replace('_', ' ')}</td>
                  <td>
                    {r.data?.contact_name}
                    {r.data?.contact_email && <span className="muted"> · {r.data.contact_email}</span>}
                  </td>
                  <td>{r.data?.contract_end_date ?? '—'}</td>
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
                    No vendors registered yet.
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
