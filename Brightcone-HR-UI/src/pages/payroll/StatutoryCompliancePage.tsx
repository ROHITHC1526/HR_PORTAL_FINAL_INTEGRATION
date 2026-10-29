import React, { useState } from 'react'
import { Download, Plus, Search, Shield, Clock, Edit2, Trash2 } from 'lucide-react'
import { exportToCSV } from './payroll-data'
import type { StatutoryItem } from './statutory-compliance-types'
import { AddComplianceItemModal, RecordStatutoryAckModal } from './StatutoryComplianceModals'

export const StatutoryCompliancePage: React.FC = () => {
  const [records, setRecords] = useState<StatutoryItem[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<StatutoryItem | null>(null)
  const [markModalRecord, setMarkModalRecord] = useState<StatutoryItem | null>(null)

  const activeRecords = records.filter((r) => (showArchived ? r.isArchived : !r.isArchived))
  const filtered = activeRecords.filter((r) => {
    const matchesSearch =
      r.item.toLowerCase().includes(search.toLowerCase()) ||
      r.period.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      (r.ackNo && r.ackNo.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCount = records.filter((r) => !r.isArchived).length
  const pendingCount = records.filter((r) => !r.isArchived && r.status === 'Pending').length
  const completedCount = records.filter((r) => !r.isArchived && r.status === 'Completed').length
  const overdueCount = records.filter((r) => !r.isArchived && r.status === 'Overdue').length
  const archivedCount = records.filter((r) => r.isArchived).length

  const handleSave = (data: Omit<StatutoryItem, 'id' | 'status'>) => {
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? { ...r, ...data } : r))
      )
    } else {
      const newRec: StatutoryItem = {
        ...data,
        id: `STAT-${Date.now().toString().slice(-4)}`,
        status: 'Pending',
      }
      setRecords((prev) => [newRec, ...prev])
    }
    setModalOpen(false)
    setEditingRecord(null)
  }

  const handleMarkCompleted = (id: string, ack: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Completed', filedOn: new Date().toISOString().slice(0, 10), ackNo: ack } : r
      )
    )
    setMarkModalRecord(null)
  }

  const handleExport = () => {
    exportToCSV(
      'Statutory_Compliance_Tracker',
      ['ID', 'Compliance', 'Period', 'Authority', 'Due Date', 'Responsible', 'Filed On', 'Status'],
      filtered.map((r) => [r.id, r.item, r.period, r.authority, r.dueDate, r.owner, r.filedOn || '—', r.status])
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">PAYROLL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Statutory compliance tracker</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            All statutory filings and renewals with owners and due dates.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-400 dark:hover:border-slate-500 shadow-sm cursor-pointer"
          >
            <Download size={16} className="text-slate-500 dark:text-slate-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingRecord(null)
              setModalOpen(true)
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={18} />
            <span>Add compliance item</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield size={14} />
            </span>
            <span>Total records</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{totalCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield size={14} />
            </span>
            <span>Pending</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{pendingCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Shield size={14} />
            </span>
            <span>Completed</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{completedCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock size={14} />
            </span>
            <span>Overdue</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{overdueCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Past due date</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search statutory compliance tracker"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Archived ({archivedCount})</span>
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">COMPLIANCE</th>
                <th className="py-3 px-4">PERIOD</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">RESPONSIBLE</th>
                <th className="py-3 px-4">FILED ON</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                        <Shield size={28} />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        No statutory compliance tracker yet. Use <span className="font-semibold text-slate-900 dark:text-white">Add compliance item</span> to create the first one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{rec.item}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{rec.authority}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{rec.period}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{rec.dueDate}</td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{rec.owner}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {rec.filedOn ? (
                        <div>
                          <div>{rec.filedOn}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{rec.ackNo}</div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          rec.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : rec.status === 'Overdue'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {rec.status !== 'Completed' && (
                          <button
                            onClick={() => setMarkModalRecord(rec)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Mark Filed
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingRecord(rec)
                            setModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() =>
                            setRecords((prev) =>
                              prev.map((r) => (r.id === rec.id ? { ...r, isArchived: !r.isArchived } : r))
                            )
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddComplianceItemModal
        isOpen={modalOpen}
        editingRecord={editingRecord}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <RecordStatutoryAckModal
        record={markModalRecord}
        onClose={() => setMarkModalRecord(null)}
        onConfirmCompleted={handleMarkCompleted}
      />
    </div>
  )
}

export default StatutoryCompliancePage
