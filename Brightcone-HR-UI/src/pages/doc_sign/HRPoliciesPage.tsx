import { DocDetailDrawer } from '../../components/common/DocDetailDrawer';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { INITIAL_POLICIES } from './mockData';
import { PolicyRecord } from './types';
import { ic } from '../../components/icons';
import { useAuth } from '../../context/AuthContext';

const POLICIES_STORAGE_KEY = 'brightcone_hr_policies';
const POLICIES_UPDATED_EVENT = 'brightcone:policies-updated';

const CATEGORIES = [
  'Leave',
  'Attendance & WFH',
  'Travel & expense',
  'IT & security',
  'Code of conduct',
  'POSH',
  'Compensation',
  'Other',
];

export function getStoredPolicies(): PolicyRecord[] {
  try {
    const raw = localStorage.getItem(POLICIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_POLICIES;
}

export function saveStoredPolicies(list: PolicyRecord[]) {
  try {
    localStorage.setItem(POLICIES_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(POLICIES_UPDATED_EVENT, { detail: list }));
  } catch {}
}

export const HRPoliciesPage: React.FC = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PolicyRecord[]>(() => getStoredPolicies());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<PolicyRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<PolicyRecord | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Leave');
  const [formVer, setFormVer] = useState('1.0');
  const [formEff, setFormEff] = useState('');
  const [formReview, setFormReview] = useState('');
  const [formOwner, setFormOwner] = useState(user?.name || 'HR Admin');
  const [formAckReq, setFormAckReq] = useState(true);
  const [formStatus, setFormStatus] = useState<PolicyRecord['status']>('Draft');

  useEffect(() => {
    const handleUpdate = () => {
      setPolicies(getStoredPolicies());
    };
    window.addEventListener(POLICIES_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(POLICIES_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const getEffectiveStatus = (p: PolicyRecord) => {
    if (p.nextReviewDate && p.nextReviewDate < todayStr && p.status === 'Published') return 'Overdue';
    return p.status;
  };

  const filtered = policies.filter((p) => {
    const q = search.trim().toLowerCase();
    const effSt = getEffectiveStatus(p);
    const mSearch = !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
    return mSearch && (statusFilter === 'All' || effSt === statusFilter) && (categoryFilter === 'All' || p.category === categoryFilter);
  });

  const openAddModal = () => {
    setEditingRecord(null);
    setFormName('');
    setFormCategory('Leave');
    setFormVer('1.0');
    setFormEff(todayStr);
    setFormReview(new Date(Date.now() + 180 * 864e5).toISOString().slice(0, 10));
    setFormOwner(user?.name || 'HR Admin');
    setFormAckReq(true);
    setFormStatus('Draft');
    setIsFormOpen(true);
  };

  const openEditModal = (rec: PolicyRecord) => {
    setEditingRecord(rec);
    setFormName(rec.name);
    setFormCategory(rec.category);
    setFormVer(rec.version);
    setFormEff(rec.effectiveDate);
    setFormReview(rec.nextReviewDate);
    setFormOwner(rec.owner);
    setFormAckReq(rec.ackRequired);
    setFormStatus(rec.status);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a policy name.');
      return;
    }
    if (editingRecord) {
      const updated = policies.map((p) => (p.id === editingRecord.id ? { ...p, name: formName, category: formCategory, version: formVer, effectiveDate: formEff, nextReviewDate: formReview, owner: formOwner, ackRequired: formAckReq, status: formStatus } : p));
      setPolicies(updated);
      saveStoredPolicies(updated);
      showToast(`Updated policy ${formName}`);
    } else {
      const newId = `POL-${String(policies.length + 1).padStart(2, '0')}`;
      const newPolicy: PolicyRecord = { id: newId, name: formName, category: formCategory, version: formVer, effectiveDate: formEff, nextReviewDate: formReview, owner: formOwner, file: `${formName.replace(/\s+/g, '_')}_v${formVer}.pdf`, ackRequired: formAckReq, status: formStatus };
      const updated = [newPolicy, ...policies];
      setPolicies(updated);
      saveStoredPolicies(updated);
      showToast(`Added policy ${newPolicy.name}`);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = policies.filter((p) => p.id !== id);
    setPolicies(updated);
    saveStoredPolicies(updated);
    showToast('Policy removed.');
  };

  const exportCSV = () => {
    const headers = ['ID', 'Policy Name', 'Category', 'Version', 'Effective Date', 'Next Review', 'Ack Required', 'Owner', 'Status'];
    const rows = filtered.map((p) => [p.id, `"${p.name.replace(/"/g, '""')}"`, `"${p.category}"`, p.version, p.effectiveDate, p.nextReviewDate, p.ackRequired ? 'Yes' : 'No', `"${p.owner}"`, getEffectiveStatus(p)]);
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));
    link.download = `hr_policies_${todayStr}.csv`;
    link.click();
    showToast('Exported HR Policies CSV.');
  };

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
          <h1 className="text-2xl font-bold font-heading text-[var(--text)]">Company policies</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Author, version, and publish company policies. When acknowledgement is required, link them in Policy acknowledgements.
          </p>
        </div>
        <div className="actions flex flex-wrap gap-2">
          <button type="button" className="btn" onClick={exportCSV}>
            {ic('download', 15)}
            Export CSV
          </button>
          <button type="button" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }} onClick={openAddModal}>
            {ic('plus', 15)}
            Add policy
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k"><i>{ic('doc', 16)}</i>Total policies</div>
          <div className="v">{policies.length}</div>
          <div className="d">Across {new Set(policies.map((p) => p.category)).size} categories</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('check', 16)}</i>Published</div>
          <div className="v">{policies.filter((p) => p.status === 'Published').length}</div>
          <div className="d up">Active &amp; visible</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('clock', 16)}</i>Drafts</div>
          <div className="v">{policies.filter((p) => p.status === 'Draft').length}</div>
          <div className="d">Work in progress</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('clock', 16)}</i>Review overdue</div>
          <div className="v">{policies.filter((p) => getEffectiveStatus(p) === 'Overdue').length}</div>
          <div className="d" style={{ color: 'var(--bad)' }}>Annual review needed</div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="card mt rv">
        <div className="toolbar rtools flex flex-wrap items-center gap-3 p-4 border-b border-[var(--line)]">
          <label className="search flex-1 min-w-[200px] max-w-sm flex items-center gap-2 bg-[var(--surface-2)] px-3 py-1.5 rounded-lg border border-[var(--line)]">
            {ic('search', 15)}
            <input className="bg-transparent border-0 outline-hidden text-xs w-full" type="search" placeholder="Search policies by name, category or owner" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <select className="input text-xs py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Under review">Under review</option>
            <option value="Overdue">Overdue</option>
          </select>
          <select className="input text-xs py-1.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
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
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">POLICY NAME</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">CATEGORY</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">VERSION</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">EFFECTIVE</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">NEXT REVIEW</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">ACK</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">OWNER</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)]">STATUS</th>
                <th className="py-2.5 px-4 font-semibold text-[var(--muted)] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const effSt = getEffectiveStatus(p);
                return (
                  <tr key={p.id} className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--text)]">{p.name}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{p.category}</td>
                    <td className="py-3 px-4 font-mono text-[var(--muted)]">{p.version}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{p.effectiveDate}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{p.nextReviewDate}</td>
                    <td className="py-3 px-4">{p.ackRequired ? <span className="pill text-[10px] px-2 py-0.5 rounded-full font-semibold p-warn">Required</span> : <span className="text-[var(--muted)]">—</span>}</td>
                    <td className="py-3 px-4 font-medium text-[var(--text)]">{p.owner}</td>
                    <td className="py-3 px-4"><span className={`pill text-[10px] px-2 py-0.5 rounded-full font-semibold ${effSt === 'Published' ? 'p-ok' : effSt === 'Overdue' ? 'p-bad' : 'p-warn'}`}>{effSt}</span></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="btn sm ib" title="View details" onClick={() => setViewRecord(p)}>
                          <Eye size={15} />
                        </button>
                        <button type="button" className="btn sm ib" title="Edit" onClick={() => openEditModal(p)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="btn sm ib bad" title="Delete" onClick={() => handleDelete(p.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty p-8 text-center text-xs text-[var(--muted)]">No policies match the current filters.</div>}
        </div>

        <div className="rfoot flex items-center justify-between p-3 border-t border-[var(--line)] text-xs text-[var(--muted)]">
          <span>{filtered.length} of {policies.length} shown</span>
          <span>Synced with Policy Acknowledgements</span>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setIsFormOpen(false)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-lg">
            <h2 className="text-lg font-bold font-heading mb-4 text-[var(--text)]">{editingRecord ? `Edit ${editingRecord.name}` : 'Add company policy'}</h2>
            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Policy name *</span><input className="input w-full" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Work From Home & Hybrid Policy" required /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Category</span><select className="input w-full" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Version</span><input className="input w-full" value={formVer} onChange={(e) => setFormVer(e.target.value)} placeholder="e.g. 1.0" required /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Effective date</span><input className="input w-full" type="date" value={formEff} onChange={(e) => setFormEff(e.target.value)} required /></label>
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Next review date</span><input className="input w-full" type="date" value={formReview} onChange={(e) => setFormReview(e.target.value)} required /></label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Owner</span><input className="input w-full" value={formOwner} onChange={(e) => setFormOwner(e.target.value)} required /></label>
                <label className="block"><span className="font-semibold text-[var(--muted)] block mb-1">Status</span><select className="input w-full" value={formStatus} onChange={(e) => setFormStatus(e.target.value as PolicyRecord['status'])}><option value="Draft">Draft</option><option value="Published">Published</option><option value="Under review">Under review</option></select></label>
              </div>
              <label className="check flex items-center gap-2 pt-2">
                <input type="checkbox" checked={formAckReq} onChange={(e) => setFormAckReq(e.target.checked)} />
                <span className="font-medium text-[var(--text)]">Acknowledgement required by all staff</span>
              </label>
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }}>Save policy</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Details View Drawer */}
      {viewRecord && (
        <DocDetailDrawer
          title={viewRecord.name}
          isOpen={!!viewRecord}
          onClose={() => setViewRecord(null)}
          metadata={[
            { label: 'Category', value: viewRecord.category },
            { label: 'Version', value: viewRecord.version },
            { label: 'Status', value: getEffectiveStatus(viewRecord) },
            { label: 'Owner', value: viewRecord.owner },
            { label: 'Effective Date', value: viewRecord.effectiveDate },
            { label: 'Next Review', value: viewRecord.nextReviewDate },
            { label: 'Acknowledgement Required', value: viewRecord.ackRequired ? 'Yes' : 'No' },
          ]}
          summary={`${viewRecord.name} (v${viewRecord.version}) is managed by ${viewRecord.owner}.`}
        />
      )}
    </div>
  );
};

export default HRPoliciesPage;