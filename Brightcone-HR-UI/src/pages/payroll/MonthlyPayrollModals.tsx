import React, { useState, useEffect } from 'react'
import { X as CloseIcon } from 'lucide-react'
import { DEMO_EMPLOYEES, formatINR, getPayrollEmployees } from './payroll-data'
import type { MonthlyPayrollRecord } from './monthly-payroll-types'

export const AddPayrollEntryModal: React.FC<{
  isOpen: boolean
  editingRecord: MonthlyPayrollRecord | null
  onClose: () => void
  onSave: (record: Omit<MonthlyPayrollRecord, 'id'>) => void
}> = ({ isOpen, editingRecord, onClose, onSave }) => {
  const [empId, setEmpId] = useState(DEMO_EMPLOYEES[0].id)
  const [month, setMonth] = useState('October 2026')
  const [paidDays, setPaidDays] = useState(31)
  const [grossPay, setGrossPay] = useState(145000)
  const [deductions, setDeductions] = useState(14440)
  const [status, setStatus] = useState<MonthlyPayrollRecord['status']>('Draft')

  useEffect(() => {
    if (editingRecord) {
      setEmpId(editingRecord.employeeId)
      setMonth(editingRecord.month)
      setPaidDays(editingRecord.paidDays)
      setGrossPay(editingRecord.grossPay)
      setDeductions(editingRecord.deductions ?? editingRecord.totalDeductions ?? 0)
      setStatus(editingRecord.status)
    } else {
      setEmpId(DEMO_EMPLOYEES[0].id)
      setMonth('October 2026')
      setPaidDays(31)
      setGrossPay(145000)
      setDeductions(14440)
      setStatus('Draft')
    }
  }, [editingRecord, isOpen])

  if (!isOpen) return null

  const netPay = Math.max(0, grossPay - deductions)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emp = DEMO_EMPLOYEES.find((x) => x.id === empId) || DEMO_EMPLOYEES[0]
    onSave({
      month,
      employeeId: emp.id,
      employeeName: emp.name,
      dept: emp.dept,
      workingDays: 22,
      lopDays: Math.max(0, 31 - paidDays),
      paidDays,
      grossPay,
      totalDeductions: deductions,
      deductions,
      netPay,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingRecord ? 'Edit Payroll Entry' : 'Add Monthly Payroll Entry'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employee</label>
              <select
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {getPayrollEmployees().map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Month</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Paid Days</label>
              <input
                type="number"
                min={0}
                max={31}
                value={paidDays}
                onChange={(e) => setPaidDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gross Pay (₹)</label>
              <input
                type="number"
                value={grossPay}
                onChange={(e) => setGrossPay(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deductions (₹)</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Calculated Net Pay:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-base">{formatINR(netPay)}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Draft">Draft</option>
              <option value="Processed">Processed</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              {editingRecord ? 'Save Changes' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const ViewPayrollDetailModal: React.FC<{
  record: MonthlyPayrollRecord | null
  onClose: () => void
}> = ({ record, onClose }) => {
  if (!record) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{record.employeeName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {record.employeeId} • {record.dept} • {record.month}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="py-4 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Paid Days</span>
            <span className="font-semibold text-slate-900 dark:text-white">{record.paidDays} of 31 days</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Gross Earnings</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatINR(record.grossPay)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400">Total Deductions</span>
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">-{formatINR(record.deductions ?? record.totalDeductions ?? 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700 font-bold text-sm">
            <span className="text-slate-900 dark:text-white">Net Take Home Pay</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatINR(record.netPay)}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              {record.status}
            </span>
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

