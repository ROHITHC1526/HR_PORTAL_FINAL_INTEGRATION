import React, { useState } from 'react'
import { X as CloseIcon, Printer } from 'lucide-react'
import { DEMO_EMPLOYEES, formatINR, getPayrollEmployees } from './payroll-data'
import type { PayslipRecord } from './payslip-records-types'

export const AddPayslipModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSave: (record: Omit<PayslipRecord, 'id'>) => void
}> = ({ isOpen, onClose, onSave }) => {
  const [empId, setEmpId] = useState(DEMO_EMPLOYEES[0].id)
  const [month, setMonth] = useState('October 2026')
  const [gross, setGross] = useState(145000)
  const [deductions, setDeductions] = useState(14440)
  const [status, setStatus] = useState<PayslipRecord['status']>('Generated')

  if (!isOpen) return null

  const basic = Math.round(gross * 0.5)
  const hra = Math.round(basic * 0.4)
  const spl = Math.max(0, gross - (basic + hra))
  const netPay = Math.max(0, gross - deductions)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emp = DEMO_EMPLOYEES.find((x) => x.id === empId) || DEMO_EMPLOYEES[0]
    onSave({
      employeeId: emp.id,
      employeeName: emp.name,
      dept: emp.dept,
      month,
      gross,
      deductions,
      netPay,
      issuedOn: new Date().toISOString().slice(0, 10),
      status,
      basic,
      hra,
      specialAllowance: spl,
      pf: 1800,
      pt: 200,
      tds: Math.max(0, deductions - 2000),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Issue Single Payslip</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
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

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Generated">Generated</option>
                <option value="Sent">Sent</option>
                <option value="Acknowledged">Acknowledged</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gross Earnings (₹)</label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Total Deductions (₹)</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Net Take Home:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatINR(netPay)}</span>
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
              Issue Payslip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const BatchGeneratePayslipModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onGenerate: (month: string, employees: typeof DEMO_EMPLOYEES) => void
}> = ({ isOpen, onClose, onGenerate }) => {
  const [month, setMonth] = useState('October 2026')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Batch Generate Payslips</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="py-4 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Generate digital payslips for all processed employees from the selected payroll run month.
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payroll Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-blue-900 dark:text-blue-300">
            Will generate and publish payslips for {DEMO_EMPLOYEES.length} active employees on record.
          </div>
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
            onClick={() => onGenerate(month, DEMO_EMPLOYEES)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
          >
            Generate All
          </button>
        </div>
      </div>
    </div>
  )
}

export const ViewPayslipModal: React.FC<{
  record: PayslipRecord | null
  onClose: () => void
}> = ({ record, onClose }) => {
  if (!record) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">BRIGHTCONE TECHNOLOGIES</div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Payslip — {record.month}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Payslip"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Employee Name:</span>
              <div className="font-bold text-slate-900 dark:text-white">{record.employeeName}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Employee ID:</span>
              <div className="font-mono text-slate-900 dark:text-white">{record.employeeId}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Department:</span>
              <div className="text-slate-700 dark:text-slate-300">{record.dept}</div>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Issued On:</span>
              <div className="text-slate-700 dark:text-slate-300">{record.issuedOn}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-800">EARNINGS</div>
              <div className="space-y-1.5 pt-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Basic:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.basic || Math.round(record.gross * 0.5))}</span>
                </div>
                <div className="flex justify-between">
                  <span>HRA:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.hra || Math.round(record.gross * 0.2))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Allowance:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.specialAllowance || Math.round(record.gross * 0.3))}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-200 dark:border-slate-800">DEDUCTIONS</div>
              <div className="space-y-1.5 pt-2 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>PF (EE):</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">-{formatINR(record.pf || 1800)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prof. Tax:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">-{formatINR(record.pt || 200)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TDS (IT):</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">-{formatINR(record.tds || 8500)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 flex justify-between items-center text-sm font-bold">
            <span className="text-emerald-950 dark:text-emerald-200">Net Take Home Pay:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 text-lg">{formatINR(record.netPay)}</span>
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

