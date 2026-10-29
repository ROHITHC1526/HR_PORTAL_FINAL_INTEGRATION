import React, { useState } from 'react'
import { useRecordCatalog, useRecords, useCreateRecord } from '@/features/records/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '@/people-plus/Icon'
import { avatarColor, initials } from '@/people-plus/helpers'

export const RecognitionPage: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)
  const employees = useEmployees(allowed)

  const hasType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'recognition') ?? false

  const records = useRecords('recognition', allowed && hasType)
  const createRecord = useCreateRecord('recognition')

  const empList = employees.data ?? []
  const items = (records.data as { items?: any[] })?.items ?? []

  const [showForm, setShowForm] = useState(false)
  const [recipientId, setRecipientId] = useState('')
  const [category, setCategory] = useState('kudos')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createRecord.mutateAsync({
      data: {
        recipient_id: recipientId,
        category,
        message,
        given_at: new Date().toISOString().slice(0, 10),
      },
    })
    setShowForm(false)
    setRecipientId('')
    setMessage('')
  }

  const getEmpName = (id: string) => {
    const emp = empList.find((e) => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : id
  }

  const categoryLabels: Record<string, string> = {
    kudos: 'Kudos',
    innovation: 'Innovation Award',
    teamwork: 'Team Player',
    leadership: 'Leadership',
    customer: 'Customer Champion',
  }

  if (!hasType) {
    return (
      <div className="view">
        <div className="head">
          <div>
            <div className="eyebrow">People</div>
            <h1>Employee Recognition</h1>
          </div>
        </div>
        <div className="card mt" style={{ textAlign: 'center', padding: 40 }}>
          <Icon name="star" size={32} />
          <h3 style={{ marginTop: 12 }}>Record type not configured</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            Create a "recognition" record type in the Records API to enable peer recognition.
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
          <h1>Employee Recognition</h1>
          <p>Peer-to-peer kudos, awards, and employee appreciation.</p>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            <Icon name="star" size={16} /> Give recognition
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mt">
          <h3>Give Recognition</h3>
          <form onSubmit={handleSubmit}>
            <div className="frow">
              <div className="field">
                <span>Recipient</span>
                <select className="input" value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required>
                  <option value="">Select employee</option>
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <span>Category</span>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="kudos">Kudos</option>
                  <option value="innovation">Innovation Award</option>
                  <option value="teamwork">Team Player</option>
                  <option value="leadership">Leadership</option>
                  <option value="customer">Customer Champion</option>
                </select>
              </div>
            </div>
            <div className="field">
              <span>Message</span>
              <textarea
                className="input"
                rows={3}
                placeholder="What did they do that deserves recognition?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div className="mfoot">
              <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createRecord.isPending}>
                {createRecord.isPending ? 'Sending…' : 'Send Recognition'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="star" size={16} /></i> Total</div>
          <div className="v">{items.length}</div>
          <div className="d">Recognitions given</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Recipients</div>
          <div className="v">{new Set(items.map((r: any) => r.data?.recipient_id)).size}</div>
          <div className="d">Unique people recognized</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> This month</div>
          <div className="v">
            {items.filter((r: any) => {
              const d = r.data?.given_at
              if (!d) return false
              const now = new Date()
              return d.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
            }).length}
          </div>
          <div className="d">Given this month</div>
        </div>
      </div>

      <div className="card mt">
        <h3>Recognition Wall</h3>
        {items.length === 0 ? (
          <p className="muted" style={{ padding: 24, textAlign: 'center' }}>
            No recognitions yet. Be the first to appreciate a colleague!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {items.map((r: any) => {
              const recipientName = getEmpName(r.data?.recipient_id ?? '')
              return (
                <div key={r.id} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="av" style={{ background: avatarColor(recipientName) }}>
                      {initials(recipientName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b>{recipientName}</b>
                        <span className="pill p-ok">
                          {categoryLabels[r.data?.category] ?? r.data?.category}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0' }}>{r.data?.message}</p>
                      <span className="muted" style={{ fontSize: 12 }}>{r.data?.given_at}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
