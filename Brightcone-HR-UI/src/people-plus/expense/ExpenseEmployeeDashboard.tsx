import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Receipt, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { NewClaimModal } from './NewClaimModal'
import type { ExpenseClaim } from './types'

export const ExpenseEmployeeDashboard: React.FC = () => {
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [claims, setClaims] = useState<ExpenseClaim[]>([
    {
      id: 'E-101',
      employee_id: user?.pid ?? '',
      employee_name: user?.name ?? 'Employee',
      category: 'Travel',
      amount: 3450,
      date: '2026-10-12',
      description: 'Client visit cab fare and regional rail',
      receipt_url: '/receipts/cab-101.pdf',
      status: 'Approved',
      created_at: '2026-10-12T09:30:00Z',
    },
    {
      id: 'E-102',
      employee_id: user?.pid ?? '',
      employee_name: user?.name ?? 'Employee',
      category: 'Internet',
      amount: 1499,
      date: '2026-10-05',
      description: 'Monthly broadband reimbursement - WFH',
      receipt_url: '/receipts/broadband-oct.pdf',
      status: 'Paid',
      created_at: '2026-10-05T10:15:00Z',
    },
  ])

  useEffect(() => {
    fetchMyClaims()
  }, [])

  const fetchMyClaims = async () => {
    try {
      const res = await axios.get<ExpenseClaim[]>('/api/expenses')
      if (res.data && res.data.length > 0) {
        // Filter claims strictly to this user by pid or by name match.
        // Do NOT fall back to a generic 'EMP-001' — show only this user's claims.
        const myClaims = res.data.filter(
          (c) =>
            (user?.pid && c.employee_id === user.pid) ||
            (user?.name && c.employee_name.toLowerCase() === user.name.toLowerCase())
        )
        if (myClaims.length > 0) {
          setClaims(myClaims)
        }
      }
    } catch {
      // Keep initial demo claims
    }
  }

  const pendingTotal = claims
    .filter((c) => c.status === 'Pending')
    .reduce((sum, c) => sum + c.amount, 0)
  const approvedTotal = claims
    .filter((c) => c.status === 'Approved')
    .reduce((sum, c) => sum + c.amount, 0)
  const reimbursedTotal = claims
    .filter((c) => c.status === 'Paid')
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 w-full rounded-full opacity-80" />

      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-amber-700/30 bg-gradient-to-r from-[#2c1303] via-[#4d2206] to-[#250f02] p-6 lg:p-8 shadow-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                MY EXPENSES
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              My Reimbursement Claims
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              File business expenses, upload receipts and track payout status with monthly payroll.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Plus size={17} className="text-amber-700 font-bold" />
            <span>Submit new claim</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Clock size={20} />
            </div>
            <span className="text-sm font-medium text-slate-300">Pending Review</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
            ₹{pendingTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-rose-400 font-medium">Under manager verification</div>
        </div>

        <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-medium text-slate-300">Approved for Payout</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
            ₹{approvedTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400">Paid with Oct 31 payroll</div>
        </div>

        <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Receipt size={20} />
            </div>
            <span className="text-sm font-medium text-slate-300">Reimbursed YTD</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
            ₹{reimbursedTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-400 font-medium">Processed to bank</div>
        </div>

        <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <FileText size={20} />
            </div>
            <span className="text-sm font-medium text-slate-300">Total Claims</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-white mb-2">{claims.length}</div>
          <div className="text-xs text-slate-400">FY 2026-27 records</div>
        </div>
      </div>

      {/* Claims List Table */}
      <div className="bg-[#10192A]/90 border border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">My Claims History</h3>
          <span className="text-xs text-slate-400">Filtered to your employee profile</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {claims.map((c) => (
            <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/30 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Receipt size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {c.category} <span className="text-slate-400 font-normal">· {c.date}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{c.description}</div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-base font-bold text-white">
                  ₹{c.amount.toLocaleString('en-IN')}
                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    c.status === 'Paid'
                      ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400'
                      : c.status === 'Approved'
                      ? 'bg-sky-950/80 border-sky-800/60 text-sky-400'
                      : c.status === 'Rejected'
                      ? 'bg-rose-950/80 border-rose-800/60 text-rose-400'
                      : 'bg-amber-950/80 border-amber-800/60 text-amber-400'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClaimSubmitted={() => fetchMyClaims()}
      />
    </div>
  )
}
