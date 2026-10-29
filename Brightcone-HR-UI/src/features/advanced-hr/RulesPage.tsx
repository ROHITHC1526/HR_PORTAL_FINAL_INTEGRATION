import React from 'react'
import { useRules, useRuleMetrics, useUpdateRule } from './api'
import { AdvancedHrErrorBoundary } from './ErrorBoundary'
import { Icon } from '@/people-plus/Icon'

function RulesContent() {
  const rules = useRules(true)
  const metrics = useRuleMetrics(true)
  const updateRule = useUpdateRule()

  if (rules.isLoading) {
    return <div className="loader">Loading rules…</div>
  }

  if (rules.error) {
    return (
      <section className="glass" style={{ maxWidth: 720, margin: '48px auto', padding: 32 }}>
        <h2>Could not load rules</h2>
        <p className="muted">The rules API is not reachable.</p>
      </section>
    )
  }

  const ruleList = rules.data ?? []
  const m = metrics.data

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Advanced HR</div>
          <h1>Rules & Notifications</h1>
          <p>Configure automated rules and view notification dispatch metrics.</p>
        </div>
      </div>

      {m && (
        <div className="grid g3 mt">
          <div className="card stat">
            <div className="k"><i><Icon name="clock" size={16} /></i> Pending</div>
            <div className="v">{m.pending}</div>
          </div>
          <div className="card stat">
            <div className="k"><i><Icon name="shield" size={16} /></i> Complete</div>
            <div className="v">{m.complete}</div>
          </div>
          <div className="card stat">
            <div className="k"><i><Icon name="bell" size={16} /></i> Failed</div>
            <div className="v">{m.failed}</div>
          </div>
        </div>
      )}

      <div className="card mt">
        <h3>Automation Rules</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td>
                    <button
                      className="btn sm ib"
                      title={r.enabled ? 'Disable' : 'Enable'}
                      onClick={() => updateRule.mutate({
                        key: r.rule_key,
                        payload: { enabled: !r.enabled },
                      })}
                    >
                      <Icon name={r.enabled ? 'lock' : 'unlock'} size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {ruleList.length === 0 && (
                <tr><td colSpan={3} className="muted" style={{ textAlign: 'center' }}>No rules configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export const RulesPage: React.FC = () => (
  <AdvancedHrErrorBoundary>
    <RulesContent />
  </AdvancedHrErrorBoundary>
)
