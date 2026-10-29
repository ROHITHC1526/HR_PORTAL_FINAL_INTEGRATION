import React from "react";
import type { SalaryBreakdown } from "./types";

interface Props {
  calcInputGross: string;
  setCalcInputGross: (v: string) => void;
  calcRegime: string;
  setCalcRegime: (v: string) => void;
  calcPfCapped: boolean;
  setCalcPfCapped: (v: boolean) => void;
  calcResult: SalaryBreakdown | null;
}

export const SalaryCalculatorTab: React.FC<Props> = ({
  calcInputGross,
  setCalcInputGross,
  calcRegime,
  setCalcRegime,
  calcPfCapped,
  setCalcPfCapped,
  calcResult,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-5 bg-surface border border-line rounded-2xl shadow-card p-5 space-y-4 text-xs">
        <div>
          <h3 className="font-sora font-semibold text-sm text-txt">
            Whole-Paise Calculation Engine
          </h3>
          <p className="text-xs text-txt-muted mt-0.5">
            Simulate monthly components with exact integer paise precision and rounding.
          </p>
        </div>

        <div>
          <label className="block text-txt font-medium mb-1">Monthly Gross (INR)</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-txt-faint font-semibold">₹</span>
            <input
              type="number"
              step="1000"
              value={calcInputGross}
              onChange={(e) => setCalcInputGross(e.target.value)}
              className="w-full pl-7 pr-3 py-2 rounded-xl bg-surface border border-line text-sm font-sora font-semibold text-txt outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-txt font-medium mb-1">Tax Regime</label>
            <select
              value={calcRegime}
              onChange={(e) => setCalcRegime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
            >
              <option value="New">New Regime (FY26-27)</option>
              <option value="Old">Old Regime</option>
            </select>
          </div>

          <div>
            <label className="block text-txt font-medium mb-1">Provident Fund Cap</label>
            <select
              value={calcPfCapped ? "capped" : "uncapped"}
              onChange={(e) => setCalcPfCapped(e.target.value === "capped")}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand font-medium"
            >
              <option value="capped">Capped (₹1,800/mo)</option>
              <option value="uncapped">Uncapped (12% of Basic)</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-secondary border border-line text-[11px] text-txt-muted space-y-1">
          <div className="font-semibold text-txt">Engine Math Rules (Whole Paise):</div>
          <div>• Basic: 50% of Gross CTC</div>
          <div>• HRA: 50% of Basic (25% of Gross)</div>
          <div>• Special Allowance: Remainder (25%)</div>
          <div>• Professional Tax: Flat ₹200/mo</div>
          <div>• 1 Rupee = 100 Paise (Eliminates floating-point rounding drifts)</div>
        </div>
      </div>

      {calcResult && (
        <div className="lg:col-span-7 bg-surface border border-line rounded-2xl shadow-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-3">
            <div>
              <div className="text-[11px] text-txt-faint uppercase tracking-wider font-semibold">
                Computed Net Take-Home
              </div>
              <div className="font-sora text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{calcResult.net_take_home_rupees.toLocaleString("en-IN")}
              </div>
              <div className="font-mono text-[11px] text-txt-faint mt-0.5">
                {calcResult.net_take_home_paise.toLocaleString()} Paise
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-[11px] text-txt-faint uppercase tracking-wider font-semibold">
                Annual CTC
              </div>
              <div className="font-sora text-xl font-bold text-txt mt-1">
                ₹{calcResult.annual_ctc_rupees.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-txt-muted">Includes Employer PF</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-txt mb-2.5 flex items-center justify-between">
              <span>Monthly Earnings Structure</span>
              <span className="font-sora text-brand font-bold">
                ₹{calcResult.gross_monthly_rupees.toLocaleString("en-IN")} Gross
              </span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                <div>
                  <span className="font-medium text-txt">Basic Salary</span>
                  <span className="text-[10px] text-txt-faint ml-2">(50% of Gross)</span>
                </div>
                <span className="font-sora font-semibold text-txt">
                  ₹{calcResult.basic_monthly_rupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                <div>
                  <span className="font-medium text-txt">House Rent Allowance (HRA)</span>
                  <span className="text-[10px] text-txt-faint ml-2">(50% of Basic)</span>
                </div>
                <span className="font-sora font-semibold text-txt">
                  ₹{calcResult.hra_monthly_rupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-surface-secondary border border-line/60">
                <div>
                  <span className="font-medium text-txt">Special Allowance</span>
                  <span className="text-[10px] text-txt-faint ml-2">(Balancing Component)</span>
                </div>
                <span className="font-sora font-semibold text-txt">
                  ₹{calcResult.special_allowance_rupees.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-txt mb-2.5 flex items-center justify-between">
              <span>Monthly Deductions</span>
              <span className="font-sora text-rose-500 font-bold">
                -₹
                {(
                  calcResult.employee_pf_rupees +
                  calcResult.professional_tax_rupees +
                  calcResult.estimated_tds_rupees
                ).toLocaleString("en-IN")}
              </span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                <span className="font-medium text-txt">Employee PF (12%)</span>
                <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                  -₹{calcResult.employee_pf_rupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                <span className="font-medium text-txt">Professional Tax (PT)</span>
                <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                  -₹{calcResult.professional_tax_rupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-900/30">
                <span className="font-medium text-txt">Estimated Monthly TDS</span>
                <span className="font-sora font-semibold text-rose-600 dark:text-rose-400">
                  -₹{calcResult.estimated_tds_rupees.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
