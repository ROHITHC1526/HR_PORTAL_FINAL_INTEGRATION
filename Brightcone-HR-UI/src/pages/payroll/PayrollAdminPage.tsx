import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Lock, Plus, Download } from "lucide-react";
import { useNotifications } from "../../services/NotificationsContext";
import {
  type PayrollRun,
  type AttendanceSyncItem,
  type VarianceItem,
  type OneTimeInput,
  type RegisterItem,
  paySteps,
} from "./payroll-admin/types";
import { RunPayrollTab } from "./payroll-admin/RunPayrollTab";
import { RegisterTab } from "./payroll-admin/RegisterTab";
import { ComplianceTab } from "./payroll-admin/ComplianceTab";
import { HistoryTab } from "./payroll-admin/HistoryTab";
import {
  AddInputModal,
  PublishLockModal,
  SupplementaryRunModal,
} from "./payroll-admin/PayrollModals";

export const PayrollAdminPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();

  const initialTab = searchParams.get("tab") || "run";
  const [activeTab, setActiveTab] = useState<string>(
    initialTab === "register" ? "register" : initialTab === "compliance" ? "compliance" : "run"
  );

  const [activeRun, setActiveRun] = useState<PayrollRun | null>({
    id: "RUN-2026-10",
    month: "October 2026",
    status: "Draft",
    current_step: 1,
    total_employees: 14,
    total_gross: 4942467,
    total_net: 3885467,
    total_deductions: 1057000,
    is_locked: false,
    is_supplementary: false,
    created_at: new Date().toISOString(),
  });
  const [allRuns, setAllRuns] = useState<PayrollRun[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSyncItem[]>([
    { employee_id: "BC-1001", employee_name: "Ananya Rao", department: "People Ops", total_days: 31, days_worked: 31, paid_leaves: 0, lop_days: 0, payable_days: 31 },
    { employee_id: "BC-1002", employee_name: "Naresh Vemparala", department: "Operations", total_days: 31, days_worked: 30, paid_leaves: 1, lop_days: 0, payable_days: 31 },
    { employee_id: "BC-1003", employee_name: "Karthik Reddy", department: "Engineering", total_days: 31, days_worked: 29, paid_leaves: 2, lop_days: 0, payable_days: 31 },
    { employee_id: "BC-1004", employee_name: "Priya Menon", department: "Product", total_days: 31, days_worked: 31, paid_leaves: 0, lop_days: 0, payable_days: 31 },
    { employee_id: "BC-1005", employee_name: "Meera Joshi", department: "Finance", total_days: 31, days_worked: 30, paid_leaves: 1, lop_days: 0, payable_days: 31 },
    { employee_id: "BC-1006", employee_name: "Rahul Varma", department: "Engineering", total_days: 31, days_worked: 28, paid_leaves: 2, lop_days: 1, payable_days: 30 },
  ]);
  const [variances, setVariances] = useState<VarianceItem[]>([
    { employee_id: "BC-1003", employee_name: "Karthik Reddy", department: "Engineering", previous_net: 206000, current_net: 245000, variance_amount: 39000, variance_pct: 18.9, flagged: true, reason: "Mid-Year Appraisal revision applied" },
    { employee_id: "BC-1006", employee_name: "Rahul Varma", department: "Engineering", previous_net: 172000, current_net: 165000, variance_amount: -7000, variance_pct: -4.1, flagged: false, reason: "1 day Loss of Pay deduction" },
  ]);
  const [registerList, setRegisterList] = useState<RegisterItem[]>([]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [inputs, setInputs] = useState<OneTimeInput[]>([
    { id: "IN-1", emp: "Karthik Reddy", type: "Performance Bonus", amt: 150000, notes: "Q3 Top Achiever" },
    { id: "IN-2", emp: "Arjun Nair", type: "Travel Reimbursement", amt: 48200, notes: "Client Visit Mumbai" },
    { id: "IN-3", emp: "Pooja Hegde", type: "Referral Bonus", amt: 35000, notes: "Backend Eng Hire" },
    { id: "IN-4", emp: "Sameer Joshi", type: "Notice Period Deduction", amt: -12500, notes: "Shortfall recovery" },
  ]);

  const [showAddInputModal, setShowAddInputModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showSuppModal, setShowSuppModal] = useState(false);

  const [financeApproved, setFinanceApproved] = useState(false);
  const [financeComments, setFinanceComments] = useState("All attendance deductions and incentive adjustments reconciled with ERP.");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [runsRes, activeRes, attRes, varRes, regRes] = await Promise.all([
        axios.get<PayrollRun[]>("/api/payroll/runs"),
        axios.get<PayrollRun>("/api/payroll/runs/active"),
        axios.get<AttendanceSyncItem[]>("/api/payroll/attendance-sync"),
        axios.get<VarianceItem[]>("/api/payroll/variances"),
        axios.get<RegisterItem[]>("/api/payroll/register"),
      ]);

      if (runsRes?.data?.length) setAllRuns(runsRes.data);
      if (activeRes?.data) {
        setActiveRun(activeRes.data);
        setCurrentStep(activeRes.data.current_step);
      }
      if (attRes?.data?.length) setAttendance(attRes.data);
      if (varRes?.data?.length) setVariances(varRes.data);
      if (regRes?.data?.length) setRegisterList(regRes.data);
    } catch {
      // Offline fallback state initialized in useState
    }
  };

  const handleAdvanceStep = async () => {
    if (!activeRun) return;
    if (activeRun.is_locked) {
      alert("This payroll run is locked. Create a supplementary run for modifications.");
      return;
    }

    if (currentStep < 5) {
      try {
        const nextStep = currentStep + 1;
        await axios.post(`/api/payroll/runs/${activeRun.id}/advance-step`);
        setCurrentStep(nextStep);
        setActiveRun({ ...activeRun, current_step: nextStep });
        addNotification({
          title: "Payroll Run Advanced",
          message: `Moved ${activeRun.month} to step ${nextStep}: ${paySteps[nextStep - 1].title}`,
          category: "payroll",
          actionUrl: "/payroll/runs",
        });
      } catch {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setActiveRun({ ...activeRun, current_step: nextStep });
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1 && !activeRun?.is_locked) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePublishAndLock = async () => {
    if (!activeRun) return;
    try {
      setPublishing(true);
      const res = await axios.post(`/api/payroll/runs/${activeRun.id}/publish-and-lock`);
      setActiveRun(res.data.run);
      setCurrentStep(5);
      setShowPublishModal(false);

      addNotification({
        title: "Payroll Disbursed & Month Locked",
        message: `${activeRun.month} payroll is officially locked. Payslips published to all employees.`,
        category: "payroll",
        actionUrl: "/payroll/runs",
      });

      const runsRes = await axios.get<PayrollRun[]>("/api/payroll/runs");
      setAllRuns(runsRes.data);
    } catch {
      setActiveRun({ ...activeRun, is_locked: true, status: "Locked & Disbursed" });
      setShowPublishModal(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleCreateSupplementary = async (month: string, notes: string) => {
    try {
      const res = await axios.post("/api/payroll/runs/create-supplementary", { month, notes });
      setAllRuns([res.data, ...allRuns]);
      setActiveRun(res.data);
      setCurrentStep(1);
      setShowSuppModal(false);
      setActiveTab("run");
    } catch {
      const newRun: PayrollRun = {
        id: `RUN-SUPP-${Date.now()}`,
        month: `${month} (Supp)`,
        status: "Draft",
        current_step: 1,
        total_employees: 4,
        total_gross: 180000,
        total_net: 165000,
        total_deductions: 15000,
        is_locked: false,
        is_supplementary: true,
        supplementary_notes: notes,
        created_at: new Date().toISOString(),
      };
      setAllRuns([newRun, ...allRuns]);
      setActiveRun(newRun);
      setCurrentStep(1);
      setShowSuppModal(false);
      setActiveTab("run");
    }
  };

  const handleAddInput = (data: { emp: string; type: string; amt: number; notes: string }) => {
    const newItem: OneTimeInput = {
      id: `IN-${Date.now()}`,
      emp: data.emp,
      type: data.type,
      amt: data.amt,
      notes: data.notes,
    };
    setInputs([newItem, ...inputs]);
    setShowAddInputModal(false);
  };

  const handleRemoveInput = (id: string) => {
    setInputs(inputs.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching Image 1 */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">PAYROLL</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payroll</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Run monthly payroll, review the salary register and stay on top of statutory filings.
        </p>

        {/* 4 Pills / Tabs matching Image 1 */}
        <div className="flex items-center gap-2 mt-5 p-1 rounded-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 w-fit">
          {[
            { id: "run", label: "Run payroll" },
            { id: "register", label: "Salary register" },
            { id: "compliance", label: "Statutory compliance" },
            { id: "history", label: "History" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200 dark:bg-[#132d56] dark:text-white dark:border-blue-500/40"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "run" && (
        <RunPayrollTab
          activeRun={activeRun}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          attendance={attendance}
          inputs={inputs}
          variances={variances}
          financeApproved={financeApproved}
          setFinanceApproved={setFinanceApproved}
          financeComments={financeComments}
          setFinanceComments={setFinanceComments}
          onAdvanceStep={handleAdvanceStep}
          onPreviousStep={handlePreviousStep}
          onOpenPublishModal={() => setShowPublishModal(true)}
          onOpenAddModal={() => setShowAddInputModal(true)}
          onRemoveInput={handleRemoveInput}
          onSyncAttendance={() => {
            addNotification({
              title: "Biometrics Synced",
              message: "Synced attendance with 14 active biometric profiles.",
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
        />
      )}

      {activeTab === "register" && (
        <RegisterTab
          activeRun={activeRun}
          registerData={registerList}
          onDownloadSlip={(emp) => {
            addNotification({
              title: "Payslip Download",
              message: `Downloading payslip PDF for ${emp}`,
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
          onExport={() => {
            addNotification({
              title: "Register Export",
              message: "Exporting full salary register CSV",
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
        />
      )}

      {activeTab === "compliance" && (
        <ComplianceTab
          onDownloadPack={() => {
            addNotification({
              title: "Audit Pack Download",
              message: "Generating combined statutory filings audit package...",
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
          onMarkFiled={(name) => {
            addNotification({
              title: "Filing Marked",
              message: `Recorded statutory return for ${name}`,
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
          onDownloadChallan={(name) => {
            addNotification({
              title: "Challan Receipt",
              message: `Opening verified challan receipt for ${name}`,
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          allRuns={allRuns}
          onOpenSuppModal={() => setShowSuppModal(true)}
          onExportBankFile={(month) => {
            addNotification({
              title: "Bank Export",
              message: `Exported batch transfer file for ${month}`,
              category: "payroll",
              actionUrl: "/payroll/runs",
            });
          }}
        />
      )}

      <AddInputModal
        isOpen={showAddInputModal}
        onClose={() => setShowAddInputModal(false)}
        onSubmit={handleAddInput}
      />

      <PublishLockModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublishAndLock}
        publishing={publishing}
        activeRun={activeRun}
      />

      <SupplementaryRunModal
        isOpen={showSuppModal}
        onClose={() => setShowSuppModal(false)}
        onSubmit={handleCreateSupplementary}
      />
    </div>
  );
};

export default PayrollAdminPage;

