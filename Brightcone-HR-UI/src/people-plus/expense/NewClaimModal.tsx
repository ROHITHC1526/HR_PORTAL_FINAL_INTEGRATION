import React, { useState } from 'react'
import axios from 'axios'
import { X, UploadCloud, AlertCircle } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

interface NewClaimModalProps {
  isOpen: boolean
  onClose: () => void
  onClaimSubmitted: () => void
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({ isOpen, onClose, onClaimSubmitted }) => {
  const { user } = useAuth()
  const [category, setCategory] = useState('Travel')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid expense amount in INR.')
      return
    }
    if (!description.trim()) {
      setError('Please provide a brief description for this claim.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await axios.post('/api/expenses', {
        employee_id: user?.pid || user?.email || 'unknown',
        employee_name: user?.name ?? 'Employee',
        category,
        amount: parsedAmount,
        date,
        description,
        receipt_url: receiptName ? `/receipts/${receiptName}` : null,
      })
      onClaimSubmitted()
      onClose()
    } catch {
      // Optimistic close
      onClaimSubmitted()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#10192A] border border-[#1E2D4A] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Submit Reimbursement Claim</h3>
            <p className="text-xs text-slate-400 mt-0.5">Direct expense claim for review by People Ops</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Travel">Travel</option>
                <option value="Meals">Meals & Client Dining</option>
                <option value="Internet">Internet / Broadband</option>
                <option value="Client entertainment">Client Entertainment</option>
                <option value="Learning">Learning & Certifications</option>
                <option value="Office supplies">Office Supplies / Hardware</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount (INR)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 3450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expense Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Purpose / Description</label>
            <textarea
              rows={2}
              placeholder="Explain the context or project for this expense..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Receipt File</label>
            <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-4 text-center hover:border-amber-500/60 transition-colors">
              <UploadCloud size={24} className="mx-auto text-amber-400 mb-1" />
              <input
                type="file"
                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-800 file:text-slate-200"
                onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? '')}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all hover:scale-105"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
