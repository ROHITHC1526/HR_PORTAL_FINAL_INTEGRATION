import React, { useState } from "react";
import { X } from "lucide-react";
import { useUnifiedEmployees } from "../../../services/employeeData";

interface NewStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    employee_id: string;
    employee_name: string;
    department: string;
    gross_monthly: number;
    pf_opt_out: boolean;
    tax_regime: string;
    effective_from: string;
  }) => void;
}

export const NewStructureModal: React.FC<NewStructureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { employees } = useUnifiedEmployees();
  const [structEmpId, setStructEmpId] = useState(employees[0]?.id || "BC-1001");
  const [structEmpName, setStructEmpName] = useState(employees[0]?.name || "");
  const [structDept, setStructDept] = useState(employees[0]?.dept || "");
  const [structGross, setStructGross] = useState("90000");
  const [structRegime, setStructRegime] = useState("New");
  const [structPfOptOut, setStructPfOptOut] = useState(false);
  const [structDate, setStructDate] = useState("2026-11-01");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(structGross) || 0;
    if (gross <= 0) return;
    onSubmit({
      employee_id: structEmpId,
      employee_name: structEmpName,
      department: structDept,
      gross_monthly: gross,
      pf_opt_out: structPfOptOut,
      tax_regime: structRegime,
      effective_from: structDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h3 className="font-sora font-semibold text-sm text-txt">
              Configure Salary Structure (PAY-09)
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Any currently active structure for this employee will be automatically superseded.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-txt-faint hover:text-txt rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Employee</label>
              <select
                value={structEmpName}
                onChange={(e) => {
                  const selected = employees.find((emp) => emp.name === e.target.value);
                  if (selected) {
                    setStructEmpName(selected.name);
                    setStructEmpId(selected.id);
                    setStructDept(selected.dept);
                  } else {
                    setStructEmpName(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-txt font-medium mb-1">Department</label>
              <input
                type="text"
                value={structDept}
                readOnly
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-line text-txt-muted outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Monthly Gross (INR)</label>
              <input
                type="number"
                step="1000"
                placeholder="e.g. 90000"
                value={structGross}
                onChange={(e) => setStructGross(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-sora font-semibold"
              />
            </div>

            <div>
              <label className="block text-txt font-medium mb-1">Effective Date</label>
              <input
                type="date"
                value={structDate}
                onChange={(e) => setStructDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Tax Regime</label>
              <select
                value={structRegime}
                onChange={(e) => setStructRegime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              >
                <option value="New">New Regime</option>
                <option value="Old">Old Regime</option>
              </select>
            </div>

            <div>
              <label className="block text-txt font-medium mb-1">PF Contribution</label>
              <label className="flex items-center gap-2 p-2 rounded-xl border border-line bg-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={structPfOptOut}
                  onChange={(e) => setStructPfOptOut(e.target.checked)}
                  className="w-4 h-4 rounded text-brand focus:ring-0"
                />
                <span className="text-txt font-medium text-[11px]">Uncapped 12% PF</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
            >
              Save Active Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ProposeRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    employee_id: string;
    employee_name: string;
    current_gross: number;
    proposed_gross: number;
    reason: string;
    notes: string;
    effective_date: string;
  }) => void;
}

export const ProposeRevisionModal: React.FC<ProposeRevisionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { employees } = useUnifiedEmployees();
  const [revEmpId, setRevEmpId] = useState(employees[0]?.id || "BC-1001");
  const [revEmpName, setRevEmpName] = useState(employees[0]?.name || "Ananya Rao");
  const [revCurrentGross, setRevCurrentGross] = useState(85000);
  const [revProposedGross, setRevProposedGross] = useState("95000");
  const [revReason, setRevReason] = useState("Annual Appraisal");
  const [revEffectiveDate, setRevEffectiveDate] = useState("2026-11-01");
  const [revNotes, setRevNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prop = parseFloat(revProposedGross) || 0;
    if (prop <= 0) return;
    onSubmit({
      employee_id: revEmpId,
      employee_name: revEmpName,
      current_gross: revCurrentGross,
      proposed_gross: prop,
      reason: revReason,
      notes: revNotes,
      effective_date: revEffectiveDate,
    });
  };

  const propNum = parseFloat(revProposedGross) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h3 className="font-sora font-semibold text-sm text-txt">
              Propose Salary Revision (PAY-10)
            </h3>
            <p className="text-xs text-txt-muted mt-0.5">
              Proposals are routed to the compensation committee. Approval automatically creates increment history.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-txt-faint hover:text-txt rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-txt font-medium mb-1">Employee</label>
            <select
              value={revEmpName}
              onChange={(e) => {
                const selected = employees.find((emp) => emp.name === e.target.value);
                if (selected) {
                  setRevEmpName(selected.name);
                  setRevEmpId(selected.id);
                } else {
                  setRevEmpName(e.target.value);
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Current Monthly Gross</label>
              <input
                type="text"
                value={`₹${revCurrentGross.toLocaleString("en-IN")}`}
                readOnly
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-line text-txt-muted font-sora font-semibold"
              />
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">Proposed Monthly Gross</label>
              <input
                type="number"
                step="1000"
                placeholder="e.g. 100000"
                value={revProposedGross}
                onChange={(e) => setRevProposedGross(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-sora font-semibold"
              />
            </div>
          </div>

          {propNum > revCurrentGross && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">Computed Increment:</span>
              <span className="font-sora font-bold text-emerald-600 dark:text-emerald-400">
                +₹{(propNum - revCurrentGross).toLocaleString("en-IN")}{" "}
                (+{Math.round(((propNum - revCurrentGross) / revCurrentGross) * 10000) / 100}%)
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-txt font-medium mb-1">Revision Reason</label>
              <select
                value={revReason}
                onChange={(e) => setRevReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              >
                <option value="Annual Appraisal">Annual Appraisal</option>
                <option value="Promotion">Promotion</option>
                <option value="Market Adjustment">Market Adjustment</option>
                <option value="Off-cycle Correction">Off-cycle Correction</option>
              </select>
            </div>
            <div>
              <label className="block text-txt font-medium mb-1">Effective Date</label>
              <input
                type="date"
                value={revEffectiveDate}
                onChange={(e) => setRevEffectiveDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-txt font-medium mb-1">Appraisal Notes / Justification</label>
            <textarea
              rows={3}
              placeholder="Performance benchmarks, KPI accomplishments, promotion justification..."
              value={revNotes}
              onChange={(e) => setRevNotes(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
            />
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
            >
              Submit Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
