import React, { useState } from 'react'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const RecruitViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasJobType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'job') ?? false
  const hasCandType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'candidate') ?? false

  const jobs = useRecords('job', allowed && hasJobType)
  const candidates = useRecords('candidate', allowed && hasCandType)

  const [tab, setTab] = useState<'pipeline' | 'jobs'>('pipeline')

  const jobList = (jobs.data as { items?: any[] })?.items ?? []
  const candList = (candidates.data as { items?: any[] })?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Recruitment & ATS</div>
          <h1>Recruit & Applicant Tracking</h1>
          <p>Candidate pipeline, interview scheduling, and offer management.</p>
        </div>
      </div>

      <div className="tabs mb">
        <button className={tab === 'pipeline' ? 'on' : ''} onClick={() => setTab('pipeline')}>
          Pipeline ({candList.length})
        </button>
        <button className={tab === 'jobs' ? 'on' : ''} onClick={() => setTab('jobs')}>
          Open positions ({jobList.length})
        </button>
      </div>

      {tab === 'pipeline' && (
        <div className="card mt">
          {!hasCandType ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="briefcase" size={32} />
              <h3 style={{ marginTop: 12 }}>Candidate tracking not configured</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Create a "candidate" record type via the Records API to enable the ATS pipeline.
                Candidates will appear here automatically once configured.
              </p>
            </div>
          ) : candList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="users" size={32} />
              <h3 style={{ marginTop: 12 }}>No candidates yet</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Add candidate records via the API to populate the pipeline.
              </p>
            </div>
          ) : (
            <>
              <h3>Candidate Pipeline</h3>
              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candList.map((c: any) => (
                      <tr key={c.id}>
                        <td><b>{c.data?.name ?? c.id}</b></td>
                        <td>
                          <span className={`pill ${c.archived ? 'p-bad' : 'p-ok'}`}>
                            {c.data?.stage ?? (c.archived ? 'Archived' : 'Active')}
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
      )}

      {tab === 'jobs' && (
        <div className="card mt">
          {!hasJobType ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="briefcase" size={32} />
              <h3 style={{ marginTop: 12 }}>Job postings not configured</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Create a "job" record type via the Records API to manage open positions.
              </p>
            </div>
          ) : jobList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="briefcase" size={32} />
              <h3 style={{ marginTop: 12 }}>No open positions</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Add job records via the API to list open positions.
              </p>
            </div>
          ) : (
            <>
              <h3>Open Positions</h3>
              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobList.map((j: any) => (
                      <tr key={j.id}>
                        <td><b>{j.data?.title ?? j.id}</b></td>
                        <td>
                          <span className={`pill ${j.archived ? 'p-bad' : 'p-ok'}`}>
                            {j.archived ? 'Closed' : 'Open'}
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
      )}
    </div>
  )
}
