import React, { useState } from 'react'
import { useRecordCatalog, useRecords, type Record } from './api'
import { RecordsErrorBoundary } from './ErrorBoundary'
import { Icon } from '@/people-plus/Icon'

function RecordsContent() {
  const [selectedType, setSelectedType] = useState<string>('')
  const catalog = useRecordCatalog(true)
  const records = useRecords(selectedType, !!selectedType)

  if (catalog.isLoading) {
    return <div className="loader">Loading record types…</div>
  }

  if (catalog.error) {
    return (
      <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
        <h2>Could not load record types</h2>
        <p className="muted">The records API is not reachable.</p>
      </section>
    )
  }

  const types = catalog.data?.record_types ?? []
  const items: Record[] = records.data?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Records Module</div>
          <h1>Records Management</h1>
          <p>Structured records for compliance, configuration, and operational data.</p>
        </div>
      </div>

      <div className="tabs mb">
        {types.map((t) => (
          <button
            key={t.key}
            className={selectedType === t.key ? 'on' : ''}
            onClick={() => setSelectedType(t.key)}
          >
            {t.key.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {!selectedType && (
        <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
          <p className="muted">Select a record type above to view its entries.</p>
        </section>
      )}

      {selectedType && records.isLoading && (
        <div className="loader">Loading records…</div>
      )}

      {selectedType && !records.isLoading && (
        <div className="card mt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>{selectedType.replace(/_/g, ' ')} ({items.length})</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source ID</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td><span className="muted">{r.source_id}</span></td>
                    <td>{r.created_at.slice(0, 10)}</td>
                    <td>{r.updated_at.slice(0, 10)}</td>
                    <td>
                      <span className={`pill ${r.archived_at ? 'p-bad' : 'p-ok'}`}>
                        {r.archived_at ? 'Archived' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button className="btn sm ib" title="View data">
                        <Icon name="eye" size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="muted" style={{ textAlign: 'center' }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export const RecordsPage: React.FC = () => (
  <RecordsErrorBoundary>
    <RecordsContent />
  </RecordsErrorBoundary>
)
