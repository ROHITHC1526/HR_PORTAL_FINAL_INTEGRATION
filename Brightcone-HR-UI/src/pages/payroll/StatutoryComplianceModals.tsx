import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useUnifiedEmployees } from '../../services/employeeData'
import type { StatutoryItem } from './statutory-compliance-types'

export const AddComplianceItemModal: React.FC<{
  isOpen: boolean
  editingRecord: StatutoryItem | null
  onClose: () => void
  onSave: (record: Omit<StatutoryItem, 'id' | 'status'>) => void
}> = ({ isOpen, editingRecord, onClose, onSave }) => {
  const { employees } = useUnifiedEmployees()
  const [item, setItem] = useState('TDS Return (Form 24Q)')
  const [period, setPeriod] = useState('Q3 FY 2026-27')
  const [authority, setAuthority] = useState('Income Tax Department (TRACES)')
  const [dueDate, setDueDate] = useState('2026-10-31')
  const [owner, setOwner] = useState(employees[0]?.name || '')

  useEffect(() => {
    if (editingRecord) {
      setItem(editingRecord.item)
      setPeriod(editingRecord.period)
      setAuthority(editingRecord.authority)
      setDueDate(editingRecord.dueDate)
      setOwner(editingRecord.owner)
    } else {
      setItem('TDS Return (Form 24Q)')
      setPeriod('Q3 FY 2026-27')
      setAuthority('Income Tax Department (TRACES)')
      setDueDate('2026-10-31')
      setOwner(employees[0]?.name || '')
    }
  }, [editingRecord, isOpen, employees])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      item,
      period,
      authority,
      dueDate,
      owner,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingRecord ? 'Edit Compliance Item' : 'Add Compliance Item'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Compliance Name</label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Filing Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Statutory Authority</label>
            <input
              type="text"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Responsible Owner</label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name} ({e.dept})
                </option>
              ))}
            </select>
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
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const RecordStatutoryAckModal: React.FC<{
  record: StatutoryItem | null
  onClose: () => void
  onConfirmCompleted: (id: string, ack: string) => void
}> = ({ record, onClose, onConfirmCompleted }) => {
  const [ackInput, setAckInput] = useState('')

  if (!record) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Record Filing Acknowledgement</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Enter the statutory acknowledgement number / confirmation receipt for {record.item} ({record.period}).
        </p>
        <input
          type="text"
          value={ackInput}
          onChange={(e) => setAckInput(e.target.value)}
          placeholder="e.g. ACK-2026-90182"
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
            onClick={() => onConfirmCompleted(record.id, ackInput || 'ACK-CONFIRMED')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
          >
            Confirm Completed
          </button>
        </div>
      </div>
    </div>
  )
}
