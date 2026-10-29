import React from 'react'
import { useRules, useRuleMetrics } from '@/features/advanced-hr/api'
import { useEmployees } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const SuiteAdminViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const rules = useRules(allowed)
  const metrics = useRuleMetrics(allowed)

  const empList = employees.data ?? []
  const ruleList = rules.data ?? []
  const m = metrics.data

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Suite Administration</div>
          <h1>Governance & Configuration</h1>
          <p>System rules, compliance metrics, and administration overview.</p>
        </div>
      </div>

      <div className="grid g3 mt">
        <div className="card stat">
          <div className="k"><i><Icon name="users" size={16} /></i> Employees</div>
          <div className="v">{empList.length}</div>
          <div className="d">From People API</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="shield" size={16} /></i> Rules</div>
          <div className="v">{ruleList.length}</div>
          <div className="d">{ruleList.filter((r) => r.enabled).length} enabled</div>
        </div>
        <div className="card stat">
          <div className="k"><i><Icon name="chart" size={16} /></i> Rule Events</div>
          <div className="v">{m ? m.complete + m.pending + m.failed : 0}</div>
          <div className="d">{m ? `${m.complete} ok, ${m.failed} failed` : 'Loading…'}</div>
        </div>
      </div>

      <div className="card mt">
        <h3>Automation Rules</h3>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Status</th>
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
                </tr>
              ))}
              {ruleList.length === 0 && (
                <tr>
                  <td colSpan={2} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                    No automation rules configured yet.
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
