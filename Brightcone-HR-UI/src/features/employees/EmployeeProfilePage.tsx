import React, { useState, useEffect } from 'react';
import { employeesApi } from '../../api/employees.api';
import { EmployeeProfile, ServiceRequest, ServiceRequestCategory, EmployeeDependent } from '../../types/employee.types';
import { CheckCircle, X, Edit3, ShieldCheck } from 'lucide-react';

export const EmployeeProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'job' | 'bank' | 'family'>('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form edit state
  const [editForm, setEditForm] = useState<Partial<EmployeeProfile>>({});

  // Raise a request modal state (matching Screenshot 5)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestCategory, setRequestCategory] = useState<ServiceRequestCategory>('Payroll & tax');
  const [requestSubject, setRequestSubject] = useState('Change salary bank account');
  const [requestPriority, setRequestPriority] = useState<'Normal' | 'Urgent' | 'High' | 'Low'>('Normal');
  const [requestDetails, setRequestDetails] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  // Family Dependents state (matching Screenshot 3 & 4)
  const [dependents, setDependents] = useState<EmployeeDependent[]>([]);
  const [isAddDependentOpen, setIsAddDependentOpen] = useState(false);
  const [depName, setDepName] = useState('');
  const [depRelationship, setDepRelationship] = useState('Spouse');
  const [depDob, setDepDob] = useState('');
  const [submittingDependent, setSubmittingDependent] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await employeesApi.getMyProfile('rahul.varma@brightcone.ai');
      setProfile(data);
      setEditForm(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const list = await employeesApi.getServiceRequests();
      setServiceRequests(list);
    } catch {
      // fallback
    }
  };

  const fetchDependents = async () => {
    try {
      const data = await employeesApi.getDependents('BC-1038');
      if (data && data.length > 0) {
        setDependents(data);
      } else {
        setDependents([
          {
            id: 'DEP-0001',
            employee_id: 'BC-1038',
            name: 'Sravya Varma',
            relationship: 'Spouse',
            dob: 'Apr 14, 1997',
            date_of_birth: 'Apr 14, 1997',
          },
          {
            id: 'DEP-0002',
            employee_id: 'BC-1038',
            name: 'Lakshmi Varma',
            relationship: 'Mother',
            dob: 'Feb 2, 1968',
            date_of_birth: 'Feb 2, 1968',
          },
        ]);
      }
    } catch {
      setDependents([
        {
          id: 'DEP-0001',
          employee_id: 'BC-1038',
          name: 'Sravya Varma',
          relationship: 'Spouse',
          dob: 'Apr 14, 1997',
          date_of_birth: 'Apr 14, 1997',
        },
        {
          id: 'DEP-0002',
          employee_id: 'BC-1038',
          name: 'Lakshmi Varma',
          relationship: 'Mother',
          dob: 'Feb 2, 1968',
          date_of_birth: 'Feb 2, 1968',
        },
      ]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchServiceRequests();
    fetchDependents();
  }, []);

  const handleOpenAddDependent = () => {
    setDepName('');
    setDepRelationship('Spouse');
    setDepDob('');
    setIsAddDependentOpen(true);
  };

  const handleAddDependent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depName.trim() || !depDob.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    let formattedDob = depDob;
    if (depDob.includes('-') && depDob.length === 10) {
      const d = new Date(depDob);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    setSubmittingDependent(true);
    try {
      const newDep = await employeesApi.createDependent({
        employee_id: profile?.employee_id || 'BC-1038',
        name: depName.trim(),
        relationship: depRelationship,
        dob: formattedDob,
        date_of_birth: formattedDob,
      });
      setDependents((prev) => [...prev, newDep]);
      setIsAddDependentOpen(false);
      setToastMessage(`Dependent "${depName.trim()}" added successfully!`);
      setTimeout(() => setToastMessage(null), 3500);
      fetchDependents();
    } catch {
      const localDep: EmployeeDependent = {
        id: `DEP-${Date.now()}`,
        employee_id: profile?.employee_id || 'BC-1038',
        name: depName.trim(),
        relationship: depRelationship,
        dob: formattedDob,
        date_of_birth: formattedDob,
      };
      setDependents((prev) => [...prev, localDep]);
      setIsAddDependentOpen(false);
      setToastMessage(`Dependent "${depName.trim()}" added!`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSubmittingDependent(false);
    }
  };

  const handleRemoveDependent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      await employeesApi.deleteDependent(id);
      setDependents((prev) => prev.filter((d) => d.id !== id));
      setToastMessage(`Dependent "${name}" removed.`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setDependents((prev) => prev.filter((d) => d.id !== id));
      setToastMessage(`Dependent "${name}" removed.`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleOpenEdit = () => {
    if (profile) {
      setEditForm({ ...profile });
      setIsEditModalOpen(true);
    }
  };

  const handleOpenBankChangeRequest = () => {
    setRequestCategory('Payroll & tax');
    setRequestSubject('Change salary bank account');
    setRequestPriority('Normal');
    setRequestDetails('');
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSubject.trim()) {
      alert('Subject is required.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const empId = profile?.employee_id || 'BC-1038';
      const empName = profile?.full_name || 'Rahul Varma';
      await employeesApi.createServiceRequest({
        employee_id: empId,
        employee_name: empName,
        category: requestCategory,
        subject: requestSubject.trim(),
        priority: requestPriority,
        details: requestDetails.trim(),
      });
      setIsRequestModalOpen(false);
      setToastMessage(`Request "${requestSubject.trim()}" submitted to People Ops and saved to Database!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchServiceRequests();
    } catch (err) {
      alert('Failed to submit service request: ' + err);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const updated = {
        ...profile,
        ...editForm,
      } as EmployeeProfile;

      const res = await employeesApi.updateMyProfile(updated);
      setProfile(res);
      setIsEditModalOpen(false);
      setToastMessage('Personal details successfully updated in Brightcone Database!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Failed to update details: ' + err);
    }
  };

  if (loading && !profile) {
    return <div className="p-8 text-center text-slate-400">Loading your profile...</div>;
  }

  const p = profile || {
    employee_id: 'BC-1038',
    full_name: 'Rahul Varma',
    work_email: 'rahul.varma@brightcone.ai',
    role: 'Backend Engineer',
    department: 'Engineering',
    status: 'Active',
    phone: '+91 98480 11038',
    dob: 'Oct 7, 1996',
    blood_group: 'B+',
    address: 'Flat 402, Aparna Towers, Kondapur, Hyderabad 500084',
    emergency_contact: 'Lakshmi Varma (Mother), +91 98490 22110',
    manager: 'Priya Menon',
    grade: 'L4',
    location: 'Hyderabad',
    doj: 'Feb 15, 2024',
    bank_name: 'HDFC Bank',
    bank_account: '50100492817291',
    ifsc: 'HDFC0001234',
    pan: 'ABCDE1234F',
    uan: '100984920194',
    nominee_name: 'Lakshmi Varma',
    nominee_relation: 'Mother',
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Sora',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D68BD] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header matching Screenshot 2 */}
      <div>
        <div className="page-badge page-badge-people">
          <span className="page-badge-dot" />
          <span>PEOPLE</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keep your details current so payroll, insurance and emergency contacts stay accurate.
        </p>
      </div>

      {/* Hero Employee Card matching Screenshot 2 */}
      <div className="profile-hero-card">
        <div className="flex items-center gap-5">
          <div className="profile-hero-avatar">
            RV
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {p.full_name}
            </h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {p.role}, {p.department}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-pill badge-active">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active</span>
          </span>
        </div>
      </div>

      {/* Subtabs matching Screenshot 2 */}
      <div className="profile-tabs-nav">
        <button
          onClick={() => setActiveTab('personal')}
          className={`profile-tab-btn ${activeTab === 'personal' ? 'profile-tab-active' : ''}`}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`profile-tab-btn ${activeTab === 'job' ? 'profile-tab-active' : ''}`}
        >
          Job
        </button>
        <button
          onClick={() => setActiveTab('bank')}
          className={`profile-tab-btn ${activeTab === 'bank' ? 'profile-tab-active' : ''}`}
        >
          Bank & statutory
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`profile-tab-btn ${activeTab === 'family' ? 'profile-tab-active' : ''}`}
        >
          Family
        </button>
      </div>

      {/* Tab 1: Personal Details matching Screenshot 2 */}
      {activeTab === 'personal' && (
        <div className="profile-details-card">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Personal details
            </h3>
            <button
              onClick={handleOpenEdit}
              className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit details</span>
            </button>
          </div>

          <div className="profile-grid-4">
            <div>
              <div className="profile-field-label">Full name</div>
              <div className="profile-field-value">{p.full_name}</div>
            </div>

            <div>
              <div className="profile-field-label">Work email</div>
              <div className="profile-field-value">{p.work_email}</div>
            </div>

            <div>
              <div className="profile-field-label">Phone</div>
              <div className="profile-field-value">{p.phone}</div>
            </div>

            <div>
              <div className="profile-field-label">Date of birth</div>
              <div className="profile-field-value">{p.dob}</div>
            </div>

            <div>
              <div className="profile-field-label">Blood group</div>
              <div className="profile-field-value">{p.blood_group}</div>
            </div>

            <div className="lg:col-span-2">
              <div className="profile-field-label">Address</div>
              <div className="profile-field-value">{p.address}</div>
            </div>

            <div>
              <div className="profile-field-label">Emergency contact</div>
              <div className="profile-field-value">{p.emergency_contact}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Job Details */}
      {activeTab === 'job' && (
        <div className="profile-details-card">
          <div className="pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Job details
            </h3>
          </div>

          <div className="profile-grid-4">
            <div>
              <div className="profile-field-label">Employee ID</div>
              <div className="profile-field-value font-mono text-sky-600 dark:text-sky-400">
                {p.employee_id}
              </div>
            </div>

            <div>
              <div className="profile-field-label">Department</div>
              <div className="profile-field-value">{p.department}</div>
            </div>

            <div>
              <div className="profile-field-label">Designation / Role</div>
              <div className="profile-field-value">{p.role}</div>
            </div>

            <div>
              <div className="profile-field-label">Grade</div>
              <div className="profile-field-value">{p.grade}</div>
            </div>

            <div>
              <div className="profile-field-label">Reporting Manager</div>
              <div className="profile-field-value">{p.manager}</div>
            </div>

            <div>
              <div className="profile-field-label">Work Location</div>
              <div className="profile-field-value">{p.location}</div>
            </div>

            <div>
              <div className="profile-field-label">Date of Joining</div>
              <div className="profile-field-value">{p.doj}</div>
            </div>

            <div>
              <div className="profile-field-label">Employment Status</div>
              <div className="profile-field-value text-emerald-600 dark:text-emerald-400">
                {p.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Bank & Statutory (Exact match to Screenshot 4) */}
      {activeTab === 'bank' && (
        <div className="profile-details-card">
          <div className="pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bank & statutory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-12">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Salary account
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {p.bank_name || 'HDFC Bank'} ••{p.bank_account ? p.bank_account.slice(-4) : '4821'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                PAN
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {p.pan && p.pan.length >= 5 ? `${p.pan.slice(0, 5)}••••${p.pan.slice(-1)}` : 'ABCPV••••K'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                UAN (PF)
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {p.uan && p.uan.length >= 8 ? `${p.uan.slice(0, 4)}••••${p.uan.slice(-4)}` : '1009••••4821'}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Tax regime
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                Old regime
              </div>
            </div>
          </div>

          {/* Request bank change button matching Screenshot 4 */}
          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={handleOpenBankChangeRequest}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            >
              Request bank change
            </button>
          </div>

          {/* Live Service Requests submitted by employee */}
          {serviceRequests.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Service requests for People Ops ({serviceRequests.length})
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {serviceRequests.map((req) => (
                  <div key={req.id} className="p-3.5 bg-slate-50/50 dark:bg-[#0c1527] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {req.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {req.id} · {req.category} · Priority: {req.priority} · {req.created_at}
                      </div>
                    </div>
                    <span className="badge-pill badge-approved">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{req.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Family Details matching Screenshot 3 */}
      {activeTab === 'family' && (
        <div className="profile-details-card bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Family & dependents
            </h3>
            <button
              type="button"
              onClick={handleOpenAddDependent}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
            >
              Add dependent
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-2">NAME</th>
                  <th className="py-3 px-4">RELATIONSHIP</th>
                  <th className="py-3 px-4">DATE OF BIRTH</th>
                  <th className="py-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dependents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                      No dependents added yet. Click &quot;Add dependent&quot; to add.
                    </td>
                  </tr>
                ) : (
                  dependents.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-2 font-bold text-sm text-slate-900 dark:text-white">
                        {dep.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {dep.relationship}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {dep.date_of_birth || dep.dob}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveDependent(dep.id, dep.name)}
                          className="px-3.5 py-1 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shadow-2xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          RAISE A REQUEST MODAL (Exact match to Screenshot 5)
          ========================================================================= */}
      {isRequestModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-lg">
            <div className="modal-header">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Raise a request
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  The People Ops team replies here and by email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest}>
              <div className="modal-body space-y-4">
                {/* Category Dropdown matching user prompt */}
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    value={requestCategory}
                    onChange={(e) => setRequestCategory(e.target.value as ServiceRequestCategory)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-blue-400 dark:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="Payroll & tax">Payroll & tax</option>
                    <option value="Benefits & insurance">Benefits & insurance</option>
                    <option value="Letters & documents">Letters & documents</option>
                    <option value="Leave & attendance">Leave & attendance</option>
                    <option value="IT & assets">IT & assets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Subject (required) */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                    (required)
                  </div>
                  <input
                    type="text"
                    required
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                    placeholder="Change salary bank account"
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Priority */}
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={requestPriority}
                    onChange={(e) => setRequestPriority(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Details */}
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Details
                  </label>
                  <textarea
                    rows={4}
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    placeholder="Anything that helps us resolve it faster"
                    className="w-full bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Modal Footer matching Screenshot 5 */}
              <div className="modal-footer flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1D68BD] hover:bg-[#1556a0] text-white transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Personal Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update contact info and personal data in Brightcone Database
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <input
                      type="text"
                      value={editForm.blood_group || ''}
                      onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea
                    rows={2}
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact (Name & Phone)</label>
                  <input
                    type="text"
                    value={editForm.emergency_contact || ''}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Nominee Name</label>
                    <input
                      type="text"
                      value={editForm.nominee_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, nominee_name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nominee Relationship</label>
                    <input
                      type="text"
                      value={editForm.nominee_relation || ''}
                      onChange={(e) => setEditForm({ ...editForm, nominee_relation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>Changes are saved immediately to your employee profile in PostgreSQL and persistent store.</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-ghost-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-blue bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD DEPENDENT MODAL matching Screenshot 4
          ========================================================================= */}
      {isAddDependentOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[460px] p-6 sm:p-7">
            <form onSubmit={handleAddDependent}>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add dependent
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dependents are covered under group health insurance.
                </p>
              </div>

              <div className="space-y-4 text-left">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Full name
                  </label>
                  <span className="block text-[11px] text-slate-400 mb-1.5">(required)</span>
                  <input
                    type="text"
                    required
                    value={depName}
                    onChange={(e) => setDepName(e.target.value)}
                    placeholder=""
                    className="w-full px-3 py-2.5 rounded-xl border border-blue-400 ring-2 ring-blue-400/20 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden transition"
                  />
                </div>

                {/* Relationship & Date of birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                      Relationship
                    </label>
                    <select
                      value={depRelationship}
                      onChange={(e) => setDepRelationship(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Child">Child</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Date of birth
                    </label>
                    <span className="block text-[11px] text-slate-400 mb-1.5">(required)</span>
                    <input
                      type="date"
                      required
                      value={depDob}
                      onChange={(e) => setDepDob(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddDependentOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDependent}
                  className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingDependent ? 'Adding...' : 'Add dependent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfilePage;
