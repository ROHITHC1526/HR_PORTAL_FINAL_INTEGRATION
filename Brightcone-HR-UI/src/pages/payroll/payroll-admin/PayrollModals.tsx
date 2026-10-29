import React, { useState } from "react";
import { X, Lock, AlertTriangle } from "lucide-react";
import { useUnifiedEmployees } from "../../../services/employeeData";
import type { PayrollRun } from "./types";

interface AddInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { emp: string; type: string; amt: number; notes: string }) => void;
}

export const AddInputModal: React.FC<AddInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { employees } = useUnifiedEmployees();
  const [empId, setEmpId] = useState(employees[0]?.id || "");
  const [type, setType] = useState("Bonus");
  const [amt, setAmt] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // Resolve the employee name from the selected ID for the payload
  const getEmpName = (id: string) =>
    employees.find((e) => e.id === id)?.name ?? id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amt);
    if (isNaN(val)) return;
    onSubmit({ emp: getEmpName(empId), type, amt: val, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Add One-Time Input</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Employee</label>
            <select
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {employees.length === 0 && (
                <option value="">Loading employees…</option>
              )}
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.dept})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Adjustment Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Performance Bonus">Performance Bonus</option>
              <option value="Referral Bonus">Referral Bonus</option>
              <option value="Client Reimbursement">Client Reimbursement</option>
              <option value="Salary Arrears">Salary Arrears</option>
              <option value="Loan Recovery">Loan Recovery (Deduction)</option>
              <option value="Notice Shortfall">Notice Shortfall (Deduction)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹) - Use negative for deductions
            </label>
            <input
              type="number"
              placeholder="e.g. 25000 or -5000"
              required
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Audit Notes / Reason</label>
            <input
              type="text"
              placeholder="e.g. Outstanding performance bonus approved by VP"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl font-semibold cursor-pointer"
            >
              Add Input
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PublishLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  publishing: boolean;
  activeRun: PayrollRun | null;
}

export const PublishLockModal: React.FC<PublishLockModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  publishing,
  activeRun,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Publish Payroll & Lock Month Permanently?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Once published, {activeRun?.month || "October 2026"} will be permanently locked against any retroactive edits.
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Statutory Lock Rule [PAY-02]</span>
          </div>
          <p className="leading-relaxed">
            Publishing triggers automated generation of payslips in employee self-service portals and releases bank transfer instructions. Any subsequent corrections must be processed through a <strong>Supplementary Payroll Run</strong>.
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
          >
            Cancel Review
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {publishing ? "Publishing & Locking..." : "Confirm & Lock Month"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SupplementaryRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (month: string, notes: string) => void;
}

export const SupplementaryRunModal: React.FC<SupplementaryRunModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [suppMonth, setSuppMonth] = useState("October 2026");
  const [suppNotes, setSuppNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppNotes.trim()) {
      alert("Please provide the reason for the supplementary run.");
      return;
    }
    onSubmit(suppMonth, suppNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Create Supplementary Run</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300">
          Supplementary runs allow post-lock adjustments (such as missed reimbursements, salary arrears or joiner adjustments) without altering the closed month register.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Closed Month</label>
            <input
              type="text"
              value={suppMonth}
              onChange={(e) => setSuppMonth(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="e.g. October 2026"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Supplementary Run (Audit Required)
            </label>
            <textarea
              value={suppNotes}
              onChange={(e) => setSuppNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="e.g. Arrears for mid-month joinees and 3 approved travel claims received after cut-off."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-[#0B6FDB] hover:bg-[#0958b0] rounded-xl font-semibold cursor-pointer"
            >
              Initiate Supplementary Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
