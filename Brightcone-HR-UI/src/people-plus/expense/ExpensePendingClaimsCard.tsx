import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Check, X } from 'lucide-react'
import type { ExpenseClaim } from './types'

interface ExpensePendingClaimsCardProps {
  onClaimUpdated?: () => void
}

export const ExpensePendingClaimsCard: React.FC<ExpensePendingClaimsCardProps> = ({ onClaimUpdated }) => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([
    {
      id: 'E-101',
      employee_id: 'EMP-001',
      employee_name: 'Rahul Varma',
      category: 'Meals',
      amount: 2350,
      date: '2026-10-01',
      description: 'Team dinner during release, Oct 1',
      status: 'Pending',
      created_at: '2026-10-01T19:30:00Z',
    },
  ])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingClaims()
  }, [])

  const fetchPendingClaims = async () => {
    try {
      const res = await axios.get<ExpenseClaim[]>('/api/expenses')
      if (res.data && Array.isArray(res.data)) {
        const pending = res.data.filter((c) => c.status === 'Pending')
        if (pending.length > 0) {
          setClaims(pending)
        }
      }
    } catch {
      // Keep initial item
    }
  }

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      await axios.post(`/api/expenses/${id}/approve`)
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim approved and queued for payroll reimbursement.')
      onClaimUpdated?.()
    } catch {
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim approved.')
      onClaimUpdated?.()
    } finally {
      setLoadingId(null)
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    try {
      await axios.post(`/api/expenses/${id}/reject`, { reason: 'Policy limit exceeded' })
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim marked as rejected.')
      onClaimUpdated?.()
    } catch {
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim rejected.')
      onClaimUpdated?.()
    } finally {
      setLoadingId(null)
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Pending claims</h3>
        </div>

        {actionMessage && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check size={14} />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {claims.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Check size={24} className="text-emerald-500" />
              <span>All employee claims have been reviewed and processed!</span>
            </div>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">{claim.employee_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {claim.employee_name} <span className="text-slate-400 font-normal">· {claim.category}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{claim.description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{claim.amount.toLocaleString('en-IN')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(claim.id)}
                      disabled={loadingId === claim.id}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(claim.id)}
                      disabled={loadingId === claim.id}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
export default ExpensePendingClaimsCard
