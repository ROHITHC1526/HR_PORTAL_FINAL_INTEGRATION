import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatINR } from './payroll-data'
import type { PfEsiFiling } from './pf-esi-types'

export const AddPfEsiFilingModal: React.FC<{
  isOpen: boolean
  editingRecord: PfEsiFiling | null
  onClose: () => void
  onSave: (record: Omit<PfEsiFiling, 'id' | 'status'>) => void
}> = ({ isOpen, editingRecord, onClose, onSave }) => {
  const [wageMonth, setWageMonth] = useState('October 2026')
  const [scheme, setScheme] = useState<'PF' | 'ESI'>('PF')
  const [count, setCount] = useState(14)
  const [ee, setEe] = useState(25200)
  const [er, setEr] = useState(25200)
  const [dueDate, setDueDate] = useState('2026-11-15')

  useEffect(() => {
    if (editingRecord) {
      setWageMonth(editingRecord.wageMonth)
      setScheme(editingRecord.scheme)
      setCount(editingRecord.employeeCount)
      setEe(editingRecord.employeeShare)
      setEr(editingRecord.employerShare)
      setDueDate(editingRecord.dueDate)
    } else {
      setWageMonth('October 2026')
      setScheme('PF')
      setCount(14)
      setEe(25200)
      setEr(25200)
      setDueDate('2026-11-15')
    }
  }, [editingRecord, isOpen])

  if (!isOpen) return null

  const total = ee + er

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      wageMonth,
      scheme,
      employeeCount: count,
      employeeShare: ee,
      employerShare: er,
      totalAmount: total,
      dueDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingRecord ? 'Edit PF/ESI Filing' : 'Add PF/ESI Filing'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Wage Month</label>
              <input
                type="text"
                value={wageMonth}
                onChange={(e) => setWageMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Scheme</label>
              <select
                value={scheme}
                onChange={(e) => setScheme(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PF">Provident Fund (PF)</option>
                <option value="ESI">Employee State Insurance (ESI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employees Covered</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employee Share (₹)</label>
              <input
                type="number"
                value={ee}
                onChange={(e) => setEe(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employer Share (₹)</label>
              <input
                type="number"
                value={er}
                onChange={(e) => setEr(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Total Filing Amount:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatINR(total)}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Statutory Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Save Filing
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const RecordChallanModal: React.FC<{
  record: PfEsiFiling | null
  onClose: () => void
  onConfirmPaid: (id: string, challan: string) => void
}> = ({ record, onClose, onConfirmPaid }) => {
  const [challanInput, setChallanInput] = useState('')

  if (!record) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Record Payment & Challan</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Enter the bank deposit challan number / TRRN for {record.wageMonth} ({record.scheme}).
        </p>
        <input
          type="text"
          value={challanInput}
          onChange={(e) => setChallanInput(e.target.value)}
          placeholder="e.g. TRRN-9018290312"
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white mb-4 focus:outline-none focus:border-blue-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmPaid(record.id, challanInput || 'TRRN-PAID')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
          >
            Confirm Paid
          </button>
        </div>
      </div>
    </div>
  )
}
