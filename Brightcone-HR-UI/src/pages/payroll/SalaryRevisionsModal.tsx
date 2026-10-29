import React, { useState, useEffect } from 'react'
import { X as CloseIcon } from 'lucide-react'
import { DEMO_EMPLOYEES, getPayrollEmployees } from './payroll-data'
import type { SalaryRevisionRecord } from './salary-revisions-types'

export const AddSalaryRevisionModal: React.FC<{
  isOpen: boolean
  editingRecord: SalaryRevisionRecord | null
  onClose: () => void
  onSave: (record: Omit<SalaryRevisionRecord, 'id'>) => void
}> = ({ isOpen, editingRecord, onClose, onSave }) => {
  const [empId, setEmpId] = useState(DEMO_EMPLOYEES[0].id)
  const [cycle, setCycle] = useState('Annual Appraisal 2026-27')
  const [rating, setRating] = useState(4)
  const [currentCtc, setCurrentCtc] = useState(1500000)
  const [revisedCtc, setRevisedCtc] = useState(1750000)
  const [effectiveDate, setEffectiveDate] = useState('2026-11-01')
  const [approver, setApprover] = useState('Naresh Vemparala')
  const [status, setStatus] = useState<SalaryRevisionRecord['status']>('Pending')

  useEffect(() => {
    if (editingRecord) {
      setEmpId(editingRecord.employeeId)
      setCycle(editingRecord.appraisalCycle)
      setRating(editingRecord.rating)
      setCurrentCtc(editingRecord.currentCtc)
      setRevisedCtc(editingRecord.revisedCtc)
      setEffectiveDate(editingRecord.effectiveDate)
      setApprover(editingRecord.approver)
      setStatus(editingRecord.status)
    } else {
      setEmpId(DEMO_EMPLOYEES[0].id)
      setCycle('Annual Appraisal 2026-27')
      setRating(4)
      setCurrentCtc(1500000)
      setRevisedCtc(1750000)
      setEffectiveDate('2026-11-01')
      setApprover('Naresh Vemparala')
      setStatus('Pending')
    }
  }, [editingRecord, isOpen])

  if (!isOpen) return null

  const changePct = currentCtc > 0 ? Number((((revisedCtc - currentCtc) / currentCtc) * 100).toFixed(2)) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emp = DEMO_EMPLOYEES.find((x) => x.id === empId) || DEMO_EMPLOYEES[0]
    onSave({
      employeeId: emp.id,
      employeeName: emp.name,
      dept: emp.dept,
      appraisalCycle: cycle,
      rating,
      currentCtc,
      revisedCtc,
      changePct,
      effectiveDate,
      approver,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingRecord ? 'Edit Salary Revision' : 'Add Salary Revision'}
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Appraisal Cycle</label>
              <input
                type="text"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current CTC (₹/year)</label>
              <input
                type="number"
                value={currentCtc}
                onChange={(e) => setCurrentCtc(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Revised CTC (₹/year)</label>
              <input
                type="number"
                value={revisedCtc}
                onChange={(e) => setRevisedCtc(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Calculated Increase:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">+{changePct}%</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1 - 5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} - {r === 5 ? 'Exceptional' : r === 4 ? 'Exceeds' : r === 3 ? 'Meets' : 'Needs improvement'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
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
              {editingRecord ? 'Save Changes' : 'Submit Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
