import React from 'react'
import { useEmployees, useReferences } from '@/features/people/api'
import { useRules, useRuleMetrics, useUpdateRule } from '@/features/advanced-hr/api'
import { useRecords } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { usePeoplePlus } from '../people-plus-context'
import { Icon } from '../Icon'

const fieldText = (data: unknown, key: string, fallback: string) => {
  if (!data || typeof data !== 'object') return fallback
  const value = (data as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : fallback
}

export const AdvancedHrViews: React.FC = () => {
  const { can } = useAuth()
  const { activeView } = usePeoplePlus()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)
  const rules = useRules(allowed)
  const metrics = useRuleMetrics(allowed)
  const updateRule = useUpdateRule()
  const recognitions = useRecords('recognition', allowed && activeView === 'm_eng')
  const surveys = useRecords('survey', allowed && activeView === 'm_eng')
  const compliance = useRecords('compliance_item', allowed && activeView === 'm_comp')

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const locList = locations.data ?? []
  const ruleList = rules.data ?? []
  const m = metrics.data

  const totalEmployees = empList.filter((e) => ['active', 'on_leave', 'probation', 'notice'].includes(e.status)).length
  const probationCount = empList.filter((e) => e.status === 'probation').length
  const noticeCount = empList.filter((e) => e.status === 'notice').length

  if (!allowed) return <div className="card" role="alert">Your account does not have access to HR analytics.</div>
  if (employees.isLoading) {
    return <div className="loader">Loading workforce data…</div>
  }
  if (activeView === 'm_wfa' && (employees.error || departments.error || locations.error)) return <div className="card" role="alert">Could not load workforce analytics. Check People API availability and permissions.</div>
  if (activeView === 'm_eng' && (recognitions.error || surveys.error)) return <div className="card" role="alert">Could not load engagement records. Check Records API availability and permissions.</div>
  if (activeView === 'm_comp' && (rules.error || metrics.error || compliance.error)) return <div className="card" role="alert">Could not load compliance data. Check Rules and Records API availability.</div>

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Advanced HR Operations</div>
          <h1>{activeView === 'm_eng' ? 'Engagement Analytics' : activeView === 'm_comp' ? 'HR Compliance Dashboard' : 'Workforce Analytics'}</h1>
          <p>{activeView === 'm_eng' ? 'Live counts from recognition and survey records.' : activeView === 'm_comp' ? 'Rule status and event metrics from the connected backend.' : 'Workforce distribution from employee and reference APIs.'}</p>
        </div>
      </div>

      {activeView === 'm_eng' ? (
        <div className="grid g2 mt">
          <div className="card stat"><div className="k">Recorded recognition</div><div className="v">{recognitions.data?.items.length ?? 0}</div><div className="d">Persisted recognition records</div></div>
          <div className="card stat"><div className="k">Survey records</div><div className="v">{surveys.data?.items.length ?? 0}</div><div className="d">Persisted survey records</div></div>
          {!recognitions.isLoading && !surveys.isLoading && !recognitions.error && !surveys.error && !recognitions.data?.items.length && !surveys.data?.items.length ? <div className="card muted">No engagement records are stored yet. Counts remain zero until HR records recognition or survey activity.</div> : null}
        </div>
      ) : activeView !== 'm_comp' ? (
        <>
          <div className="grid g4 mt">
            <div className="card stat">
              <div className="k"><i><Icon name="users" size={16} /></i> Active Workforce</div>
              <div className="v">{totalEmployees}</div>
              <div className="d">Live from People API</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="clock" size={16} /></i> On Probation</div>
              <div className="v">{probationCount}</div>
              <div className="d">Filtered by status</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="swap" size={16} /></i> Serving Notice</div>
              <div className="v">{noticeCount}</div>
              <div className="d">Planned transitions</div>
            </div>
            <div className="card stat">
              <div className="k"><i><Icon name="chart" size={16} /></i> Departments</div>
              <div className="v">{deptList.length}</div>
              <div className="d">Active departments</div>
            </div>
          </div>

          <div className="grid g2 mt">
            <div className="card">
              <h3>Department Distribution</h3>
              <div className="dept-bars wide" style={{ marginTop: 14 }}>
                {deptList.map((d) => {
                  const count = empList.filter((e) => e.department_id === d.id).length
                  const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
                  return (
                    <div key={d.id} className="r">
                      <span>{d.label}</span>
                      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                      <em>{count} ({pct}%)</em>
                    </div>
                  )
                })}
                {deptList.length === 0 && (
                  <p className="muted">No departments configured yet.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h3>Location Distribution</h3>
              <div className="dept-bars wide" style={{ marginTop: 14 }}>
                {locList.map((loc) => {
                  const count = empList.filter((e) => e.location_id === loc.id).length
                  const pct = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
                  return (
                    <div key={loc.id} className="r">
                      <span>{loc.label}</span>
                      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                      <em>{count}</em>
                    </div>
                  )
                })}
                {locList.length === 0 && (
                  <p className="muted">No locations configured yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )
      : (
        <>
        <div className="card mt">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3>Automation Rules & Metrics</h3>
              <span className="muted">Rule engine status from the connected backend</span>
            </div>
            {m && (
              <div style={{ display: 'flex', gap: 12 }}>
                <span className="pill p-ok">{m.complete} complete</span>
                <span className="pill p-warn">{m.pending} pending</span>
                <span className="pill p-bad">{m.failed} failed</span>
              </div>
            )}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Status</th>
                  <th>Control</th>
                </tr>
              </thead>
              <tbody>
                {ruleList.map((r) => (
                  <tr key={r.rule_key}>
                    <td><b>{r.rule_key.replace(/_/g, ' ')}</b></td>
                    <td>
                      <span className={`pill ${r.enabled ? 'p-ok' : 'p-bad'}`}>
                        {r.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td><button className="btn sm" onClick={() => updateRule.mutate({ key: r.rule_key, payload: { enabled: !r.enabled } })}>{r.enabled ? 'Disable' : 'Enable'}</button></td>
                  </tr>
                ))}
                {ruleList.length === 0 && (
                  <tr><td colSpan={3} className="muted" style={{ textAlign: 'center' }}>
                    No rules configured — rules will appear as they are added via the API.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          {updateRule.error && <p role="alert">Could not update this rule. Refresh and check your permissions.</p>}
        </div>
        <div className="card mt">
          <h3>Compliance records</h3>
          {compliance.error && <p role="alert">Could not load compliance records. Check Records permission and API availability.</p>}
          <div className="table-wrap"><table><thead><tr><th>Item</th><th>Status</th><th>Updated</th></tr></thead><tbody>
            {(compliance.data?.items ?? []).map((item) => <tr key={item.id}><td>{fieldText(item.data, 'name', item.source_id)}</td><td>{fieldText(item.data, 'status', 'unknown')}</td><td>{item.updated_at.slice(0, 10)}</td></tr>)}
            {!compliance.isLoading && !compliance.error && !compliance.data?.items.length && <tr><td colSpan={3} className="muted">No compliance records stored.</td></tr>}
          </tbody></table></div>
        </div>
        </>
      )}
    </div>
  )
}
