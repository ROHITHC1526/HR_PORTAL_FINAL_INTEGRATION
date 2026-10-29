import React from 'react'
import { useRecords, useRecordCatalog } from '@/features/records/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'

export const ExpenseViews: React.FC = () => {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const catalog = useRecordCatalog(allowed)

  const hasExpenseType = (catalog.data as { record_types?: { key: string }[] })
    ?.record_types?.some((t) => t.key === 'expense') ?? false

  const expenses = useRecords('expense', allowed && hasExpenseType)
  const expenseList = (expenses.data as { items?: any[] })?.items ?? []

  return (
    <div className="view">
      <div className="head">
        <div>
          <div className="eyebrow">Expense & Finance</div>
          <h1>Expense Management</h1>
          <p>Reimbursement claims, approvals, and operational expenditure tracking.</p>
        </div>
      </div>

      <div className="card mt">
        {!hasExpenseType ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="receipt" size={32} />
            <h3 style={{ marginTop: 12 }}>Expense tracking not configured</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Create an "expense" record type via the Records API to enable claim management.
              Expense records will appear here once configured.
            </p>
          </div>
        ) : expenseList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Icon name="receipt" size={32} />
            <h3 style={{ marginTop: 12 }}>No expense claims</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              Submit expense records via the API to see claims here.
            </p>
          </div>
        ) : (
          <>
            <h3>Expense Claims</h3>
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Claim</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseList.map((ex: any) => (
                    <tr key={ex.id}>
                      <td><b>{ex.data?.description ?? ex.id}</b></td>
                      <td>
                        <span className={`pill ${ex.archived ? 'p-bad' : 'p-ok'}`}>
                          {ex.data?.status ?? (ex.archived ? 'Closed' : 'Pending')}
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
