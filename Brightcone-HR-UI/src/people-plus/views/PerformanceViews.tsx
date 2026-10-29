import React, { useState } from 'react'
import { useEmployees, useReferences } from '@/features/people/api'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'

export const PerformanceViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')

  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const catalog = useRecordCatalog(allowed)

  const hasGoalType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'goal') ?? false
  const hasReviewType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'review') ?? false

  const goals = useRecords('goal', allowed && hasGoalType)
  const reviews = useRecords('review', allowed && hasReviewType)

  const [tab, setTab] = useState<'goals' | 'reviews' | 'overview'>('overview')

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const goalList = (goals.data as { items?: unknown[] })?.items ?? []
  const reviewList = (reviews.data as { items?: unknown[] })?.items ?? []

  const activeCount = empList.filter((e) => e.status === 'active').length
  const probationCount = empList.filter((e) => e.status === 'probation').length

  if (employees.isLoading) {
    return <div className="loader">Loading performance data…</div>
  }

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Performance & Career</div>
          <h1>Performance Management</h1>
          <p>Track goals, run appraisal cycles, and manage reviews — all from live API data.</p>
        </div>
      </div>

      <div className="tabs mb">
        <button className={tab === 'overview' ? 'on' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'goals' ? 'on' : ''} onClick={() => setTab('goals')}>
          Goals & OKRs ({goalList.length})
        </button>
        <button className={tab === 'reviews' ? 'on' : ''} onClick={() => setTab('reviews')}>
          Reviews ({reviewList.length})
        </button>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid g4 mt">
            <div className="card stat">
              <div className="k"><i><Icon name="users" size={16} /></i> Active</div>
              <div className="v">{activeCount}</div>
              <div className="d">Eligible for review</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="clock" size={16} /></i> On Probation</div>
              <div className="v">{probationCount}</div>
              <div className="d">Review at probation end</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="chart" size={16} /></i> Goals</div>
              <div className="v">{goalList.length}</div>
              <div className="d">{hasGoalType ? 'From records API' : 'Record type not configured'}</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="star" size={16} /></i> Reviews</div>
              <div className="v">{reviewList.length}</div>
              <div className="d">{hasReviewType ? 'From records API' : 'Record type not configured'}</div>
            </div>
          </div>

          <div className="card mt">
            <h3>Employees by Department</h3>
            <p className="muted" style={{ marginBottom: 14 }}>
              Performance review assignments by department.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Headcount</th>
                    <th>Active</th>
                    <th>Probation</th>
                  </tr>
                </thead>
                <tbody>
                  {deptList.map((d) => {
                    const members = empList.filter((e) => e.department_id === d.id)
                    const active = members.filter((e) => e.status === 'active').length
                    const prob = members.filter((e) => e.status === 'probation').length
                    return (
                      <tr key={d.id}>
                        <td><b>{d.label}</b></td>
                        <td>{members.length}</td>
                        <td><span className="pill p-ok">{active}</span></td>
                        <td>
                          {prob > 0
                            ? <span className="pill p-warn">{prob}</span>
                            : <span className="muted">0</span>}
                        </td>
                      </tr>
                    )
                  })}
                  {deptList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                        No departments configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'goals' && (
        <div className="card mt">
          {!hasGoalType ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="chart" size={32} />
              <h3 style={{ marginTop: 12 }}>Goal tracking not configured</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Create a "goal" record type via the Records API to enable goal tracking.
                Goals will appear here automatically once the record type is configured.
              </p>
            </div>
          ) : (
            <>
              <h3>Goals & OKRs</h3>
              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Goal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalList.map((g: any) => (
                      <tr key={g.id}>
                        <td><b>{g.data?.title ?? g.id}</b></td>
                        <td>
                          <span className={`pill ${g.archived ? 'p-bad' : 'p-ok'}`}>
                            {g.archived ? 'Archived' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {goalList.length === 0 && (
                      <tr>
                        <td colSpan={2} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                          No goals created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="card mt">
          {!hasReviewType ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Icon name="star" size={32} />
              <h3 style={{ marginTop: 12 }}>Review cycles not configured</h3>
              <p className="muted" style={{ marginTop: 8 }}>
                Create a "review" record type via the Records API to enable appraisal tracking.
                Review records will appear here once configured.
              </p>
            </div>
          ) : (
            <>
              <h3>Appraisal Reviews</h3>
              <div className="table-wrap" style={{ marginTop: 14 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Review</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewList.map((r: any) => (
                      <tr key={r.id}>
                        <td><b>{r.data?.title ?? r.id}</b></td>
                        <td>
                          <span className={`pill ${r.archived ? 'p-bad' : 'p-ok'}`}>
                            {r.archived ? 'Complete' : 'In progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {reviewList.length === 0 && (
                      <tr>
                        <td colSpan={2} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                          No reviews created yet.
                        </td>
                      </tr>
                    )}
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
