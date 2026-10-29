import React from 'react'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const WorkplaceViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasAssetType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'asset') ?? false
  const hasTicketType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'ticket') ?? false

  const assets = useRecords('asset', allowed && hasAssetType)
  const tickets = useRecords('ticket', allowed && hasTicketType)

  const assetList = (assets.data as { items?: any[] })?.items ?? []
  const ticketList = (tickets.data as { items?: any[] })?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Workplace & Service</div>
          <h1>Workplace & Helpdesk</h1>
          <p>IT asset allocations, employee service tickets, and workplace operations.</p>
        </div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <h3>IT Assets & Devices</h3>
          {!hasAssetType ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Icon name="laptop" size={28} />
              <p className="muted" style={{ marginTop: 8 }}>
                Create an "asset" record type to track hardware and devices.
              </p>
            </div>
          ) : assetList.length === 0 ? (
            <p className="muted" style={{ padding: 24, textAlign: 'center' }}>
              No assets registered yet.
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assetList.map((a: any) => (
                    <tr key={a.id}>
                      <td><b>{a.data?.name ?? a.id}</b></td>
                      <td>
                        <span className={`pill ${a.archived ? 'p-bad' : 'p-ok'}`}>
                          {a.archived ? 'Retired' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Support Tickets</h3>
          {!hasTicketType ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Icon name="chat" size={28} />
              <p className="muted" style={{ marginTop: 8 }}>
                Create a "ticket" record type to enable the helpdesk queue.
              </p>
            </div>
          ) : ticketList.length === 0 ? (
            <p className="muted" style={{ padding: 24, textAlign: 'center' }}>
              No support tickets filed yet.
            </p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketList.map((t: any) => (
                    <tr key={t.id}>
                      <td><b>{t.data?.subject ?? t.id}</b></td>
                      <td>
                        <span className={`pill ${t.archived ? 'p-ok' : 'p-warn'}`}>
                          {t.data?.status ?? (t.archived ? 'Resolved' : 'Open')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
