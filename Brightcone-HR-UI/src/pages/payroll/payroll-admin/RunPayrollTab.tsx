import React from "react";
import { Lock, ArrowLeft, Check, Users, Banknote, Receipt, CheckCircle } from "lucide-react";
import {
  type PayrollRun,
  type AttendanceSyncItem,
  type VarianceItem,
  type OneTimeInput,
  formatINR,
  paySteps,
} from "./types";
import { AttendanceStep } from "./AttendanceStep";
import { AdjustmentsStep } from "./AdjustmentsStep";
import { VarianceStep } from "./VarianceStep";
import { ApprovalStep } from "./ApprovalStep";
import { DisburseStep } from "./DisburseStep";

interface Props {
  activeRun: PayrollRun | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  attendance: AttendanceSyncItem[];
  inputs: OneTimeInput[];
  variances: VarianceItem[];
  financeApproved: boolean;
  setFinanceApproved: (val: boolean) => void;
  financeComments: string;
  setFinanceComments: (val: string) => void;
  onAdvanceStep: () => void;
  onPreviousStep: () => void;
  onOpenPublishModal: () => void;
  onOpenAddModal: () => void;
  onRemoveInput: (id: string) => void;
  onSyncAttendance: () => void;
}

export const RunPayrollTab: React.FC<Props> = ({
  activeRun,
  currentStep,
  setCurrentStep,
  attendance,
  inputs,
  variances,
  financeApproved,
  setFinanceApproved,
  financeComments,
  setFinanceComments,
  onAdvanceStep,
  onPreviousStep,
  onOpenPublishModal,
  onOpenAddModal,
  onRemoveInput,
  onSyncAttendance,
}) => {
  return (
    <div className="space-y-6">
      {/* Stepper Card matching Image 1 */}
      <div className="bg-white dark:bg-[#0f172a]/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800/80">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeRun ? activeRun.month : "October 2026"}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pay date Oct 31</span>
        </div>

        {/* 5 Step boxes in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-5">
          {paySteps.map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = activeRun?.is_locked || stepNum < currentStep;
            const isCur = !activeRun?.is_locked && stepNum === currentStep;

            return (
              <div
                key={step.title}
                onClick={() => !activeRun?.is_locked && setCurrentStep(stepNum)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCur
                    ? "bg-blue-50 border-blue-500 text-blue-900 shadow-md ring-1 ring-blue-400/30 dark:bg-[#132d56] dark:border-blue-500 dark:text-white"
                    : isDone
                    ? "bg-emerald-50/60 border-emerald-200 text-slate-800 dark:bg-[#0b1322] dark:border-emerald-900/40 dark:text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-[#0b1322]/60 dark:border-slate-800/80 dark:text-slate-400 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCur
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </span>
                </div>
                <div className="text-xs font-bold leading-snug line-clamp-2">
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-5 flex items-center gap-3">
          {!activeRun?.is_locked && (
            <>
              {currentStep < 5 ? (
                <button
                  onClick={onAdvanceStep}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  Mark step complete
                </button>
              ) : (
                <button
                  onClick={onOpenPublishModal}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Disburse & publish payslips
                </button>
              )}
            </>
          )}

          {currentStep > 1 && !activeRun?.is_locked && (
            <button
              onClick={onPreviousStep}
              className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous step
            </button>
          )}
        </div>
      </div>

      {/* 4 KPI Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users size={16} />
            </span>
            <span>Employees</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {activeRun?.total_employees || 14}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Included in this run</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Banknote size={16} />
            </span>
            <span>Gross pay</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatINR(activeRun?.total_gross || 4942467)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">This month</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Receipt size={16} />
            </span>
            <span>Deductions</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatINR(activeRun?.total_deductions || 1057000)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">PF, PT and TDS</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle size={16} />
            </span>
            <span>Net payout</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            {formatINR(activeRun?.total_net || 3885467)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">To bank accounts</div>
        </div>
      </div>

      {/* Step Detail Content */}
      {currentStep === 1 && (
        <AttendanceStep attendance={attendance} onSync={onSyncAttendance} />
      )}
      {currentStep === 2 && (
        <AdjustmentsStep
          inputs={inputs}
          onOpenAddModal={onOpenAddModal}
          onRemoveInput={onRemoveInput}
        />
      )}
      {currentStep === 3 && <VarianceStep variances={variances} />}
      {currentStep === 4 && (
        <ApprovalStep
          activeRun={activeRun}
          financeApproved={financeApproved}
          setFinanceApproved={setFinanceApproved}
          financeComments={financeComments}
          setFinanceComments={setFinanceComments}
        />
      )}
      {currentStep === 5 && (
        <DisburseStep
          activeRun={activeRun}
          onOpenPublishModal={onOpenPublishModal}
        />
      )}
    </div>
  );
};
