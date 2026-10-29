import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord, useArchiveRecord } from '@/features/records/api'
import { useEmployees } from './api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { todayISO } from '@/people-plus/helpers'

const ASSET_CATEGORIES = [
  { key: 'laptop', label: 'Laptop', icon: 'laptop' },
  { key: 'desktop', label: 'Desktop', icon: 'laptop' },
  { key: 'monitor', label: 'Monitor', icon: 'laptop' },
  { key: 'phone', label: 'Mobile Phone', icon: 'chat' },
  { key: 'headset', label: 'Headset / Peripherals', icon: 'chat' },
  { key: 'furniture', label: 'Furniture', icon: 'building' },
  { key: 'vehicle', label: 'Vehicle', icon: 'building' },
  { key: 'software', label: 'Software License', icon: 'gear' },
  { key: 'other', label: 'Other', icon: 'building' },
] as const

type AssetItem = {
  id: string
  data?: {
    asset_tag?: string
    name?: string
    category?: string
    assigned_to?: string
    serial_number?: string
    purchase_date?: string
    warranty_end?: string
    condition?: string
    status?: string
    notes?: string
  }
  archived?: boolean
}

export const AssetsAdminPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'employee_asset') ?? false

  const records = useRecords('employee_asset', allowed && hasType)
  const createRecord = useCreateRecord('employee_asset')
  const archiveRecord = useArchiveRecord('employee_asset')

  const empList = employees.data ?? []
  const items = ((records.data as { items?: AssetItem[] })?.items ?? []) as AssetItem[]

  const [tab, setTab] = useState<'active' | 'retired' | 'all'>('active')
  const [showForm, setShowForm] = useState(false)
  const [assetTag, setAssetTag] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('laptop')
  const [assignedTo, setAssignedTo] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(todayISO())
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [condition, setCondition] = useState('new')

  const activeAssets = items.filter((r) => !r.archived)
  const retiredAssets = items.filter((r) => r.archived)

  const expiringWarranty = activeAssets.filter((r) => {
    const end = r.data?.warranty_end
    if (!end) return false
    const diff = new Date(end).getTime() - Date.now()
    return diff > 0 && diff < 60 * 24 * 60 * 60 * 1000
  })

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id || 'Unassigned'
  }

  const getCatLabel = (key: string) =>
    ASSET_CATEGORIES.find((c) => c.key === key)?.label ?? key

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        asset_tag: assetTag,
        name,
        category,
        assigned_to: assignedTo || null,
        serial_number: serialNumber || null,
        purchase_date: purchaseDate,
        warranty_end: warrantyEnd || null,
        condition,
        status: 'active',
      },
    })
    setShowForm(false)
    setAssetTag('')
    setName('')
    setSerialNumber('')
    setWarrantyEnd('')
  }

  const filteredItems = tab === 'active' ? activeAssets
    : tab === 'retired' ? retiredAssets
    : items

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">Operations</div>
            <h1>Assets & Equipment</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="laptop" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create an "asset" record type in the Records API to track laptops, equipment, and devices.
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
          <h1>Assets & Equipment</h1>
          <p>Track laptops, devices, licenses, and equipment assignments.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="plus" size={16} /> Register asset
          </button>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="laptop" size={16} /></i> Active</div>
          <div className="v">{activeAssets.length}</div>
          <div className="d">In use</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="archive" size={16} /></i> Retired</div>
          <div className="v">{retiredAssets.length}</div>
          <div className="d">Decommissioned</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Assigned</div>
          <div className="v">{activeAssets.filter((r) => r.data?.assigned_to).length}</div>
          <div className="d">To employees</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="clock" size={16} /></i> Warranty Expiring</div>
          <div className="v">{expiringWarranty.length}</div>
          <div className="d">Within 60 days</div>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Register New Asset</h3>
          <form onSubmit={handleCreate}>
            <div className="frow">
              <div className="field">
                <span>Asset Tag</span>
                <input className="input" placeholder="e.g. LAP-0042" value={assetTag} onChange={(e) => setAssetTag(e.target.value)} required />
              </div>
              <div className="field">
                <span>Name / Description</span>
                <input className="input" placeholder="e.g. MacBook Pro 16 M3" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Assigned To</span>
                <select className="input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Serial Number</span>
                <input className="input" placeholder="Optional" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
              </div>
            </div>
            <div className="frow">
              <div className="field">
                <span>Purchase Date</span>
                <input className="input" type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
              </div>
              <div className="field">
                <span>Warranty End</span>
                <input className="input" type="date" value={warrantyEnd} onChange={(e) => setWarrantyEnd(e.target.value)} />
              </div>
              <div className="field">
                <span>Condition</span>
                <select className="input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs_repair">Needs Repair</option>
                </select>
              </div>
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Registering…' : 'Register Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tabs mb mt">
        <button className={tab === 'active' ? 'on' : ''} onClick={() => setTab('active')}>
          Active ({activeAssets.length})
        </button>
        <button className={tab === 'retired' ? 'on' : ''} onClick={() => setTab('retired')}>
          Retired ({retiredAssets.length})
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
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Assigned To</th>
                <th>Condition</th>
                <th>Warranty</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => {
                const d = r.data ?? {}
                const warrantyExpired = d.warranty_end && new Date(d.warranty_end) < new Date()
                return (
                  <tr key={r.id}>
                    <td><code>{d.asset_tag ?? '—'}</code></td>
                    <td><b>{d.name ?? '—'}</b></td>
                    <td>{getCatLabel(d.category ?? '')}</td>
                    <td>{getEmpName(d.assigned_to ?? '')}</td>
                    <td style={{ textTransform: 'capitalize' }}>{(d.condition ?? '').replace('_', ' ')}</td>
                    <td>
                      {d.warranty_end ? (
                        <span className={`pill ${warrantyExpired ? 'p-bad' : 'p-ok'}`}>
                          {warrantyExpired ? 'Expired' : d.warranty_end}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`pill ${r.archived ? 'p-bad' : 'p-ok'}`}>
                        {r.archived ? 'Retired' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {!r.archived && (
                        <button className="btn sm" onClick={() => archiveRecord.mutate(r.id)}>
                          Retire
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No assets found in this view.
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
