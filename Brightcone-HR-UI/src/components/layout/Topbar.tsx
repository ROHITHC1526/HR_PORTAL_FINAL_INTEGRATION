import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePortal } from '../../context/PortalContext';
import {
  Sun,
  Moon,
  LogOut,
  Bell,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentApp, activeRole, isAppLauncherOpen, setIsAppLauncherOpen } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await logout();
    navigate('/signin');
  };

  // Determine breadcrumbs dynamically for all sections
  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Recruit App Sections
    if (path.includes('jobs-referrals')) return { app: 'Recruit', page: 'Jobs & referrals' };
    if (path.includes('dashboard')) return { app: 'Recruit', page: 'Recruit dashboard' };
    if (path.includes('manpower')) return { app: 'Recruit', page: 'Manpower requirements' };
    if (path.includes('candidate-tracker')) return { app: 'Recruit', page: 'Candidate tracker' };
    if (path.includes('interviews')) return { app: 'Recruit', page: 'Interview scheduling' };
    if (path.includes('offers')) return { app: 'Recruit', page: 'Offer letters' };
    if (path.includes('joining')) return { app: 'Recruit', page: 'Joining formalities' };
    if (path.includes('onboarding')) return { app: 'Recruit', page: 'Onboarding checklist' };
    if (path.includes('internships')) return { app: 'Recruit', page: 'Internship management' };
    if (path.includes('pipeline')) return { app: 'Recruit', page: 'Pipeline & jobs' };

    // Payroll App Sections
    if (path.includes('payroll/dashboard')) return { app: 'Payroll', page: 'Payroll dashboard' };
    if (path.includes('payroll/monthly')) return { app: 'Payroll', page: 'Monthly payroll' };
    if (path.includes('payroll/salary-structure')) return { app: 'Payroll', page: 'Salary structure' };
    if (path.includes('payroll/salary-revisions')) return { app: 'Payroll', page: 'Salary revision & appraisals' };
    if (path.includes('payroll/payslips')) return { app: 'Payroll', page: 'Payslip records' };
    if (path.includes('payroll/pf-esi')) return { app: 'Payroll', page: 'PF & ESI compliance' };
    if (path.includes('payroll/statutory')) return { app: 'Payroll', page: 'Statutory compliance' };
    if (path.includes('payroll/runs') || path.includes('payroll/admin')) return { app: 'Payroll', page: 'Payroll runs' };
    if (path.includes('payroll/benefits')) return { app: 'Payroll', page: 'Benefits' };

    // Expense App Sections
    if (path.includes('expenses/dashboard') || path === '/expenses') return { app: 'Expense', page: 'Expense dashboard' };
    if (path.includes('expenses/office') || path.includes('office-expenses')) return { app: 'Expense', page: 'Office expenses' };
    if (path.includes('expenses/claims') || path.includes('expenses/my-claims') || path.includes('my-expenses')) return { app: 'Expense', page: 'All claims' };

    // Shift App Sections (Evaluated before People to avoid greedy matching)
    if (path.includes('weekly-roster') || path.includes('/shift/roster')) return { app: 'Shift', page: 'Weekly roster' };
    if (path.includes('daily-attendance') || path.includes('/shift/attendance')) return { app: 'Shift', page: 'Daily attendance' };
    if (path.includes('login-logout')) return { app: 'Shift', page: 'Login & logout tracking' };
    if (path.includes('leave-requests') || path.includes('/shift/requests')) return { app: 'Shift', page: 'Leave requests' };
    if (path.includes('leave-calculator') || path.includes('/shift/calculator')) return { app: 'Shift', page: 'Leave balance' };
    if (path.includes('/people/wfh') || path.includes('/shift/wfh')) return { app: 'Shift', page: 'Work from home' };
    if (path.includes('/people/comp-off') || path.includes('/shift/comp-off')) return { app: 'Shift', page: 'Comp-off tracker' };
    if (path.includes('/people/holidays') || path.includes('/shift/holidays')) return { app: 'Shift', page: 'Holiday calendar' };
    if (path.includes('shift-swaps') || path.includes('/shift/swaps')) return { app: 'Shift', page: 'Swap requests' };
    if (path.includes('shifts-schedule') || path.includes('/shift/shifts')) return { app: 'Shift', page: 'Attendance & shifts' };
    if (path.includes('/people/time') || path === '/shift') return { app: 'Shift', page: 'Weekly roster' };

    // People App Sections
    if (path.includes('profile')) return { app: 'People', page: 'My profile' };
    if (path.includes('leaves-admin')) return { app: 'People', page: 'Leave approvals' };
    if (path.includes('leave')) return { app: 'People', page: 'Leave' };
    if (path.includes('attendance-admin')) return { app: 'People', page: 'Attendance logs' };
    if (path.includes('attendance')) return { app: 'People', page: 'Attendance' };
    if (path.includes('goals')) return { app: 'People', page: 'Goals & reviews' };
    if (path.includes('documents')) return { app: 'People', page: 'Documents & letters' };
    if (path.includes('assets-admin')) return { app: 'People', page: 'Asset inventory' };
    if (path.includes('assets')) return { app: 'People', page: 'My assets' };
    if (path.includes('helpdesk-admin')) return { app: 'People', page: 'Helpdesk queue' };
    if (path.includes('helpdesk')) return { app: 'People', page: 'HR helpdesk' };
    if (path.includes('resignation')) return { app: 'People', page: 'Resignation' };
    if (path.includes('directory')) return { app: 'People', page: 'Directory & profiles' };
    if (path.includes('policies')) return { app: 'People', page: 'Company policies' };

    const appName =
      currentApp === 'recruit'
        ? 'Recruit'
        : currentApp === 'payroll'
        ? 'Payroll'
        : currentApp === 'expense'
        ? 'Expense'
        : currentApp === 'shift'
        ? 'Shift'
        : currentApp === 'learn'
        ? 'Learn'
        : currentApp === 'sign'
        ? 'Sign'
        : currentApp === 'connect'
        ? 'Connect'
        : currentApp === 'plus'
        ? 'People Plus'
        : 'People';
    return {
      app: appName,
      page:
        currentApp === 'shift'
          ? 'Weekly roster'
          : currentApp === 'payroll'
          ? 'Payroll dashboard'
          : currentApp === 'expense'
          ? 'Expense dashboard'
          : activeRole === 'admin'
          ? 'Dashboard'
          : 'My profile',
    };
  };

  const breadcrumb = getBreadcrumbs();

  // Display user info based on active user or activeRole
  const isEmployeeRole = activeRole === 'employee';
  const displayName = user?.name || (isEmployeeRole ? 'Employee' : 'HR Admin');
  const displayRole = user?.role || (isEmployeeRole ? 'Employee' : 'HR Admin');
  const displayInitials = (user?.name || (isEmployeeRole ? 'RV' : 'AR'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarClass = isEmployeeRole ? 'avatar-rv' : 'avatar-ar';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070E22]/95 backdrop-blur-md px-6 flex items-center justify-between z-20 transition-colors duration-200">
      {/* Left: App Launcher & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* 4-squares App Launcher */}
        <button
          onClick={() => setIsAppLauncherOpen(!isAppLauncherOpen)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isAppLauncherOpen
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
          title="Switch Brightcone Application"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumb updating on any section change */}
        <div className="breadcrumb-container">
          <span className="hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
            {breadcrumb.app}
          </span>
          <span className="text-slate-300 dark:text-slate-600 font-normal">›</span>
          <span className="breadcrumb-active">{breadcrumb.page}</span>
        </div>
      </div>

      {/* Center: Search Box Ctrl K */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search people, pages or actions"
          className="w-full bg-slate-100 dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] rounded-xl pl-9 pr-14 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
          Ctrl K
        </span>
      </div>

      {/* Right: Theme Toggle, Notifications Bell, User Pill */}
      <div className="flex items-center gap-3">

        {/* Theme Toggle (Moon / Sun) */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications Bell */}
        <button
          type="button"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-white dark:ring-[#070E22]" />
        </button>

        {/* User Pill matching Screenshots */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className={`avatar-circle ${avatarClass}`}>
            {displayInitials}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {displayName}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {displayRole}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
