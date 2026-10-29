import { useState, useEffect } from "react";
import axios from "axios";
import { useNotifications } from "../../../services/NotificationsContext";
import {
  type SalaryStructure,
  type SalaryRevision,
  type IncrementRecord,
  type SalaryBreakdown,
  defaultStructures,
  defaultRevisions,
  defaultHistory,
} from "./types";

export function useSalaryStructure() {
  const [structures, setStructures] = useState<SalaryStructure[]>(defaultStructures);
  const [revisions, setRevisions] = useState<SalaryRevision[]>(defaultRevisions);
  const [history, setHistory] = useState<IncrementRecord[]>(defaultHistory);
  const { addNotification } = useNotifications();

  // Live Calculator State (PAY-01)
  const [calcInputGross, setCalcInputGross] = useState("100000");
  const [calcPfCapped, setCalcPfCapped] = useState(true);
  const [calcRegime, setCalcRegime] = useState("New");
  const [calcResult, setCalcResult] = useState<SalaryBreakdown | null>(null);

  const fetchAll = async () => {
    try {
      const [resStructs, resRevs, resHist] = await Promise.all([
        axios.get("/api/salary/structures"),
        axios.get("/api/salary/revisions"),
        axios.get("/api/salary/increments"),
      ]);
      if (resStructs.data) setStructures(resStructs.data);
      if (resRevs.data) setRevisions(resRevs.data);
      if (resHist.data) setHistory(resHist.data);
    } catch {
      // Keep local default state
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const runLiveCalculation = async () => {
    const num = parseFloat(calcInputGross) || 0;
    if (num <= 0) return;

    try {
      const res = await axios.post("/api/salary/calculate", {
        gross_monthly: num,
        pf_capped: calcPfCapped,
        tax_regime: calcRegime,
      });
      if (res.data) setCalcResult(res.data);
    } catch {
      const basic = Math.round(num * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = num - basic - hra;
      const pf = calcPfCapped ? Math.min(1800, Math.round(basic * 0.12)) : Math.round(basic * 0.12);
      const pt = num > 15000 ? 200 : 150;
      const tds = num > 100000 ? Math.round(num * 0.06) : 0;
      const net = num - pf - pt - tds;

      setCalcResult({
        gross_monthly_rupees: num,
        basic_monthly_rupees: basic,
        hra_monthly_rupees: hra,
        special_allowance_rupees: special,
        employee_pf_rupees: pf,
        employer_pf_rupees: pf,
        professional_tax_rupees: pt,
        estimated_tds_rupees: tds,
        net_take_home_rupees: net,
        annual_ctc_rupees: (num + pf) * 12,
        gross_monthly_paise: num * 100,
        basic_monthly_paise: basic * 100,
        hra_monthly_paise: hra * 100,
        special_allowance_paise: special * 100,
        employee_pf_paise: pf * 100,
        employer_pf_paise: pf * 100,
        professional_tax_paise: pt * 100,
        estimated_tds_paise: tds * 100,
        net_take_home_paise: net * 100,
      });
    }
  };

  useEffect(() => {
    runLiveCalculation();
  }, [calcInputGross, calcPfCapped, calcRegime]);

  const handleProposeRevision = async (data: {
    employee_id: string;
    employee_name: string;
    current_gross: number;
    proposed_gross: number;
    reason: string;
    notes: string;
    effective_date: string;
  }) => {
    const incAmt = data.proposed_gross - data.current_gross;
    const incPct = Math.round((incAmt / data.current_gross) * 10000) / 100;

    try {
      const res = await axios.post("/api/salary/revisions", data);
      if (res.data) setRevisions((prev) => [res.data, ...prev]);
    } catch {
      const newRev: SalaryRevision = {
        id: `REV-${Math.floor(100 + Math.random() * 900)}`,
        employee_id: data.employee_id,
        employee_name: data.employee_name,
        current_gross: data.current_gross,
        proposed_gross: data.proposed_gross,
        increment_percent: incPct,
        effective_date: data.effective_date,
        reason: data.reason,
        notes: data.notes,
        status: "Under Review",
        created_at: new Date().toISOString(),
      };
      setRevisions((prev) => [newRev, ...prev]);
    }

    addNotification({
      title: "Salary Revision Proposed",
      message: `Revision of +${incPct}% for ${data.employee_name} submitted for compensation committee approval.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });
  };

  const handleApproveRevision = async (revId: string) => {
    try {
      await axios.post(`/api/salary/revisions/${revId}/approve`);
      await fetchAll();
    } catch {
      const rev = revisions.find((r) => r.id === revId);
      if (!rev) return;

      setRevisions((prev) =>
        prev.map((r) =>
          r.id === revId
            ? {
                ...r,
                status: "Approved",
                approved_by: "HR Compensation Committee",
                approved_at: new Date().toISOString(),
              }
            : r
        )
      );

      const incRecord: IncrementRecord = {
        id: `INC-${Math.floor(10 + Math.random() * 90)}`,
        employee_id: rev.employee_id,
        employee_name: rev.employee_name,
        previous_gross: rev.current_gross,
        revised_gross: rev.proposed_gross,
        increment_amount: rev.proposed_gross - rev.current_gross,
        increment_percentage: rev.increment_percent,
        effective_date: rev.effective_date,
        change_type: rev.reason,
        approved_by: "HR Compensation Committee",
        approved_at: new Date().toISOString(),
        notes: rev.notes,
      };
      setHistory((prev) => [incRecord, ...prev]);

      const newStructId = `STR-${Math.floor(100 + Math.random() * 900)}`;
      const basic = Math.round(rev.proposed_gross * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = rev.proposed_gross - basic - hra;
      const pf = 1800;
      const pt = 200;
      const tds = rev.proposed_gross > 100000 ? Math.round(rev.proposed_gross * 0.05) : 0;
      const net = rev.proposed_gross - pf - pt - tds;

      setStructures((prev) => [
        {
          id: newStructId,
          employee_id: rev.employee_id,
          employee_name: rev.employee_name,
          department: "Engineering",
          effective_from: rev.effective_date,
          gross_monthly: rev.proposed_gross,
          basic,
          hra,
          special_allowance: special,
          employee_pf: pf,
          professional_tax: pt,
          estimated_tds: tds,
          net_take_home: net,
          annual_ctc: (rev.proposed_gross + pf) * 12,
          pf_opt_out: false,
          tax_regime: "New",
          is_active: true,
        },
        ...prev.map((s) =>
          s.employee_id === rev.employee_id && s.is_active
            ? { ...s, is_active: false, superseded_by: newStructId }
            : s
        ),
      ]);
    }

    addNotification({
      title: "Salary Revision Approved",
      message: `Revision approved! New active structure created and increment history updated automatically.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });
  };

  const handleCreateStructure = async (data: {
    employee_id: string;
    employee_name: string;
    department: string;
    gross_monthly: number;
    pf_opt_out: boolean;
    tax_regime: string;
    effective_from: string;
  }) => {
    try {
      const res = await axios.post("/api/salary/structures", data);
      if (res.data) {
        await fetchAll();
      }
    } catch {
      const newId = `STR-${Math.floor(100 + Math.random() * 900)}`;
      const basic = Math.round(data.gross_monthly * 0.5);
      const hra = Math.round(basic * 0.5);
      const special = data.gross_monthly - basic - hra;
      const pf = data.pf_opt_out ? Math.round(basic * 0.12) : 1800;
      const pt = 200;
      const tds = data.gross_monthly > 100000 ? Math.round(data.gross_monthly * 0.05) : 0;
      const net = data.gross_monthly - pf - pt - tds;

      setStructures((prev) => [
        {
          id: newId,
          employee_id: data.employee_id,
          employee_name: data.employee_name,
          department: data.department,
          effective_from: data.effective_from,
          gross_monthly: data.gross_monthly,
          basic,
          hra,
          special_allowance: special,
          employee_pf: pf,
          professional_tax: pt,
          estimated_tds: tds,
          net_take_home: net,
          annual_ctc: (data.gross_monthly + pf) * 12,
          pf_opt_out: data.pf_opt_out,
          tax_regime: data.tax_regime,
          is_active: true,
        },
        ...prev.map((s) =>
          s.employee_id === data.employee_id && s.is_active
            ? { ...s, is_active: false, superseded_by: newId }
            : s
        ),
      ]);
    }

    addNotification({
      title: "Salary Structure Configured",
      message: `Active salary structure configured for ${data.employee_name}. Previous active revision superseded.`,
      category: "payroll",
      actionUrl: "/payroll/salary-structure",
    });
  };

  return {
    structures,
    revisions,
    history,
    calcInputGross,
    setCalcInputGross,
    calcPfCapped,
    setCalcPfCapped,
    calcRegime,
    setCalcRegime,
    calcResult,
    handleProposeRevision,
    handleApproveRevision,
    handleCreateStructure,
  };
}
