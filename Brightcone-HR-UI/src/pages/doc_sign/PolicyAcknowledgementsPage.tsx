import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import { Eye, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { INITIAL_POLICY_ACKS, INITIAL_POLICIES } from './mockData';
import { PolicyAckRecord, PolicyRecord } from './types';
import { ic } from '../../components/icons';
import { getStoredPolicies } from './HRPoliciesPage';
import { useUnifiedEmployees } from '../../services/employeeData';

const ACKS_STORAGE_KEY = 'brightcone_policy_acks';
const POLICIES_UPDATED_EVENT = 'brightcone:policies-updated';
const ACKS_UPDATED_EVENT = 'brightcone:policy-acks-updated';

function getStoredAcks(): PolicyAckRecord[] {
  try {
    const raw = localStorage.getItem(ACKS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_POLICY_ACKS;
}

function saveStoredAcks(list: PolicyAckRecord[]) {
  try {
    localStorage.setItem(ACKS_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(ACKS_UPDATED_EVENT, { detail: list }));
  } catch {}
}

export const PolicyAcknowledgementsPage: React.FC = () => {
  const { employees } = useUnifiedEmployees();
  const [policies, setPolicies] = useState<PolicyRecord[]>(() => getStoredPolicies());
  const [acks, setAcks] = useState<PolicyAckRecord[]>(() => getStoredAcks());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSendAllOpen, setIsSendAllOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<PolicyAckRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PolicyAckRecord | null>(null);

  const [formPolicy, setFormPolicy] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formEmpName, setFormEmpName] = useState('');
  const [formEmpEmail, setFormEmpEmail] = useState('');
  const [formDept, setFormDept] = useState('Engineering');
  const [formSent, setFormSent] = useState('');
  const [formDue, setFormDue] = useState('');
  const [formAckOn, setFormAckOn] = useState('');
  const [formStatus, setFormStatus] = useState<PolicyAckRecord['status']>('Pending');

  const [batchPolicy, setBatchPolicy] = useState('');
  const [batchDue, setBatchDue] = useState(new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));

  // Listen to policy and acknowledgement updates across pages
  useEffect(() => {
    const handlePoliciesUpdate = () => {
      const stored = getStoredPolicies();
      setPolicies(stored);
      if (!batchPolicy && stored.length > 0) {
        setBatchPolicy(`${stored[0].name} v${stored[0].version}`);
      }
    };
    const handleAcksUpdate = () => {
      setAcks(getStoredAcks());
    };

    window.addEventListener(POLICIES_UPDATED_EVENT, handlePoliciesUpdate);
    window.addEventListener(ACKS_UPDATED_EVENT, handleAcksUpdate);
    window.addEventListener('storage', handlePoliciesUpdate);
    window.addEventListener('storage', handleAcksUpdate);

    // Initial policy selection default
    if (policies.length > 0 && !batchPolicy) {
      setBatchPolicy(`${policies[0].name} v${policies[0].version}`);
    }

    return () => {
      window.removeEventListener(POLICIES_UPDATED_EVENT, handlePoliciesUpdate);
      window.removeEventListener(ACKS_UPDATED_EVENT, handleAcksUpdate);
      window.removeEventListener('storage', handlePoliciesUpdate);
      window.removeEventListener('storage', handleAcksUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const getEffectiveStatus = (a: PolicyAckRecord) => {
    if (a.status === 'Pending' && a.dueDate && a.dueDate < todayStr) return 'Overdue';
    return a.status;
  };

  const filtered = acks.filter((a) => {
    const q = search.trim().toLowerCase();
    const effSt = getEffectiveStatus(a);
    const mSearch = !q || a.id.toLowerCase().includes(q) || a.policyName.toLowerCase().includes(q) || a.employeeName.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
    return mSearch && (statusFilter === 'All' || effSt === statusFilter);
  });

  const openAddModal = () => {
    const defaultPol = policies[0] ? `${policies[0].name} v${policies[0].version}` : 'Employee Handbook v4.0';
    const firstEmp = employees[0];
    setEditingRecord(null);
    setFormPolicy(defaultPol);
    if (firstEmp) {
      setFormEmpId(firstEmp.id);
      setFormEmpName(firstEmp.name);
      setFormEmpEmail(firstEmp.email);
      setFormDept(firstEmp.dept);
    } else {
      setFormEmpId('');
      setFormEmpName('');
      setFormEmpEmail('');
      setFormDept('Engineering');
    }
    setFormSent(todayStr);
    setFormDue(new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10));
    setFormAckOn('');
    setFormStatus('Pending');
    setIsAddOpen(true);
  };

  const openEditModal = (rec: PolicyAckRecord) => {
    setEditingRecord(rec);
    setFormPolicy(rec.policyName);
    setFormEmpName(rec.employeeName);
    setFormEmpEmail(rec.employeeEmail);
    setFormDept(rec.department);
    setFormSent(rec.sentDate);
    setFormDue(rec.dueDate);
    setFormAckOn(rec.acknowledgedOn || '');
    setFormStatus(rec.status);
    setIsAddOpen(true);
  };

  const handleEmployeeSelect = (empId: string) => {
    setFormEmpId(empId);
    const selected = employees.find((e) => e.id === empId);
    if (selected) {
      setFormEmpName(selected.name);
      setFormEmpEmail(selected.email);
      setFormDept(selected.dept);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmpName.trim()) {
      showToast('Please select or enter an employee name.');
      return;
    }
    if (editingRecord) {
      const updated = acks.map((a) =>
        a.id === editingRecord.id
          ? { ...a, policyName: formPolicy, employeeName: formEmpName, employeeEmail: formEmpEmail, department: formDept, sentDate: formSent, dueDate: formDue, acknowledgedOn: formAckOn || undefined, status: formAckOn ? 'Acknowledged' : formStatus }
          : a
      );
      setAcks(updated);
      saveStoredAcks(updated);
      showToast(`Updated acknowledgement for ${formEmpName}`);
    } else {
      const newAck: PolicyAckRecord = {
        id: `ACK-${100 + acks.length + 1}`,
        policyId: 'POL-GEN',
        policyName: formPolicy,
        employeeName: formEmpName,
        employeeEmail: formEmpEmail || `${formEmpName.toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
        department: formDept,
        sentDate: formSent,
        dueDate: formDue,
        acknowledgedOn: formAckOn || undefined,
        status: formAckOn ? 'Acknowledged' : formStatus,
      };
      const updated = [newAck, ...acks];
      setAcks(updated);
      saveStoredAcks(updated);
      showToast(`Created acknowledgement request for ${formEmpName}`);
    }
    setIsAddOpen(false);
  };

  const handleSendAllBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPolicy = batchPolicy || (policies[0] ? `${policies[0].name} v${policies[0].version}` : 'Employee Handbook v4.0');

    // Use live employees from unified employee directory
    const activeStaff = employees.length > 0 ? employees : [
      { id: '1', name: 'Naresh Vemparala', email: 'naresh.v@brightcone.ai', dept: 'Leadership' },
      { id: '2', name: 'Karthik Reddy', email: 'karthik.r@brightcone.ai', dept: 'Engineering' },
      { id: '3', name: 'Priya Menon', email: 'priya.m@brightcone.ai', dept: 'Product' },
    ];

    const newItems: PolicyAckRecord[] = activeStaff.map((st, i) => ({
      id: `ACK-${200 + acks.length + i + 1}`,
      policyId: 'BATCH',
      policyName: targetPolicy,
      employeeName: st.name,
      employeeEmail: st.email,
      department: st.dept,
      sentDate: todayStr,
      dueDate: batchDue,
      status: 'Pending',
    }));

    const updated = [...newItems, ...acks];
    setAcks(updated);
    saveStoredAcks(updated);
    setIsSendAllOpen(false);
    showToast(`Dispatched "${targetPolicy}" acknowledgement to all ${activeStaff.length} employees.`);
  };

  const handleToggleAcknowledge = (rec: PolicyAckRecord) => {
    const isNowAcked = rec.status !== 'Acknowledged';
    const updated = acks.map((a) =>
      a.id === rec.id
        ? {
            ...a,
            status: isNowAcked ? ('Acknowledged' as const) : ('Pending' as const),
            acknowledgedOn: isNowAcked ? todayStr : undefined,
          }
        : a
    );
    setAcks(updated);
    saveStoredAcks(updated);
    showToast(isNowAcked ? `Marked as acknowledged by ${rec.employeeName}.` : `Reopened pending status.`);
  };

  const handleDelete = (id: string) => {
    const updated = acks.filter((x) => x.id !== id);
    setAcks(updated);
    saveStoredAcks(updated);
    showToast('Acknowledgement record deleted.');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Policy or Handbook', 'Employee', 'Email', 'Department', 'Sent On', 'Due Date', 'Acknowledged On', 'Status'];
    const rows = filtered.map((a) => [a.id, `"${a.policyName.replace(/"/g, '""')}"`, `"${a.employeeName}"`, a.employeeEmail, `"${a.department}"`, a.sentDate, a.dueDate, a.acknowledgedOn || '—', getEffectiveStatus(a)]);
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));
    link.download = `policy_acknowledgements_${todayStr}.csv`;
    link.click();
    showToast('Exported Policy Acknowledgements CSV.');
  };

  const pendingCount = acks.filter((a) => getEffectiveStatus(a) === 'Pending').length;
  const ackCount = acks.filter((a) => a.status === 'Acknowledged').length;
  const overdueCount = acks.filter((a) => getEffectiveStatus(a) === 'Overdue').length;

  return (
    <div className="view pb-12 select-none" style={{ '--ac': '#D9466F', animation: 'fade .25s ease' } as React.CSSProperties}>
      {toastMessage && (
        <div className="toast on" style={{ position: 'fixed', zIndex: 100 }}>
          {ic('check', 18)}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Head */}
      <div className="head flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <span className="eyebrow">Sign</span>
          <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Policy acknowledgements</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Track policy acknowledgements across your workforce. Policies created in Company Policies dynamically reflect here.
          </p>
        </div>
        <div className="actions flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={() => setIsSendAllOpen(true)}>
            {ic('send', 15)}
            Send to all employees
          </button>
          <button type="button" className="btn" onClick={exportCSV}>
            {ic('download', 15)}
            Export CSV
          </button>
          <button type="button" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }} onClick={openAddModal}>
            {ic('plus', 15)}
            Add acknowledgement
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k"><i>{ic('doc', 16)}</i>Total records</div>
          <div className="v">{acks.length}</div>
          <div className="d">Live employee records</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('clock', 16)}</i>Pending</div>
          <div className="v">{pendingCount}</div>
          <div className="d">Awaiting sign-off</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('check', 16)}</i>Acknowledged</div>
          <div className="v">{ackCount}</div>
          <div className="d up">Confirmed sign-offs</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('clock', 16)}</i>Overdue</div>
          <div className="v">{overdueCount}</div>
          <div className="d" style={{ color: 'var(--bad)' }}>Past due date</div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="card mt rv">
        <div className="toolbar rtools flex flex-wrap items-center gap-3 p-4 border-b border-[var(--line)]">
          <label className="search flex-1 min-w-[200px] max-w-sm flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-lg border border-[var(--line)]">
            {ic('search', 15)}
            <input className="bg-transparent border-0 outline-hidden text-xs w-full" type="search" placeholder="Search by policy, employee or department" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select className="input text-xs py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Overdue">Overdue</option>
          </select>
          <label className="check flex items-center gap-2 text-xs ml-auto cursor-pointer">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            <span>Archived (0)</span>
          </label>
        </div>

        <div className="table-wrap overflow-x-auto">
          <table className="rtable w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">POLICY OR HANDBOOK</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">EMPLOYEE</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">SENT ON</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">DUE</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">ACKNOWLEDGED ON</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const effSt = getEffectiveStatus(a);
                return (
                  <tr key={a.id} className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text)]">{a.policyName}</td>
                    <td className="py-3 px-4">
                      <b className="block text-[var(--text)]">{a.employeeName}</b>
                      <span className="text-[11px] text-[var(--muted)]">{a.employeeEmail} · {a.department}</span>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)]">{a.sentDate}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{a.dueDate}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{a.acknowledgedOn || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`pill text-[10px] px-2 py-0.5 rounded-full font-semibold ${effSt === 'Acknowledged' ? 'p-ok' : effSt === 'Overdue' ? 'p-bad' : 'p-warn'}`}>
                        {effSt}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => handleToggleAcknowledge(a)}
                          title={effSt === 'Acknowledged' ? 'Mark Pending' : 'Mark Acknowledged'}
                        >
                          {effSt === 'Acknowledged' ? 'Reopen' : 'Acknowledge'}
                        </button>
                        <button type="button" className="btn sm ib" title="View details" onClick={() => setViewRecord(a)}>
                          <Eye size={15} />
                        </button>
                        <button type="button" className="btn sm ib" title="Edit" onClick={() => openEditModal(a)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="btn sm ib bad" title="Delete" onClick={() => handleDelete(a.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty p-8 text-center text-xs text-[var(--muted)]">
              No policy acknowledgements match these filters. Use <b>Send to all employees</b> to create acknowledgements for active policies.
            </div>
          )}
        </div>

        <div className="rfoot flex items-center justify-between p-3 border-t border-[var(--line)] text-xs text-[var(--muted)]">
          <span>{filtered.length} of {acks.length} shown</span>
          <span>Synced live with Company Policies</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setIsAddOpen(false)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-lg">
            <h2 className="text-lg font-bold font-heading mb-4 text-[var(--text)]">{editingRecord ? `Edit ${editingRecord.id}` : 'Add acknowledgement'}</h2>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <label className="block">
                <span className="font-semibold text-[var(--muted)] block mb-1">Select Policy / Handbook *</span>
                <select className="input w-full" value={formPolicy} onChange={(e) => setFormPolicy(e.target.value)}>
                  <option value="Employee Handbook v4.0">Employee Handbook v4.0 (HB-4.0)</option>
                  {policies.map((p) => (
                    <option key={p.id} value={`${p.name} v${p.version}`}>
                      {p.name} v{p.version} ({p.id})
                    </option>
                  ))}
                </select>
              </label>

              {/* Employee Selector dropdown matching unified employees */}
              <div>
                <label className="block mb-1 font-semibold text-[var(--muted)]">Select Employee *</label>
                <select
                  className="input w-full"
                  value={formEmpId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.dept} - {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Employee Name</span>
                  <input className="input w-full" value={formEmpName} onChange={(e) => setFormEmpName(e.target.value)} placeholder="e.g. Rahul Varma" required />
                </label>
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Employee Email</span>
                  <input className="input w-full" value={formEmpEmail} onChange={(e) => setFormEmpEmail(e.target.value)} placeholder="e.g. rahul.v@brightcone.ai" />
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Department</span>
                  <input className="input w-full" value={formDept} onChange={(e) => setFormDept(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Sent on</span>
                  <input className="input w-full" type="date" value={formSent} onChange={(e) => setFormSent(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Due date *</span>
                  <input className="input w-full" type="date" value={formDue} onChange={(e) => setFormDue(e.target.value)} required />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Acknowledged on</span>
                  <input className="input w-full" type="date" value={formAckOn} onChange={(e) => setFormAckOn(e.target.value)} />
                </label>
                <label className="block">
                  <span className="font-semibold text-[var(--muted)] block mb-1">Status</span>
                  <select className="input w-full" value={formStatus} onChange={(e) => setFormStatus(e.target.value as PolicyAckRecord['status'])}>
                    <option value="Pending">Pending</option>
                    <option value="Acknowledged">Acknowledged</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button type="button" className="btn" onClick={() => setIsAddOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }}>Save record</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Send to all employees Modal */}
      {isSendAllOpen && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setIsSendAllOpen(false)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-md">
            <h2 className="text-lg font-bold font-heading mb-2 text-[var(--text)]">Send policy to all employees</h2>
            <p className="text-xs text-[var(--muted)] mb-4">
              Dispatches signature &amp; compliance acknowledgement requests to all {employees.length || 'active'} employees in your workforce.
            </p>
            <form onSubmit={handleSendAllBatch} className="space-y-3 text-xs">
              <label className="block">
                <span className="font-semibold text-[var(--muted)] block mb-1">Select policy / handbook</span>
                <select className="input w-full" value={batchPolicy} onChange={(e) => setBatchPolicy(e.target.value)}>
                  <option value="Employee Handbook v4.0">Employee Handbook v4.0 (HB-4.0)</option>
                  {policies.map((p) => (
                    <option key={p.id} value={`${p.name} v${p.version}`}>
                      {p.name} v{p.version} ({p.category})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-semibold text-[var(--muted)] block mb-1">Due date</span>
                <input className="input w-full" type="date" value={batchDue} onChange={(e) => setBatchDue(e.target.value)} required />
              </label>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--muted)]">
                Creates {employees.length} personalized acknowledgement entries linked to each respective employee profile.
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button type="button" className="btn" onClick={() => setIsSendAllOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }}>
                  Send to {employees.length} employees
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Details View Modal */}
      {viewRecord && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setViewRecord(null)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-md">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
              <h2 className="text-base font-bold font-heading">{viewRecord.policyName}</h2>
              <button className="text-muted hover:text-[var(--text)]" onClick={() => setViewRecord(null)} aria-label="Close">
                {ic('x', 14)}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div><span className="text-[var(--muted)]">Employee:</span> <b>{viewRecord.employeeName}</b></div>
              <div><span className="text-[var(--muted)]">Email:</span> <span className="font-mono">{viewRecord.employeeEmail}</span></div>
              <div><span className="text-[var(--muted)]">Department:</span> <b>{viewRecord.department}</b></div>
              <div><span className="text-[var(--muted)]">Sent on:</span> <b>{viewRecord.sentDate}</b></div>
              <div><span className="text-[var(--muted)]">Due date:</span> <b>{viewRecord.dueDate}</b></div>
              <div><span className="text-[var(--muted)]">Acknowledged on:</span> <b>{viewRecord.acknowledgedOn || 'Pending signature'}</b></div>
              <div><span className="text-[var(--muted)]">Status:</span> <span className="pill p-ok">{getEffectiveStatus(viewRecord)}</span></div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-[var(--line)]">
              <button className="btn sm" onClick={() => setViewRecord(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PolicyAcknowledgementsPage;