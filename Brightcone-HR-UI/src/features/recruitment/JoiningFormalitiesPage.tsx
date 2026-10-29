import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck,
  Plus,
  Download,
  Search,
  Users,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  RotateCcw,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { employeesApi } from '../../api/employees.api';
import { joiningFormalitiesApi } from '../../api/onboarding.api';
import { Employee } from '../../types/employee.types';
import { JoiningRecord, CreateJoiningRecordPayload } from '../../types/recruitment.types';

export const JoiningFormalitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<JoiningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Drawer State
  const [isAddEmployeeFirstModalOpen, setIsAddEmployeeFirstModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<JoiningRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<JoiningRecord | null>(null);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<JoiningRecord | null>(null);

  // Form State - Add Employee Modal
  const [empFirstName, setEmpFirstName] = useState('');
  const [empLastName, setEmpLastName] = useState('');
  const [empWorkEmail, setEmpWorkEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empDob, setEmpDob] = useState('');
  const [empGender, setEmpGender] = useState('');
  const [empDepartment, setEmpDepartment] = useState('');
  const [empDesignation, setEmpDesignation] = useState('');
  const [empGrade, setEmpGrade] = useState('');
  const [empLocation, setEmpLocation] = useState('');
  const [empManager, setEmpManager] = useState('');
  const [empType, setEmpType] = useState('');
  const [empDoj, setEmpDoj] = useState('');
  const [empProbationEnd, setEmpProbationEnd] = useState('');
  const [empStatus, setEmpStatus] = useState('');
  const [submittingEmp, setSubmittingEmp] = useState(false);

  // Form State - Add / Edit Joining Record Modal
  const [formEmployeeId, setFormEmployeeId] = useState('');
  const [formJoiningDate, setFormJoiningDate] = useState('');
  const [formDocsCollected, setFormDocsCollected] = useState<'Yes' | 'No' | ''>('');
  const [formIdCard, setFormIdCard] = useState<'Yes' | 'No' | ''>('');
  const [formWorkEmail, setFormWorkEmail] = useState<'Yes' | 'No' | ''>('');
  const [formLaptop, setFormLaptop] = useState<'Yes' | 'No' | ''>('');
  const [formPfForm, setFormPfForm] = useState<'Yes' | 'No' | ''>('');
  const [formAppointmentLetter, setFormAppointmentLetter] = useState<'Yes' | 'No' | ''>('');
  const [formStatus, setFormStatus] = useState<'Pending' | 'In progress' | 'Completed' | ''>('');
  const [formNotes, setFormNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch joining records from PostgreSQL backend
  const fetchRecords = useCallback(async () => {
    try {
      setError(null);
      const data = await joiningFormalitiesApi.getRecords();
      setRecords(data || []);
    } catch (err: any) {
      console.error('Failed to fetch joining formalities:', err);
      setError(err?.message || 'Failed to load joining formalities from server');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch employees list
  const fetchEmployees = useCallback(async () => {
    try {
      const data = await employeesApi.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchEmployees();
  }, [fetchRecords, fetchEmployees]);

  // Handle incoming redirect from Candidate Tracker "Convert to Employee"
  useEffect(() => {
    const state = location.state as { convertedEmployeeId?: string; convertedName?: string; role?: string } | null;
    if (state && state.convertedEmployeeId && state.convertedName) {
      const checkAndCreate = async () => {
        try {
          const currentRecords = await joiningFormalitiesApi.getRecords();
          const exists = currentRecords.some((r) => r.employee_id === state.convertedEmployeeId);
          if (!exists) {
            const todayStr = new Date().toISOString().split('T')[0];
            const payload: CreateJoiningRecordPayload = {
              employee_id: state.convertedEmployeeId,
              employee_name: state.convertedName,
              candidate_name: state.convertedName,
              joining_date: todayStr,
              designation: state.role || 'New Joiner',
              documents_collected: 'No',
              id_card_issued: 'No',
              work_email_created: 'No',
              laptop_issued: 'No',
              pf_nomination_form: 'No',
              appointment_letter_issued: 'No',
              status: 'Pending',
              notes: `Auto-created from candidate conversion (${state.role || 'New Joiner'})`,
              archived: false,
            };
            const created = await joiningFormalitiesApi.createRecord(payload);
            setRecords((prev) => [created, ...prev]);
            showToast(`Joining record prepared for converted employee "${state.convertedName}"!`);
          }
        } catch (err: any) {
          console.error('Error auto-creating joining formality:', err);
        }
      };
      checkAndCreate();
      // Clear location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handleOpenAddJoiningRecord = () => {
    if (employees.length === 0) {
      setIsAddEmployeeFirstModalOpen(true);
    } else {
      setEditingRecord(null);
      setFormEmployeeId(employees[0]?.id || '');
      setFormJoiningDate(new Date().toISOString().split('T')[0]);
      setFormDocsCollected('No');
      setFormIdCard('No');
      setFormWorkEmail('No');
      setFormLaptop('No');
      setFormPfForm('No');
      setFormAppointmentLetter('No');
      setFormStatus('Pending');
      setFormNotes('');
      setIsRecordModalOpen(true);
    }
  };

  const handleOpenEditRecord = (record: JoiningRecord) => {
    setEditingRecord(record);
    setFormEmployeeId(record.employee_id || '');
    setFormJoiningDate(record.joining_date || '');
    setFormDocsCollected((record.documents_collected as any) || '');
    setFormIdCard((record.id_card_issued as any) || '');
    setFormWorkEmail((record.work_email_created as any) || '');
    setFormLaptop((record.laptop_issued as any) || '');
    setFormPfForm((record.pf_nomination_form as any) || '');
    setFormAppointmentLetter((record.appointment_letter_issued as any) || '');
    setFormStatus((record.status as any) || record.joining_status || 'Pending');
    setFormNotes(record.notes || record.remarks || '');
    setSelectedRecord(null);
    setIsRecordModalOpen(true);
  };

  // Submit Add Employee Modal
  const handleSaveNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFirstName.trim() || !empLastName.trim() || !empWorkEmail.trim() || !empDepartment.trim() || !empDesignation.trim()) {
      alert('Please fill out all required fields marked *');
      return;
    }

    setSubmittingEmp(true);
    const fullName = `${empFirstName.trim()} ${empLastName.trim()}`;
    const nextId = `BC-${1050 + employees.length + 1}`;

    const newEmpObj: Employee = {
      id: nextId,
      name: fullName,
      role: empDesignation.trim(),
      department: empDepartment.trim(),
      grade: empGrade.trim() || 'L4',
      location: empLocation.trim() || 'Hyderabad',
      manager: empManager.trim() || 'Ananya Rao',
      status: empStatus || 'Probation',
      email: empWorkEmail.trim(),
      joined_date: empDoj || new Date().toISOString().split('T')[0],
    };

    try {
      const created = await employeesApi.createEmployee(newEmpObj);
      setEmployees((prev) => [created || newEmpObj, ...prev]);
      showToast(`Employee "${fullName}" (${nextId}) added under People dashboard! Complete joining details below.`);

      setIsAddEmployeeModalOpen(false);

      // Reset employee form fields
      setEmpFirstName('');
      setEmpLastName('');
      setEmpWorkEmail('');
      setEmpPhone('');
      setEmpDob('');
      setEmpGender('');
      setEmpDepartment('');
      setEmpDesignation('');
      setEmpGrade('');
      setEmpLocation('');
      setEmpManager('');
      setEmpType('');
      setEmpDoj('');
      setEmpProbationEnd('');
      setEmpStatus('');

      // Open Add joining record modal pre-filled with this employee
      setEditingRecord(null);
      setFormEmployeeId(created?.id || nextId);
      setFormJoiningDate(empDoj || new Date().toISOString().split('T')[0]);
      setFormDocsCollected('No');
      setFormIdCard('No');
      setFormWorkEmail('No');
      setFormLaptop('No');
      setFormPfForm('No');
      setFormAppointmentLetter('No');
      setFormStatus('Pending');
      setFormNotes('');
      setIsRecordModalOpen(true);
    } catch (err: any) {
      alert('Failed to save employee: ' + (err?.message || err));
    } finally {
      setSubmittingEmp(false);
    }
  };

  // Submit Add / Edit Joining Record Modal
  const handleSaveJoiningRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmployeeId || !formJoiningDate.trim()) {
      alert('Please select an employee and enter joining date.');
      return;
    }

    const selectedEmp = employees.find((emp) => emp.id === formEmployeeId);
    const empNameFound = selectedEmp ? selectedEmp.name : 'Employee';

    setActionLoading(true);
    try {
      if (editingRecord) {
        const statusToUse = formStatus || editingRecord.status || 'Pending';
        const updatedPayload: Partial<JoiningRecord> = {
          ...editingRecord,
          employee_id: formEmployeeId,
          employee_name: empNameFound,
          joining_date: formJoiningDate,
          documents_collected: formDocsCollected || 'No',
          id_card_issued: formIdCard || 'No',
          work_email_created: formWorkEmail || 'No',
          laptop_issued: formLaptop || 'No',
          pf_nomination_form: formPfForm || 'No',
          appointment_letter_issued: formAppointmentLetter || 'No',
          status: statusToUse,
          joining_status: statusToUse,
          notes: formNotes,
          remarks: formNotes,
        };

        const res = await joiningFormalitiesApi.updateRecord(editingRecord.id, updatedPayload);
        setRecords((prev) => prev.map((r) => (r.id === editingRecord.id ? res : r)));
        if (selectedRecord?.id === editingRecord.id) {
          setSelectedRecord(res);
        }
        setIsRecordModalOpen(false);
        showToast(`Joining record for "${empNameFound}" updated successfully!`);
      } else {
        const payload: CreateJoiningRecordPayload = {
          employee_id: formEmployeeId,
          employee_name: empNameFound,
          candidate_name: empNameFound,
          joining_date: formJoiningDate,
          department: selectedEmp?.department,
          designation: selectedEmp?.role,
          reporting_manager: selectedEmp?.manager,
          documents_collected: formDocsCollected || 'No',
          id_card_issued: formIdCard || 'No',
          work_email_created: formWorkEmail || 'No',
          laptop_issued: formLaptop || 'No',
          pf_nomination_form: formPfForm || 'No',
          appointment_letter_issued: formAppointmentLetter || 'No',
          status: formStatus || 'Pending',
          joining_status: formStatus || 'Pending',
          notes: formNotes,
          remarks: formNotes,
          archived: false,
        };

        const res = await joiningFormalitiesApi.createRecord(payload);
        setRecords((prev) => [res, ...prev]);
        setIsRecordModalOpen(false);
        showToast(`Joining record ${res.id} created for "${empNameFound}"!`);
      }
    } catch (err: any) {
      alert('Failed to save joining record: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  // Move to Archive / Restore
  const handleToggleArchive = async (record: JoiningRecord, archive: boolean) => {
    setActionLoading(true);
    try {
      const updated = await joiningFormalitiesApi.updateRecord(record.id, {
        ...record,
        archived: archive,
      });
      setRecords((prev) => prev.map((r) => (r.id === record.id ? updated : r)));
      if (selectedRecord?.id === record.id) {
        setSelectedRecord(null);
      }
      setDeleteConfirmRecord(null);
      showToast(archive ? `Joining record ${record.id} moved to Archive.` : `Joining record ${record.id} restored to active list!`);
    } catch (err: any) {
      alert('Failed to update archive status: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Joining & Link Employee
  const handleCompleteJoining = async (record: JoiningRecord) => {
    if (!window.confirm(`Mark joining formalities for ${record.employee_name} as COMPLETED and link to employee directory?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const result = await joiningFormalitiesApi.completeJoining(record.id, record.employee_id);
      setRecords((prev) => prev.map((r) => (r.id === record.id ? result.record : r)));
      if (selectedRecord?.id === record.id) {
        setSelectedRecord(result.record);
      }
      showToast(`Formalities for ${record.employee_name} completed! Linked with Employee ID: ${result.employee?.id || record.employee_id}`);
      fetchEmployees();
    } catch (err: any) {
      alert('Failed to complete joining formality: ' + (err?.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Employee',
      'Employee ID',
      'Joining Date',
      'Department',
      'Designation',
      'Documents Collected',
      'ID Card Issued',
      'Email Created',
      'Laptop Issued',
      'PF / Nomination Form',
      'Appointment Letter',
      'Status',
    ];
    const rows = records.map((r) => [
      r.id,
      `"${r.employee_name || r.candidate_name || ''}"`,
      r.employee_id || '',
      `"${r.joining_date}"`,
      `"${r.department || ''}"`,
      `"${r.designation || ''}"`,
      r.documents_collected || 'No',
      r.id_card_issued || 'No',
      r.work_email_created || 'No',
      r.laptop_issued || 'No',
      r.pf_nomination_form || 'No',
      r.appointment_letter_issued || 'No',
      r.status || r.joining_status || 'Pending',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'joining_formalities_brightcone.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = records.filter((r) => {
    const isArch = Boolean(r.archived);
    if (showArchived !== isArch) return false;

    const name = (r.employee_name || r.candidate_name || '').toLowerCase();
    const empId = (r.employee_id || '').toLowerCase();
    const recId = (r.id || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchSearch = name.includes(query) || empId.includes(query) || recId.includes(query);
    const currentStatus = r.status || r.joining_status || 'Pending';
    const matchStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = records.filter((r) => !r.archived && (r.status === 'Pending' || r.joining_status === 'Pending')).length;
  const inProgressCount = records.filter((r) => !r.archived && (r.status === 'In progress' || r.joining_status === 'In progress')).length;
  const completedCount = records.filter((r) => !r.archived && (r.status === 'Completed' || r.joining_status === 'Completed')).length;
  const archivedCount = records.filter((r) => r.archived).length;

  return (
    <div className="space-y-6 animate-fadeIn font-['Sora',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1D68BD] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRecords}
            className="px-3 py-1 rounded bg-rose-100 dark:bg-rose-900/60 font-semibold text-rose-900 dark:text-rose-100 hover:bg-rose-200 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="page-badge page-badge-recruit">
            <span className="page-badge-dot" />
            <span>RECRUIT</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            Joining formalities
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Day-one paperwork and setup for each new joiner. Linked to PostgreSQL master employee database.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAddJoiningRecord}
            className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl shadow-md cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add joining record</span>
          </button>
        </div>
      </div>

      {/* Amber Warning Banner */}
      {employees.length === 0 && !loading && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>No employees yet?</strong> These records link to an Employee ID, so add your people in Employee master data first.
            </span>
          </div>
          <button
            onClick={() => setIsAddEmployeeModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 font-semibold hover:bg-amber-100 transition shrink-0 cursor-pointer text-amber-900 dark:text-amber-200"
          >
            + Add employee
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="stat-label">Total records</div>
          <div className="stat-number">{records.filter((r) => !r.archived).length}</div>
          <div className="stat-subtext">Live records</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="stat-label">Pending</div>
          <div className="stat-number">{pendingCount}</div>
          <div className="stat-subtext">Records</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="stat-label">In progress</div>
          <div className="stat-number">{inProgressCount}</div>
          <div className="stat-subtext">Records</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <LogIn className="w-5 h-5" />
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-number">{completedCount}</div>
          <div className="stat-subtext">Records</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="data-table-container bg-white dark:bg-[#0E1833] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search joining formalities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Archived ({archivedCount})</span>
            </label>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500">Loading joining records from database...</p>
            </div>
          ) : (
            <table className="enterprise-table w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-3">JOINING DATE</th>
                  <th className="py-3 px-3">DOCS COLLECTED</th>
                  <th className="py-3 px-3">ID CARD</th>
                  <th className="py-3 px-3">WORK EMAIL</th>
                  <th className="py-3 px-3">LAPTOP</th>
                  <th className="py-3 px-3">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-14">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
                          <LogIn className="w-6 h-6" />
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {showArchived
                            ? 'No archived joining records.'
                            : 'No joining formalities yet. Use "Add joining record" to create the first one.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const currentStatus = item.status || item.joining_status || 'Pending';
                    const displayName = item.employee_name || item.candidate_name || 'New Joiner';
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-xs cursor-pointer"
                        onClick={() => setSelectedRecord(item)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {displayName}
                          </div>
                          <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                            {item.employee_id || item.id}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                          {item.joining_date}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.documents_collected === 'Yes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {item.documents_collected || 'No'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.id_card_issued === 'Yes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {item.id_card_issued || 'No'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.work_email_created === 'Yes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {item.work_email_created || 'No'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.laptop_issued === 'Yes' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {item.laptop_issued || 'No'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              currentStatus === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : currentStatus === 'In progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{currentStatus}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {currentStatus !== 'Completed' && (
                              <button
                                onClick={() => handleCompleteJoining(item)}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Complete joining & link employee"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedRecord(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="View record details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!item.archived ? (
                              <>
                                <button
                                  onClick={() => handleOpenEditRecord(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Edit joining record"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmRecord(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title="Move to archive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleToggleArchive(item, false)}
                                className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                                title="Restore record"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>{filtered.length} of {records.filter((r) => (showArchived ? r.archived : !r.archived)).length} shown</div>
          <div className="text-[11px] text-slate-400">
            Backed by PostgreSQL database
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: ADD AN EMPLOYEE FIRST
          ========================================================================= */}
      {isAddEmployeeFirstModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[440px] p-6 sm:p-7">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Add an employee first
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              Joining formalities link to an Employee ID, and the employee register is empty.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEmployeeFirstModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              {employees.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddEmployeeFirstModalOpen(false);
                    setEditingRecord(null);
                    setFormEmployeeId(employees[0]?.id || '');
                    setFormJoiningDate(new Date().toISOString().split('T')[0]);
                    setFormDocsCollected('No');
                    setFormIdCard('No');
                    setFormWorkEmail('No');
                    setFormLaptop('No');
                    setFormPfForm('No');
                    setFormAppointmentLetter('No');
                    setFormStatus('Pending');
                    setFormNotes('');
                    setIsRecordModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Select existing
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsAddEmployeeFirstModalOpen(false);
                  setIsAddEmployeeModalOpen(true);
                }}
                className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Add employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD EMPLOYEE
          ========================================================================= */}
      {isAddEmployeeModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[620px] p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveNewEmployee}>
              <div className="mb-6 text-left">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Add employee
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Employee ID BC-#### is issued when you save. Fields marked * are required.
                </p>
              </div>

              <div className="space-y-4 text-left">
                {/* Row 1: First name & Last name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      First name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empFirstName}
                      onChange={(e) => setEmpFirstName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-400 ring-2 ring-blue-400/20 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Last name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empLastName}
                      onChange={(e) => setEmpLastName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Row 2: Work email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={empWorkEmail}
                      onChange={(e) => setEmpWorkEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Row 3: Date of birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      value={empDob}
                      onChange={(e) => setEmpDob(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={empGender}
                      onChange={(e) => setEmpGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Department & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empDepartment}
                      onChange={(e) => setEmpDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Designation <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empDesignation}
                      onChange={(e) => setEmpDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Row 5: Grade & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={empGrade}
                      onChange={(e) => setEmpGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={empLocation}
                      onChange={(e) => setEmpLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Row 6: Reporting manager & Employment type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Reporting manager
                    </label>
                    <select
                      value={empManager}
                      onChange={(e) => setEmpManager(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select manager...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Employment type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={empType}
                      onChange={(e) => setEmpType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                    </select>
                  </div>
                </div>

                {/* Row 7: Date of joining & Probation end */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Date of joining <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={empDoj}
                      onChange={(e) => setEmpDoj(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                      Probation end
                    </label>
                    <input
                      type="date"
                      value={empProbationEnd}
                      onChange={(e) => setEmpProbationEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition mb-1"
                    />
                    <span className="block text-[11px] text-slate-400">
                      Leave blank to set 6 months from joining
                    </span>
                  </div>
                </div>

                {/* Row 8: Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Active">Active</option>
                    <option value="Probation">Probation</option>
                    <option value="Notice period">Notice period</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmp}
                  className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingEmp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submittingEmp ? 'Adding...' : 'Add employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD / EDIT JOINING RECORD
          ========================================================================= */}
      {isRecordModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[560px] p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveJoiningRecord}>
              <div className="flex items-center justify-between mb-5">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingRecord ? 'Edit joining record' : 'Add joining record'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Fields marked * are required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordModalOpen(false);
                    setIsAddEmployeeModalOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add new employee first</span>
                </button>
              </div>

              <div className="space-y-4 text-left">
                {/* Employee Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formEmployeeId}
                    onChange={(e) => setFormEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id}) - {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Joining date & Documents collected */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Joining date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formJoiningDate}
                      onChange={(e) => setFormJoiningDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Documents collected
                    </label>
                    <select
                      value={formDocsCollected}
                      onChange={(e) => setFormDocsCollected(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* ID card issued & Work email created */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      ID card issued
                    </label>
                    <select
                      value={formIdCard}
                      onChange={(e) => setFormIdCard(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Work email created
                    </label>
                    <select
                      value={formWorkEmail}
                      onChange={(e) => setFormWorkEmail(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Laptop issued & PF / nomination form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Laptop issued
                    </label>
                    <select
                      value={formLaptop}
                      onChange={(e) => setFormLaptop(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      PF / nomination form
                    </label>
                    <select
                      value={formPfForm}
                      onChange={(e) => setFormPfForm(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* Appointment letter issued & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Appointment letter issued
                    </label>
                    <select
                      value={formAppointmentLetter}
                      onChange={(e) => setFormAppointmentLetter(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    >
                      <option value="">Select...</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      required
                    >
                      <option value="">Select status...</option>
                      <option value="Pending">Pending</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Add onboarding notes or special requirements..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingRecord ? 'Save changes' : 'Add joining record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW DETAILS DRAWER (Eye Icon)
          ========================================================================= */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0E1833] h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 space-y-6 text-left">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 shadow-xs">
                  <UserCheck className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedRecord.employee_name || selectedRecord.candidate_name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Joining Formalities · {selectedRecord.id} · {selectedRecord.employee_id}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    (selectedRecord.status || selectedRecord.joining_status) === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : (selectedRecord.status || selectedRecord.joining_status) === 'In progress'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{selectedRecord.status || selectedRecord.joining_status}</span>
                </span>
              </div>

              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Joining date</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecord.joining_date}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Documents collected</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.documents_collected || 'No'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">ID card issued</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.id_card_issued || 'No'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Work email created</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.work_email_created || 'No'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Laptop issued</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.laptop_issued || 'No'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">PF / nomination form</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.pf_nomination_form || 'No'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Appointment letter</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedRecord.appointment_letter_issued || 'No'}
                    </div>
                  </div>
                </div>

                {(selectedRecord.notes || selectedRecord.remarks) && (
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Notes & Remarks</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {selectedRecord.notes || selectedRecord.remarks}
                    </div>
                  </div>
                )}

                {/* History Section */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    History
                  </h4>
                  {selectedRecord.history && selectedRecord.history.length > 0 ? (
                    <div className="space-y-3">
                      {selectedRecord.history.map((h, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {h.status}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            {h.timestamp} · {h.user}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {selectedRecord.status || selectedRecord.joining_status}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {selectedRecord.created_at || 'Just now'} · ananya.rao@brightcone.ai
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 text-[11px] text-slate-400 leading-relaxed">
                  Created {selectedRecord.created_at || 'Recently'}. Last updated {selectedRecord.updated_at || 'Recently'}.
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 bg-white dark:bg-[#0E1833]">
              {(selectedRecord.status || selectedRecord.joining_status) !== 'Completed' && (
                <button
                  onClick={() => handleCompleteJoining(selectedRecord)}
                  disabled={actionLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>Complete Joining & Link Employee</span>
                </button>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenEditRecord(selectedRecord)}
                  className="flex-1 btn-primary-blue bg-[#1D68BD] hover:bg-[#16559e] text-white flex items-center justify-center gap-2 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-md cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmRecord(selectedRecord)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0E1833] border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE / MOVE TO ARCHIVE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteConfirmRecord && (
        <div className="modal-backdrop">
          <div className="modal-content-card max-w-[420px] p-6 sm:p-7">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Archive {deleteConfirmRecord.id}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
              It moves to <span className="font-semibold text-slate-700 dark:text-slate-300">Archived</span>, where you can restore it at any time. Nothing is permanently erased.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecord(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleToggleArchive(deleteConfirmRecord, true)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Move to archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoiningFormalitiesPage;
