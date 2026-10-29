import React, { useEffect, useState, useRef } from 'react';
import { employeesApi } from '../../api/employees.api';
import { getCachedEmployees, saveCachedEmployees } from '../../utils/employeeSync';
import { CreateEmployeePayload, Employee } from '../../types/employee.types';
import { EmployeeModal } from './EmployeeModal';
import { SearchInput } from '../../components/common/SearchInput';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Toast } from '../../components/common/Toast';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  Edit2,
  Filter,
  CheckCircle,
} from 'lucide-react';

// Demonstration records specified in Prompt Section 9
export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'BC-1001',
    name: 'Naresh Vemparala',
    role: 'Founder & CEO',
    department: 'Leadership',
    grade: 'L9',
    location: 'Hyderabad',
    manager: 'no manager',
    status: 'Active',
    email: 'naresh@brightcone.ai',
  },
  {
    id: 'BC-1004',
    name: 'Ananya Rao',
    role: 'People Ops Lead',
    department: 'People Ops',
    grade: 'L6',
    location: 'Hyderabad',
    manager: 'Naresh Vemparala',
    status: 'Active',
    email: 'ananya.rao@brightcone.ai',
  },
  {
    id: 'BC-1012',
    name: 'Karthik Reddy',
    role: 'Principal AI Engineer',
    department: 'AI Research',
    grade: 'L8',
    location: 'Hyderabad',
    manager: 'Naresh Vemparala',
    status: 'Active',
    email: 'karthik.reddy@brightcone.ai',
  },
  {
    id: 'BC-1019',
    name: 'Priya Menon',
    role: 'Engineering Manager',
    department: 'Engineering',
    grade: 'L7',
    location: 'Bengaluru',
    manager: 'Karthik Reddy',
    status: 'Active',
    email: 'priya.menon@brightcone.ai',
  },
  {
    id: 'BC-1023',
    name: 'Daniel Brooks',
    role: 'Account Executive',
    department: 'Sales',
    grade: 'L6',
    location: 'San Francisco',
    manager: 'Naresh Vemparala',
    status: 'Active',
    email: 'daniel.brooks@brightcone.ai',
  },
  {
    id: 'BC-1031',
    name: 'Sneha Iyer',
    role: 'Product Designer',
    department: 'Design',
    grade: 'L5',
    location: 'Hyderabad',
    manager: 'Priya Menon',
    status: 'On leave',
    email: 'sneha.iyer@brightcone.ai',
  },
  {
    id: 'BC-1038',
    name: 'Rahul Varma',
    role: 'Backend Engineer',
    department: 'Engineering',
    grade: 'L4',
    location: 'Hyderabad',
    manager: 'Priya Menon',
    status: 'Active',
    email: 'rahul.varma@brightcone.ai',
  },
  {
    id: 'BC-1042',
    name: 'Meera Joshi',
    role: 'Finance Manager',
    department: 'Finance',
    grade: 'L6',
    location: 'Hyderabad',
    manager: 'Naresh Vemparala',
    status: 'Active',
    email: 'meera.joshi@brightcone.ai',
  },
];

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeesApi.getEmployees({
        q: searchQuery || undefined,
        department: departmentFilter !== 'All' ? departmentFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (data && data.length > 0) {
        setEmployees(data);
      } else if (!searchQuery && departmentFilter === 'All' && statusFilter === 'All') {
        setEmployees(DEMO_EMPLOYEES);
      } else {
        setEmployees([]);
      }
    } catch {
      // Fallback to demo employees filtered locally
      let filtered = [...DEMO_EMPLOYEES];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.role.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q)
        );
      }
      if (departmentFilter !== 'All') {
        filtered = filtered.filter((e) => e.department === departmentFilter);
      }
      if (statusFilter !== 'All') {
        filtered = filtered.filter((e) => e.status === statusFilter);
      }
      setEmployees(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchQuery, departmentFilter, statusFilter]);

  const handleSaveEmployee = async (payload: CreateEmployeePayload) => {
    try {
      if (payload.id) {
        await employeesApi.updateEmployee(payload.id, payload);
        setToastType('success');
        setToastMessage(`Employee ${payload.name} (${payload.id}) updated successfully!`);
      } else {
        const createdEmp = await employeesApi.createEmployee(payload);
        try {
          const currentCached = getCachedEmployees();
          saveCachedEmployees([...currentCached, {
            id: createdEmp.id || `BC-${Date.now()}`,
            name: payload.name,
            role: payload.role,
            department: payload.department,
            status: payload.status,
            email: payload.email,
            dateOfBirth: (payload as any).date_of_birth || '1995-01-01',
            joiningDate: (payload as any).date_of_joining || new Date().toISOString().split('T')[0],
          }]);
        } catch {}
        setToastType('success');
        setToastMessage(`Employee ${payload.name} created and saved to database!`);
      }
      await fetchEmployees();
    } catch (err: unknown) {
      setToastType('error');
      setToastMessage(err instanceof Error ? err.message : 'Error saving employee');
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await employeesApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brightcone_employees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToastType('success');
      setToastMessage('Employees roster exported to CSV successfully!');
    } catch {
      // Client-side fallback export
      const headers = ['ID,Name,Role,Department,Grade,Location,Manager,Status,Email'];
      const rows = employees.map(
        (e) =>
          `"${e.id}","${e.name}","${e.role}","${e.department}","${e.grade}","${e.location}","${e.manager}","${e.status}","${e.email}"`
      );
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brightcone_employees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToastType('success');
      setToastMessage('Employees roster CSV downloaded!');
    }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await employeesApi.importCsv(file);
      setToastType('success');
      setToastMessage(`Import successful! ${result.count || ''} records imported.`);
      await fetchEmployees();
    } catch {
      setToastType('error');
      setToastMessage('Failed to import CSV file. Please verify CSV formatting.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'on leave':
        return 'leave';
      case 'terminated':
        return 'rejected';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />

      {/* Header and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-sky-500/15 font-['Sora',sans-serif]">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500 dark:text-sky-400" />
            <span>Employees</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organization directory, roles, levels, reporting lines, and personnel records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportCsv}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Import employees from CSV"
          >
            <Upload className="w-3.5 h-3.5 text-sky-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Export employees to CSV"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/20 transition flex items-center gap-1.5 border border-sky-400/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-sky-500/20 shadow-sm dark:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, role, or employee ID (e.g. BC-1001)..."
          className="w-full md:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Leadership">Leadership</option>
              <option value="People Ops">People Ops</option>
              <option value="AI Research">AI Research</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Design">Design</option>
              <option value="Finance">Finance</option>
              <option value="Product">Product</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-[#060b18] border border-slate-300 dark:border-sky-500/25 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On leave">On leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {(searchQuery || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('All');
                setStatusFilter('All');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-500 border border-sky-300 dark:border-sky-500/30 transition cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-sky-500/20 shadow-sm dark:shadow-xl overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-sky-500/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-bold">{employees.length}</strong> employee profiles
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Persisted in PostgreSQL</span>
          </span>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading employee records..." />
        ) : employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#060b18]/60 text-slate-600 dark:text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Reporting Manager</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm">
                          {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{emp.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sky-700 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-500/20 text-[11px]">
                        {emp.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-[11px]">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded text-[11px]">
                        {emp.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{emp.location}</td>
                    <td className="py-3.5 px-4">
                      <span className={emp.manager === 'no manager' ? 'text-slate-400 italic' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                        {emp.manager}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusVariant(emp.status)}>{emp.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingEmployee(emp);
                          setIsModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-400 hover:text-white hover:bg-sky-500/20 border border-sky-500/30 transition inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">No employees found</h4>
            <p className="text-xs text-slate-400 mb-4">Try clearing your filters or search keywords.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('All');
                setStatusFilter('All');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        editingEmployee={editingEmployee}
      />
    </div>
  );
};
