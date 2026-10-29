import React, { useState } from 'react'
import { Plus, Heart, Users, Calendar, Trash2, X } from 'lucide-react'

export interface BenefitPlan {
  id: string
  name: string
  provider: string
  coverAmount: string
  cost: string
}

const INITIAL_PLANS: BenefitPlan[] = [
  {
    id: 'BP-01',
    name: 'Group health insurance',
    provider: 'Star Health',
    coverAmount: '₹5,00,000 family floater',
    cost: 'Company paid',
  },
  {
    id: 'BP-02',
    name: 'Group term life',
    provider: 'HDFC Life',
    coverAmount: '3x annual CTC',
    cost: 'Company paid',
  },
  {
    id: 'BP-03',
    name: 'Group personal accident',
    provider: 'ICICI Lombard',
    coverAmount: '₹20,00,000',
    cost: 'Company paid',
  },
]

export const BenefitsAdminPage: React.FC = () => {
  const [plans, setPlans] = useState<BenefitPlan[]>(INITIAL_PLANS)
  const [modalOpen, setModalOpen] = useState(false)

  // Plan modal form
  const [planName, setPlanName] = useState('')
  const [provider, setProvider] = useState('')
  const [cover, setCover] = useState('₹5,00,000')
  const [cost, setCost] = useState('Company paid')

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault()
    const newPlan: BenefitPlan = {
      id: `BP-${Date.now().toString().slice(-4)}`,
      name: planName,
      provider,
      coverAmount: cover,
      cost,
    }
    setPlans((prev) => [...prev, newPlan])
    setPlanName('')
    setProvider('')
    setCover('₹5,00,000')
    setCost('Company paid')
    setModalOpen(false)
  }

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id))
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Benefits</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Insurance plans, enrolment and dependents across the company.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={18} />
            <span>Add plan</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Heart size={16} />
            </span>
            <span>Enrolled in health cover</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">14</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">100% of eligible employees</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Users size={16} />
            </span>
            <span>Dependents covered</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">40</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spouses, children, parents</div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Calendar size={16} />
            </span>
            <span>Enrolment closes</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-4">Oct 31</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">For the 2027 policy year</div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/90 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-6">PLAN</th>
                <th className="py-3 px-6">PROVIDER</th>
                <th className="py-3 px-6">COVER</th>
                <th className="py-3 px-6">COST</th>
                <th className="py-3 px-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No insurance plans configured. Click Add plan to set up company health cover.
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{p.provider}</td>
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200">{p.coverAmount}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{p.cost}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeletePlan(p.id)}
                        title="Delete Plan"
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plan Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Benefit Plan</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddPlan} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Group Health Insurance"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Insurance Provider</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Star Health / ICICI Lombard"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Amount</label>
                  <input
                    type="text"
                    value={cover}
                    onChange={(e) => setCover(e.target.value)}
                    placeholder="e.g. ₹5,00,000 family floater"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Structure</label>
                  <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. Company paid"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BenefitsAdminPage
