import React from 'react'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const SignViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasEnvelopeType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'envelope') ?? false

  const envelopes = useRecords('envelope', allowed && hasEnvelopeType)
  const envList = (envelopes.data as { items?: any[] })?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Sign & Compliance</div>
          <h1>E-Signature & Documents</h1>
          <p>Digital employment contracts, legally binding e-signatures, and document templates.</p>
        </div>
      </div>

      <div className="card mt">
        {!hasEnvelopeType ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="pen" size={32} />
            <h3 style={{ marginTop: 12 }}>E-signature not configured</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Create an "envelope" record type via the Records API to enable digital signatures.
              Signature requests will appear here once configured.
            </p>
          </div>
        ) : envList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="pen" size={32} />
            <h3 style={{ marginTop: 12 }}>No signature requests</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Create envelope records via the API to send signature requests.
            </p>
          </div>
        ) : (
          <>
            <h3>Signature Envelopes</h3>
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {envList.map((env: any) => (
                    <tr key={env.id}>
                      <td><b>{env.data?.title ?? env.id}</b></td>
                      <td>
                        <span className={`pill ${env.archived ? 'p-ok' : 'p-warn'}`}>
                          {env.data?.status ?? (env.archived ? 'Completed' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
