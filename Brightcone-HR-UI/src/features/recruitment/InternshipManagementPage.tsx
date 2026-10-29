import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Download,
  Search,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  X,
  LogIn,
  Loader2,
} from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import { internshipsApi } from '../../api/onboarding.api';
import { Employee } from '../../types/employee.types';
import {
  Internship,
  CreateInternshipPayload,
  ConvertInternshipPayload,
} from '../../types/recruitment.types';

export const InternshipManagementPage: React.FC = () => {
  const navigate = useNavigate();

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [departmentFilter, setDepartmentFilter] = useState('All: department');
  const [showArchived, setShowArchived] = useState(false);

  // Modals state
  const [isInternModalOpen, setIsInternModalOpen] = useState(false);
  const [editingInternId, setEditingInternId] = useState<string | null>(null);
  const [viewingIntern, setViewingIntern] = useState<Internship | null>(null);
  const [deleteConfirmIntern, setDeleteConfirmIntern] = useState<Internship | null>(null);
  const [convertingIntern, setConvertingIntern] = useState<Internship | null>(null);

  // Add / Edit Intern Form State
  const [formInternName, setFormInternName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCollege, setFormCollege] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formMentorId, setFormMentorId] = useState('Select...');
  const [formStipend, setFormStipend] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formEvaluation, setFormEvaluation] = useState('Select...');
  const [formStatus, setFormStatus] = useState('Select...');

  // Convert to Employee Form State
  const [convFirstName, setConvFirstName] = useState('');
  const [convLastName, setConvLastName] = useState('');
  const [convEmail, setConvEmail] = useState('');
  const [convPhone, setConvPhone] = useState('');
  const [convDob, setConvDob] = useState('');
  const [convGender, setConvGender] = useState('Select...');
  const [convDepartment, setConvDepartment] = useState('');
  const [convDesignation, setConvDesignation] = useState('');
  const [convGrade, setConvGrade] = useState('');
  const [convLocation, setConvLocation] = useState('');
  const [convReportingManager, setConvReportingManager] = useState('');
  const [convEmploymentType, setConvEmploymentType] = useState('Full-time');
  const [convDateOfJoining, setConvDateOfJoining] = useState('');
  const [convStatus, setConvStatus] = useState('Probation');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper: Format current timestamp e.g. "23 Oct 2026, 08:17 pm"
  const formatCurrentTimestamp = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const formattedHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
  };

  // Helper: Format display date like "Oct 24, 2026"
  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr || !dateStr.trim()) return '—';
    const s = dateStr.trim();
    if (s.includes(' ') && !s.includes('-')) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // Helper: Get 2-letter initials
  const getInitials = (name?: string): string => {
    if (!name || !name.trim()) return 'in';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toLowerCase();
    }
    return name.slice(0, 2).toLowerCase();
  };

  // Helper: Status badge matching Reference Screenshot 1 (colored dot + name, no dropdown)
  const renderStatusBadge = (status?: string) => {
    const s = (status || 'Active').toLowerCase();
    let pillStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    let dotColor = 'bg-blue-600 dark:bg-blue-400';

    if (s === 'completed') {
      pillStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      dotColor = 'bg-emerald-600 dark:bg-emerald-400';
    } else if (s === 'converted' || s === 'ppo offered') {
      pillStyle = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      dotColor = 'bg-purple-600 dark:bg-purple-400';
    } else if (s === 'terminated' || s === 'rejected') {
      pillStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      dotColor = 'bg-rose-600 dark:bg-rose-400';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${pillStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
        <span>{status || 'Active'}</span>
      </span>
    );
  };

  // Fetch initial data (loads all records so stats, live list, and archived tab remain accurate)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empList, internList] = await Promise.all([
        employeesApi.getEmployees().catch(() => []),
        internshipsApi.getInternships().catch(() => []),
      ]);
      setEmployees(empList);
      setInternships(internList);
    } catch (err) {
      console.error('Failed to load internship management data:', err);
      showToast('Failed to load internships data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique departments for filter dropdown
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    internships.forEach((i) => {
      if (i.department && i.department.trim()) set.add(i.department.trim());
    });
    employees.forEach((e) => {
      if (e.department && e.department.trim()) set.add(e.department.trim());
    });
    return Array.from(set).sort();
  }, [internships, employees]);

  // Stats calculation
  const stats = useMemo(() => {
    const live = internships.filter((i) => !i.archived);
    const total = live.length;
    const active = live.filter((i) => i.status.toLowerCase() === 'active').length;
    const completed = live.filter((i) => i.status.toLowerCase() === 'completed').length;
    const converted = live.filter((i) => i.status.toLowerCase() === 'converted').length;
    return { total, active, completed, converted };
  }, [internships]);

  const archivedCount = useMemo(() => {
    return internships.filter((i) => !!i.archived).length;
  }, [internships]);

  // Filtered internships
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const isArch = !!item.archived;
      if (showArchived !== isArch) return false;

      if (statusFilter !== 'All statuses') {
        if (item.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      if (departmentFilter !== 'All: department') {
        if ((item.department || '').toLowerCase() !== departmentFilter.toLowerCase()) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.intern_name || '').toLowerCase().includes(q);
        const matchEmail = (item.email || '').toLowerCase().includes(q);
        const matchCollege = (item.college || '').toLowerCase().includes(q);
        const matchDept = (item.department || '').toLowerCase().includes(q);
        const matchMentor = (item.mentor_name || '').toLowerCase().includes(q);
        const matchProject = (item.project_title || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCollege && !matchDept && !matchMentor && !matchProject) {
          return false;
        }
      }

      return true;
    });
  }, [internships, showArchived, statusFilter, departmentFilter, searchQuery]);

  // Reset Add/Edit Intern Form
  const resetInternForm = () => {
    setEditingInternId(null);
    setFormInternName('');
    setFormEmail('');
    setFormPhone('');
    setFormCollege('');
    setFormCourse('');
    setFormDepartment('');
    setFormMentorId('Select...');
    setFormStipend('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate(new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]);
    setFormProject('');
    setFormEvaluation('Select...');
    setFormStatus('Active');
  };

  // Open Edit Intern Modal
  const handleOpenEdit = (intern: Internship) => {
    setEditingInternId(intern.id);
    setFormInternName(intern.intern_name || '');
    setFormEmail(intern.email || '');
    setFormPhone(intern.phone || '');
    setFormCollege(intern.college || '');
    setFormCourse(intern.degree || '');
    setFormDepartment(intern.department || '');
    setFormMentorId(intern.mentor_employee_id || 'Select...');
    setFormStipend(intern.stipend || '');
    setFormStartDate(intern.start_date ? intern.start_date.split('T')[0] : '');
    setFormEndDate(intern.end_date ? intern.end_date.split('T')[0] : '');
    setFormProject(intern.project_title || '');
    setFormEvaluation(intern.feedback || 'Select...');
    setFormStatus(intern.status || 'Active');
    setIsInternModalOpen(true);
  };

  // Submit Add / Edit Intern
  const handleSubmitIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInternName.trim()) {
      showToast('Please enter the intern name.');
      return;
    }
    if (!formEmail.trim()) {
      showToast('Please enter the intern email.');
      return;
    }
    if (!formStartDate) {
      showToast('Please select a start date.');
      return;
    }
    if (!formEndDate) {
      showToast('Please select an end date.');
      return;
    }
    if (!formStatus || formStatus === 'Select...') {
      showToast('Please select a status.');
      return;
    }

    setActionLoading(true);
    try {
      const selectedMentor = employees.find((emp) => emp.id === formMentorId);
      const nowTs = formatCurrentTimestamp();

      const payload: CreateInternshipPayload = {
        intern_name: formInternName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        college: formCollege.trim() || undefined,
        degree: formCourse.trim() || undefined,
        department: formDepartment.trim() || undefined,
        internship_role: formDepartment.trim() ? `${formDepartment.trim()} Intern` : 'Intern',
        mentor_employee_id: formMentorId !== 'Select...' ? formMentorId : undefined,
        mentor_name: selectedMentor ? selectedMentor.name : undefined,
        start_date: formStartDate,
        end_date: formEndDate,
        stipend: formStipend.trim() || undefined,
        status: formStatus,
        work_mode: 'Hybrid',
        project_title: formProject.trim() || undefined,
        feedback: formEvaluation !== 'Select...' ? formEvaluation : undefined,
        timestamp: nowTs,
        user: 'ananya.rao@brightcone.ai',
      };

      if (editingInternId) {
        const updated = await internshipsApi.updateInternship(editingInternId, payload);
        showToast('Intern details updated successfully!');
        if (viewingIntern && viewingIntern.id === editingInternId) {
          setViewingIntern(updated);
        }
      } else {
        await internshipsApi.createInternship(payload);
        showToast('Intern added successfully!');
      }

      setIsInternModalOpen(false);
      resetInternForm();
      await fetchData();
    } catch (err: any) {
      console.error('Error saving intern:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to save intern');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Update
  const handleQuickStatusChange = async (intern: Internship, newStatus: string) => {
    const nowTs = formatCurrentTimestamp();
    try {
      const updated = await internshipsApi.updateStatus(intern.id, {
        status: newStatus,
        timestamp: nowTs,
        user: 'ananya.rao@brightcone.ai',
      });
      if (viewingIntern && viewingIntern.id === intern.id) {
        setViewingIntern(updated);
      }
      await fetchData();
      showToast(`Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status');
    }
  };

  // Open Convert to Employee Modal
  const handleOpenConvert = (intern: Internship) => {
    setConvertingIntern(intern);
    const nameParts = (intern.intern_name || '').trim().split(/\s+/);
    setConvFirstName(nameParts[0] || '');
    setConvLastName(nameParts.slice(1).join(' ') || '');
    setConvEmail(intern.email || '');
    setConvPhone(intern.phone || '');
    setConvDob('');
    setConvGender('Select...');
    setConvDepartment(intern.department || '');
    setConvDesignation(intern.internship_role || 'Software Engineer');
    setConvGrade('L2');
    setConvLocation('Hyderabad, India');
    setConvReportingManager(intern.mentor_name ? `${intern.mentor_name} (${intern.mentor_employee_id || ''})` : '');
    setConvEmploymentType('Full-time');
    setConvDateOfJoining(new Date().toISOString().split('T')[0]);
    setConvStatus('Probation');
  };

  // Submit Convert to Employee
  const handleSubmitConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingIntern) return;
    if (!convFirstName.trim()) {
      showToast('Please enter first name.');
      return;
    }
    if (!convEmail.trim()) {
      showToast('Please enter work email.');
      return;
    }
    if (!convDepartment.trim()) {
      showToast('Please enter department.');
      return;
    }
    if (!convDesignation.trim()) {
      showToast('Please enter designation.');
      return;
    }
    if (!convDateOfJoining) {
      showToast('Please select date of joining.');
      return;
    }

    setActionLoading(true);
    try {
      const nowTs = formatCurrentTimestamp();
      const payload: ConvertInternshipPayload = {
        first_name: convFirstName.trim(),
        last_name: convLastName.trim() || undefined,
        email: convEmail.trim(),
        phone: convPhone.trim() || undefined,
        dob: convDob || undefined,
        gender: convGender !== 'Select...' ? convGender : undefined,
        department: convDepartment.trim(),
        designation: convDesignation.trim(),
        grade: convGrade.trim() || 'L2',
        location: convLocation.trim() || 'Hyderabad, India',
        reporting_manager: convReportingManager || undefined,
        employment_type: convEmploymentType || 'Full-time',
        date_of_joining: convDateOfJoining,
        status: convStatus || 'Probation',
        timestamp: nowTs,
        user: 'ananya.rao@brightcone.ai',
      };

      const res = await internshipsApi.convertInternship(convertingIntern.id, payload);
      showToast(`Intern ${convertingIntern.intern_name} converted to employee (${res.employee?.id || 'BC-####'}) successfully!`);
      setConvertingIntern(null);
      await fetchData();

      // Redirect directly to employee register as requested
      navigate('/employees');
    } catch (err: any) {
      console.error('Failed to convert intern to employee:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to convert intern');
    } finally {
      setActionLoading(false);
    }
  };

  // Archive / Delete Handling
  const handleArchiveOrDelete = async () => {
    if (!deleteConfirmIntern) return;
    setActionLoading(true);
    try {
      if (deleteConfirmIntern.archived) {
        // Permanently delete if already archived
        await internshipsApi.deleteInternship(deleteConfirmIntern.id);
        showToast('Intern deleted permanently.');
      } else {
        // Move to archive first and redirect to archive section
        await internshipsApi.archiveInternship(deleteConfirmIntern.id, true);
        showToast(`Moved ${deleteConfirmIntern.intern_name} to Archived.`);
        setShowArchived(true);
      }
      setDeleteConfirmIntern(null);
      if (viewingIntern?.id === deleteConfirmIntern.id) {
        setViewingIntern(null);
      }
      await fetchData();
    } catch (err: any) {
      console.error('Failed to process delete:', err);
      showToast('Failed to process delete');
    } finally {
      setActionLoading(false);
    }
  };

  // Restore Intern from Archive
  const handleRestoreIntern = async (intern: Internship) => {
    setActionLoading(true);
    try {
      await internshipsApi.archiveInternship(intern.id, false);
      showToast(`Restored ${intern.intern_name} from archive.`);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to restore intern:', err);
      showToast('Failed to restore intern');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (internships.length === 0) {
      showToast('No internships to export.');
      return;
    }

    const headers = [
      'ID',
      'Intern Name',
      'Email',
      'Phone',
      'College',
      'Course',
      'Department',
      'Role',
      'Mentor',
      'Start Date',
      'End Date',
      'Monthly Stipend',
      'Status',
      'Project',
      'Evaluation',
      'Archived',
    ];

    const rows = internships.map((i) => [
      `"${i.id}"`,
      `"${(i.intern_name || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${(i.phone || '').replace(/"/g, '""')}"`,
      `"${(i.college || '').replace(/"/g, '""')}"`,
      `"${(i.degree || '').replace(/"/g, '""')}"`,
      `"${(i.department || '').replace(/"/g, '""')}"`,
      `"${(i.internship_role || '').replace(/"/g, '""')}"`,
      `"${(i.mentor_name || '').replace(/"/g, '""')}"`,
      `"${i.start_date || ''}"`,
      `"${i.end_date || ''}"`,
      `"${(i.stipend || '').replace(/"/g, '""')}"`,
      `"${i.status || ''}"`,
      `"${(i.project_title || '').replace(/"/g, '""')}"`,
      `"${(i.feedback || '').replace(/"/g, '""')}"`,
      `"${i.archived ? 'Yes' : 'No'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `internship_management_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-900/70 p-6 md:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HEADER SECTION (Matching Reference Screenshot 1) */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/70 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400"></span>
            RECRUIT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Internship management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Interns, mentors, projects and evaluations. &ldquo;Convert to employee&rdquo; moves a good intern into the employee register.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-nowrap self-start md:self-center">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-750 shrink-0"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              resetInternForm();
              setIsInternModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/25 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add intern</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 STAT CARDS (Purple Glowing Top Line & Lift Animation matching Screenshot 1) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Total records */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Total records</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Live records</div>
          </div>
        </div>

        {/* Active */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Completed */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completed</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>

        {/* Converted */}
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500 rounded-t-2xl transition-all duration-300 group-hover:h-[4px] group-hover:from-purple-500 group-hover:via-fuchsia-500 group-hover:to-purple-600 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-purple-100/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-200/90 transition-all duration-300 shadow-sm">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Converted</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.converted}</div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Records</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLE CARD & FILTERS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search internship management"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Status Dropdown */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All statuses">All statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Converted">Converted</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="All: department">All: department</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Archived Checkbox */}
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span>Archived ({archivedCount})</span>
            </label>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm">Loading internship records...</p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <GraduationCap className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No interns found</p>
            <p className="text-xs text-slate-400 mt-1">
              {showArchived ? 'No archived internship records.' : 'Click "Add intern" to create a new record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Intern name</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Mentor</th>
                  <th className="py-3 px-4">Start date</th>
                  <th className="py-3 px-4">End date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredInternships.map((intern) => {
                  const mentorName = intern.mentor_name || 'HR Team';
                  const mentorSub = intern.mentor_employee_id
                    ? `${intern.mentor_employee_id} · ${intern.department || 'Engineering'}`
                    : 'Mentor';
                  const isCompleted = intern.status.toLowerCase() === 'completed';

                  return (
                    <tr
                      key={intern.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors"
                    >
                      {/* INTERN NAME */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <span>{intern.intern_name}</span>
                      </td>

                      {/* COLLEGE */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span>{intern.college || '—'}</span>
                      </td>

                      {/* DEPARTMENT */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <span>{intern.department || '—'}</span>
                      </td>

                      {/* MENTOR (Screenshot 1: green avatar initials + name + subtext) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                            {getInitials(mentorName)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {mentorName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {mentorSub}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* START DATE */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {formatDateDisplay(intern.start_date)}
                      </td>

                      {/* END DATE */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {formatDateDisplay(intern.end_date)}
                      </td>

                      {/* STATUS (Pill badge with colored dot matching Screenshot 1, no dropdown) */}
                      <td className="py-3.5 px-4">
                        {renderStatusBadge(intern.status)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          {/* CONVERT BUTTON (Shown when status is Completed) */}
                          {isCompleted && (
                            <button
                              onClick={() => handleOpenConvert(intern)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm transition-colors"
                              title="Convert to employee register"
                            >
                              <LogIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              <span>Convert</span>
                            </button>
                          )}

                          {/* Eye: View Details */}
                          <button
                            onClick={() => setViewingIntern(intern)}
                            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Pencil: Edit */}
                          <button
                            onClick={() => handleOpenEdit(intern)}
                            className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Edit intern"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Trash: Move to archive / permanent delete */}
                          {intern.archived ? (
                            <>
                              <button
                                onClick={() => handleRestoreIntern(intern)}
                                className="p-1 hover:text-emerald-600 transition-colors"
                                title="Restore intern"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmIntern(intern)}
                                className="p-1 hover:text-red-600 transition-colors"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmIntern(intern)}
                              className="p-1 hover:text-red-600 transition-colors"
                              title="Delete (moves to archive)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Footer Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <span>
            {filteredInternships.length} of {internships.length} shown
          </span>
          <span>Saved in this browser · last saved {formatCurrentTimestamp()}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Add / Edit Intern (Matches Reference Screenshot 2) */}
      {/* ========================================================================= */}
      {isInternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-xl p-6 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingInternId ? 'Edit intern' : 'Add intern'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fields marked * are required.
                </p>
              </div>
              <button
                onClick={() => setIsInternModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitIntern} className="mt-4 space-y-4">
              {/* Row 1: Intern name * | Email * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Intern name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formInternName}
                    onChange={(e) => setFormInternName(e.target.value)}
                    placeholder="Enter intern name"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="intern@brightcone.ai"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Phone | College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    College
                  </label>
                  <input
                    type="text"
                    value={formCollege}
                    onChange={(e) => setFormCollege(e.target.value)}
                    placeholder="College or University name"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Course | Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Course
                  </label>
                  <input
                    type="text"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    placeholder="B.Tech Computer Science"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Engineering / Product / AI"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Mentor | Monthly stipend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mentor
                  </label>
                  <select
                    value={formMentorId}
                    onChange={(e) => setFormMentorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Monthly stipend (₹)
                  </label>
                  <input
                    type="text"
                    value={formStipend}
                    onChange={(e) => setFormStipend(e.target.value)}
                    placeholder="35000"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: Start date * | End date * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    End date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 6: Project */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project
                </label>
                <input
                  type="text"
                  value={formProject}
                  onChange={(e) => setFormProject(e.target.value)}
                  placeholder="Key project title or deliverables"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Row 7: Evaluation | Status * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Evaluation
                  </label>
                  <select
                    value={formEvaluation}
                    onChange={(e) => setFormEvaluation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    <option value="Exceeds expectations">Exceeds expectations</option>
                    <option value="Meets expectations">Meets expectations</option>
                    <option value="Needs improvement">Needs improvement</option>
                    <option value="Unsatisfactory">Unsatisfactory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Converted">Converted</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsInternModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editingInternId ? 'Save changes' : 'Add intern'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Convert to Employee (Matches Reference Screenshot 3) */}
      {/* ========================================================================= */}
      {convertingIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-xl p-6 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Add employee
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Employee ID BC-#### is issued when you save. Fields marked * are required.
                </p>
              </div>
              <button
                onClick={() => setConvertingIntern(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitConvert} className="mt-4 space-y-4">
              {/* First name * | Last name * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    First name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={convFirstName}
                    onChange={(e) => setConvFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={convLastName}
                    onChange={(e) => setConvLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Work email * | Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={convEmail}
                    onChange={(e) => setConvEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={convPhone}
                    onChange={(e) => setConvPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Date of birth | Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date of birth
                  </label>
                  <input
                    type="date"
                    value={convDob}
                    onChange={(e) => setConvDob(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={convGender}
                    onChange={(e) => setConvGender(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Department * | Designation * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={convDepartment}
                    onChange={(e) => setConvDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={convDesignation}
                    onChange={(e) => setConvDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Grade | Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={convGrade}
                    onChange={(e) => setConvGrade(e.target.value)}
                    placeholder="L2"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={convLocation}
                    onChange={(e) => setConvLocation(e.target.value)}
                    placeholder="Hyderabad, India"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Reporting manager | Employment type * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Reporting manager
                  </label>
                  <select
                    value={convReportingManager}
                    onChange={(e) => setConvReportingManager(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="">Select...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={`${emp.name} (${emp.id})`}>
                        {emp.name} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Employment type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={convEmploymentType}
                    onChange={(e) => setConvEmploymentType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Select...">Select...</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
              </div>

              {/* Date of joining * | Status * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date of joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={convDateOfJoining}
                    onChange={(e) => setConvDateOfJoining(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={convStatus}
                    onChange={(e) => setConvStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setConvertingIntern(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Add employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL: View Intern Details & Audit History */}
      {/* ========================================================================= */}
      {viewingIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-lg p-6 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {viewingIntern.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {viewingIntern.intern_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {viewingIntern.department || 'Engineering'} · {viewingIntern.college || 'Intern'}
                </p>
              </div>
              <button
                onClick={() => setViewingIntern(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-750">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Current status</span>
                <div className="flex items-center gap-2">
                  <select
                    value={viewingIntern.status || 'Active'}
                    onChange={(e) => handleQuickStatusChange(viewingIntern, e.target.value)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Converted">Converted</option>
                    <option value="Terminated">Terminated</option>
                  </select>

                  {viewingIntern.status.toLowerCase() === 'completed' && (
                    <button
                      onClick={() => {
                        const target = viewingIntern;
                        setViewingIntern(null);
                        handleOpenConvert(target);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Convert</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Email</span>
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{viewingIntern.email}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Phone</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewingIntern.phone || '—'}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Course / Degree</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewingIntern.degree || '—'}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Monthly Stipend</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewingIntern.stipend || '—'}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Mentor</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewingIntern.mentor_name || '—'}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Work Mode</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewingIntern.work_mode || 'Hybrid'}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Start Date</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDateDisplay(viewingIntern.start_date)}</p>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">End Date</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{formatDateDisplay(viewingIntern.end_date)}</p>
                </div>
              </div>

              {/* Project & Evaluation */}
              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Project</span>
                <p className="text-slate-800 dark:text-slate-200">{viewingIntern.project_title || '—'}</p>
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Evaluation / Feedback</span>
                <p className="text-slate-800 dark:text-slate-200">{viewingIntern.feedback || '—'}</p>
              </div>

              {/* History Section (Matching Screenshot 2 Timeline) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                  History
                </h4>

                <div className="space-y-4">
                  {(() => {
                    const historyItems =
                      viewingIntern.history && viewingIntern.history.length > 0
                        ? viewingIntern.history
                        : [
                            {
                              status: viewingIntern.status || 'Active',
                              timestamp: viewingIntern.created_at || formatCurrentTimestamp(),
                              user: 'ananya.rao@brightcone.ai',
                            },
                          ];

                    const firstCreated =
                      viewingIntern.created_at ||
                      historyItems[0]?.timestamp ||
                      formatCurrentTimestamp();
                    const firstUser = historyItems[0]?.user || 'ananya.rao@brightcone.ai';
                    const lastUpdated =
                      viewingIntern.updated_at ||
                      historyItems[historyItems.length - 1]?.timestamp ||
                      firstCreated;

                    return (
                      <>
                        <div className="space-y-4">
                          {historyItems.map((item, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.status}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.timestamp} · {item.user || 'ananya.rao@brightcone.ai'}
                              </p>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 leading-relaxed">
                          Created {firstCreated} by {firstUser}. Last updated {lastUpdated}.
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  const target = viewingIntern;
                  setViewingIntern(null);
                  handleOpenEdit(target);
                }}
                className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => {
                  const target = viewingIntern;
                  setViewingIntern(null);
                  setDeleteConfirmIntern(target);
                }}
                className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 dark:bg-slate-800 dark:border-red-900/50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Delete Confirmation -> Move to Archive */}
      {/* ========================================================================= */}
      {deleteConfirmIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {deleteConfirmIntern.archived
                ? 'Delete Intern Permanently?'
                : 'Move to Archive?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {deleteConfirmIntern.archived
                ? `Are you sure you want to permanently delete intern "${deleteConfirmIntern.intern_name}"? This action cannot be undone.`
                : `Are you sure you want to delete intern "${deleteConfirmIntern.intern_name}"? It will first be moved to the archive and can be restored at any time.`}
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmIntern(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleArchiveOrDelete}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {deleteConfirmIntern.archived ? 'Delete permanently' : 'Move to archive'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipManagementPage;
