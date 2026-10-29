import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortal, PortalApp } from '../../context/PortalContext';
import { BrightconeIcon } from '../common/BrightconeLogo';
import {
  Gift,
  Megaphone,
  Briefcase,
  Users,
  LayoutDashboard,
  Calendar,
  Send,
  UserCheck,
  CheckSquare,
  GraduationCap,
  Clock,
  TrendingUp,
  FileText,
  Laptop,
  HelpCircle,
  DoorOpen,
  LogOut,
  ChevronDown,
  User as UserIcon,
  BookOpen,
  Tag,
  Award,
  Shield,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  CreditCard,
  UserPlus,
  UserMinus,
  Receipt,
  FileSpreadsheet,
  Building,
  Key,
  Database,
  History,
  X,
  LayoutGrid,
  FileSignature,
  MessageSquare,
  LogIn,
  ArrowLeftRight,
  Home,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { currentApp, setCurrentApp, activeRole } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();

  // Bi-directional synchronization between current URL path and currentApp
  useEffect(() => {
    const p = location.pathname;
    if (
      p.startsWith('/shift') ||
      p.includes('weekly-roster') ||
      p.includes('daily-attendance') ||
      p.includes('login-logout') ||
      p.includes('leave-requests') ||
      p.includes('leave-calculator') ||
      p.includes('shift-swaps') ||
      p.includes('shifts-schedule') ||
      p.includes('/people/wfh') ||
      p.includes('/people/comp-off') ||
      p.includes('/people/holidays') ||
      p.includes('/people/time')
    ) {
      if (currentApp !== 'shift') setCurrentApp('shift');
    } else if (p.startsWith('/expense')) {
      if (currentApp !== 'expense') setCurrentApp('expense');
    } else if (p.startsWith('/doc-sign') || p.startsWith('/sign')) {
      if (currentApp !== 'sign') setCurrentApp('sign');
    } else if (p.startsWith('/connect') || p.startsWith('/engagement')) {
      if (currentApp !== 'connect') setCurrentApp('connect');
    } else if (p.startsWith('/recruit')) {
      if (currentApp !== 'recruit') setCurrentApp('recruit');
    } else if (p.startsWith('/learn')) {
      if (currentApp !== 'learn') setCurrentApp('learn');
    } else if (p.startsWith('/payroll')) {
      if (currentApp !== 'payroll') setCurrentApp('payroll');
    } else if (p.startsWith('/suite') || p.startsWith('/plus')) {
      if (currentApp !== 'plus') setCurrentApp('plus');
    }
  }, [location.pathname, currentApp, setCurrentApp]);

  const handleSignOut = async () => {
    await logout();
    navigate('/signin');
  };

  const handleSwitchApp = (app: PortalApp) => {
    setCurrentApp(app);
    onCloseMobile?.();
    if (app === 'recruit') {
      navigate(activeRole === 'employee' ? '/recruit/jobs-referrals' : '/recruit/dashboard');
    } else if (app === 'learn') {
      navigate(activeRole === 'employee' ? '/learn/my-learning' : '/learn/dashboard');
    } else if (app === 'payroll') {
      navigate(activeRole === 'employee' ? '/payroll/payslips' : '/payroll/dashboard');
    } else if (app === 'expense') {
      navigate(activeRole === 'employee' ? '/expense/claims' : '/expense/dashboard');
    } else if (app === 'sign') {
      navigate('/doc-sign/dashboard');
    } else if (app === 'connect') {
      navigate('/connect');
    } else if (app === 'shift') {
      navigate('/people/weekly-roster');
    } else if (app === 'plus') {
      navigate('/suite/dashboard');
    } else {
      navigate(activeRole === 'employee' ? '/people/profile' : '/people/directory');
    }
  };

  const isEmployee = activeRole === 'employee';
  const isRecruit = currentApp === 'recruit';
  const isLearn = currentApp === 'learn';
  const isPeople = currentApp === 'people';
  const isPayroll = currentApp === 'payroll';
  const isExpense = currentApp === 'expense';
  const isSign = currentApp === 'sign';
  const isConnect = currentApp === 'connect';
  const isShift = currentApp === 'shift';
  const isPlus = currentApp === 'plus';

  // Branding configuration
  let appTitle = 'People';
  let brandIcon = <Users className="w-5 h-5 text-white" />;
  let brandBoxClass = 'sidebar-icon-people';

  if (isRecruit) {
    appTitle = 'Recruit';
    brandIcon = <Briefcase className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-recruit';
  } else if (isLearn) {
    appTitle = 'Learn';
    brandIcon = <GraduationCap className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-learn';
  } else if (isPayroll) {
    appTitle = 'Payroll';
    brandIcon = <CreditCard className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-payroll';
  } else if (isExpense) {
    appTitle = 'Expense';
    brandIcon = <Receipt className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-expense';
  } else if (isSign) {
    appTitle = 'Sign';
    brandIcon = <FileSignature className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-sign';
  } else if (isConnect) {
    appTitle = 'Connect';
    brandIcon = <MessageSquare className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-connect';
  } else if (isShift) {
    appTitle = 'Shift';
    brandIcon = <Calendar className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-shift';
  } else if (isPlus) {
    appTitle = 'People Plus';
    brandIcon = <LayoutGrid className="w-5 h-5 text-white" />;
    brandBoxClass = 'sidebar-icon-plus';
  }

  const appSubtitle = isEmployee ? 'Employee self-service' : 'HR Admin';

  // User card at bottom
  const userName = user?.name || (isEmployee ? 'Employee' : 'HR Admin');
  const userEmail = user?.email || (isEmployee ? 'employee@brightcone.ai' : 'admin@brightcone.ai');
  const userInitials = (user?.name || (isEmployee ? 'RV' : 'AR'))
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarClass = isEmployee ? 'avatar-rv' : 'avatar-ar';

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setCollapsedSections((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Shell: Fixed drawer on < lg, static flex on lg */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 h-screen select-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* ================================================================= */}
        {/* LEFT DARK APP DOCK RAIL matching Screenshot 5 */}
        {/* ================================================================= */}
        <nav className="app-dock-rail" aria-label="Application Dock">
          {/* Top: Brightcone 3D Crystal Prism Logo Mark */}
          <div 
            onClick={() => handleSwitchApp('recruit')}
            className="cursor-pointer hover:scale-105 transition-transform p-1 mb-2"
            title="Brightcone AI"
          >
            <BrightconeIcon size={36} />
          </div>

          {/* Dock Item 1: People */}
          <button
            onClick={() => handleSwitchApp('people')}
            type="button"
            className={`dock-item-btn ${isPeople ? 'dock-item-active-people' : ''}`}
            title="People Application"
          >
            <Users className="w-5 h-5" />
            <span className="dock-label">People</span>
            <span className="dock-badge-pill">4</span>
          </button>

          {/* Dock Item 2: Recruit */}
          <button
            onClick={() => handleSwitchApp('recruit')}
            type="button"
            className={`dock-item-btn ${isRecruit ? 'dock-item-active-recruit' : ''}`}
            title="Recruit Application"
          >
            <Briefcase className="w-5 h-5" />
            <span className="dock-label">Recruit</span>
          </button>

          {/* Dock Item 3: Payroll */}
          <button
            onClick={() => handleSwitchApp('payroll')}
            type="button"
            className={`dock-item-btn ${isPayroll ? 'dock-item-active-payroll' : ''}`}
            title="Payroll Management"
          >
            <CreditCard className="w-5 h-5" />
            <span className="dock-label">Payroll</span>
            <span className="dock-badge-pill">101</span>
          </button>

          {/* Dock Item 4: Expense */}
          <button
            onClick={() => handleSwitchApp('expense')}
            type="button"
            className={`dock-item-btn ${isExpense ? 'dock-item-active-expense' : ''}`}
            title="Expense Claims & Operations"
          >
            <Receipt className="w-5 h-5" />
            <span className="dock-label">Expense</span>
            <span className="dock-badge-pill">1</span>
          </button>

          {/* Dock Item 5: Sign */}
          <button
            onClick={() => handleSwitchApp('sign')}
            type="button"
            className={`dock-item-btn ${isSign ? 'dock-item-active-sign' : ''}`}
            title="E-Signatures & Policies"
          >
            <FileSignature className="w-5 h-5" />
            <span className="dock-label">Sign</span>
          </button>

          {/* Dock Item 6: Connect */}
          <button
            onClick={() => handleSwitchApp('connect')}
            type="button"
            className={`dock-item-btn ${isConnect ? 'dock-item-active-connect' : ''}`}
            title="Company Connect & Feed"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="dock-label">Connect</span>
          </button>

          {/* Dock Item 7: Learn */}
          <button
            onClick={() => handleSwitchApp('learn')}
            type="button"
            className={`dock-item-btn ${isLearn ? 'dock-item-active-learn' : ''}`}
            title="Learning & LMS"
          >
            <GraduationCap className="w-5 h-5" />
            <span className="dock-label">Learn</span>
          </button>

          {/* Dock Item 8: Shift */}
          <button
            onClick={() => handleSwitchApp('shift')}
            type="button"
            className={`dock-item-btn ${isShift ? 'dock-item-active-shift' : ''}`}
            title="Shift, Attendance & Leaves"
          >
            <Calendar className="w-5 h-5" />
            <span className="dock-label">Shift</span>
            <span className="dock-badge-pill">3</span>
          </button>

          {/* Dock Item 9: People Plus Suite */}
          <button
            onClick={() => handleSwitchApp('plus')}
            type="button"
            className={`dock-item-btn ${isPlus ? 'dock-item-active-plus' : ''}`}
            title="People Plus Unified Suite"
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="dock-label">Plus</span>
            <span className="dock-badge-pill">8</span>
          </button>
        </nav>

        {/* ================================================================= */}
        {/* SUBMENU SIDEBAR (White/Light in Light Theme, Dark in Dark Theme) */}
        {/* ================================================================= */}
        <aside className="w-56 sm:w-60 bg-white dark:bg-[#070E22] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between text-slate-800 dark:text-slate-200 transition-colors duration-200 shadow-sm">
          <div>
            {/* Top Header Card matching Screenshot 5 */}
            <div className="sidebar-brand-card border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`sidebar-icon-box ${brandBoxClass}`}>
                  {brandIcon}
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white leading-tight font-['Sora']">
                    {appTitle}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {appSubtitle}
                  </div>
                </div>
              </div>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

          {/* Navigation Links */}
          <div className="py-3 px-2 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)]">
            {/* ------------------------------------------------------------- */}
            {/* EMPLOYEE SELF-SERVICE NAVIGATION */}
            {/* ------------------------------------------------------------- */}
            {isEmployee && (
              <>
                {isRecruit && (
                  <div>
                    <div className="nav-category-header">
                      <span>Careers</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <NavLink
                        to="/recruit/jobs-referrals"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                        }
                      >
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span>Jobs & referrals</span>
                      </NavLink>
                    </div>
                  </div>
                )}

                {isLearn && (
                  <div>
                    <div className="nav-category-header">
                      <span>Learning</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <NavLink
                        to="/learn/my-learning"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                        }
                      >
                        <GraduationCap className="w-4 h-4 shrink-0" />
                        <span>My learning</span>
                      </NavLink>
                      <NavLink
                        to="/learn/completion"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                        }
                      >
                        <CheckSquare className="w-4 h-4 shrink-0" />
                        <span>Training completion</span>
                      </NavLink>
                      <NavLink
                        to="/learn/records"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                        }
                      >
                        <Award className="w-4 h-4 shrink-0" />
                        <span>Certificates & records</span>
                      </NavLink>
                      <NavLink
                        to="/learn/recommendations"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                        }
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Skill recommendations</span>
                      </NavLink>
                      <NavLink
                        to="/learn/skills"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                        }
                      >
                        <Layers className="w-4 h-4 shrink-0" />
                        <span>Skills matrix</span>
                      </NavLink>
                    </div>
                  </div>
                )}

                {isPeople && (
                  <>
                    {/* OVERVIEW matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people"
                            end
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <LayoutGrid className="w-4 h-4 shrink-0" />
                            <span>People dashboard</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* EMPLOYEE MANAGEMENT matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-management')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Employee Management</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-management'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-management'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people/employees"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>Employee master data</span>
                          </NavLink>
                          <NavLink
                            to="/people/profile"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <UserIcon className="w-4 h-4 shrink-0" />
                            <span>Employee profiles</span>
                          </NavLink>
                          <NavLink
                            to="/people/new-joiners"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <UserPlus className="w-4 h-4 shrink-0" />
                            <span>New joiners</span>
                          </NavLink>
                          <NavLink
                            to="/people/probation"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Probation tracking</span>
                          </NavLink>
                          <NavLink
                            to="/people/documents"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>Employee documents</span>
                          </NavLink>
                          <NavLink
                            to="/people/exits"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <DoorOpen className="w-4 h-4 shrink-0" />
                            <span>Employee exit management</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* PERFORMANCE matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-performance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Performance</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-performance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-performance'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people/appraisals"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span>Appraisal tracker</span>
                          </NavLink>
                          <NavLink
                            to="/performance"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <BarChart3 className="w-4 h-4 shrink-0" />
                            <span>Performance reviews</span>
                          </NavLink>
                          <NavLink
                            to="/people/probation-reviews"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <CheckSquare className="w-4 h-4 shrink-0" />
                            <span>Probation reviews</span>
                          </NavLink>
                          <NavLink
                            to="/people/increments"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <span>Increment history</span>
                          </NavLink>
                          <NavLink
                            to="/people/recognition"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Award className="w-4 h-4 shrink-0" />
                            <span>Employee recognition</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* ADMINISTRATION & ASSETS matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-assets')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Administration & Assets</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-assets'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-assets'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people/assets"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Laptop className="w-4 h-4 shrink-0" />
                            <span>Laptop & assets</span>
                          </NavLink>
                          <NavLink
                            to="/people/access-cards"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <CreditCard className="w-4 h-4 shrink-0" />
                            <span>Access cards</span>
                          </NavLink>
                          <NavLink
                            to="/people/facilities"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Building className="w-4 h-4 shrink-0" />
                            <span>Office facilities</span>
                          </NavLink>
                          <NavLink
                            to="/people/vendors"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Briefcase className="w-4 h-4 shrink-0" />
                            <span>Vendor management</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* WORKFORCE matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-workforce')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Workforce</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-workforce'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-workforce'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people/directory"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>Employees</span>
                          </NavLink>
                          <NavLink
                            to="/people/org-structure"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Layers className="w-4 h-4 shrink-0" />
                            <span>Org structure</span>
                          </NavLink>
                          <NavLink
                            to="/people/onboarding"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <UserPlus className="w-4 h-4 shrink-0" />
                            <span>Onboarding</span>
                          </NavLink>
                          <NavLink
                            to="/people/offboarding"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <DoorOpen className="w-4 h-4 shrink-0" />
                            <span>Exits & offboarding</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* TIME OFF matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-timeoff')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Time Off</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-timeoff'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-timeoff'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/people/leave"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Leave management</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* OPERATIONS matching Screenshot 3 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('people-operations')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Operations</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['people-operations'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['people-operations'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/performance"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <TrendingUp className="w-4 h-4 shrink-0" />
                            <span>Performance</span>
                          </NavLink>
                          <NavLink
                            to="/people/assets"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <Laptop className="w-4 h-4 shrink-0" />
                            <span>Assets</span>
                          </NavLink>
                          <NavLink
                            to="/people/letters"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>Documents & letters</span>
                          </NavLink>
                          <NavLink
                            to="/people/helpdesk"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                            }
                          >
                            <HelpCircle className="w-4 h-4 shrink-0" />
                            <span>Helpdesk queue</span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isPayroll && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection('emp-payroll')}
                      className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                    >
                      <span>Payroll</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['emp-payroll'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                    </button>
                    {!collapsedSections['emp-payroll'] && (
                      <div className="space-y-1">
                        <NavLink
                          to="/payroll/payslips"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Receipt className="w-4 h-4 shrink-0" />
                          <span>My payslips</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/benefits"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Award className="w-4 h-4 shrink-0" />
                          <span>Employee benefits</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}

                {isExpense && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSection('emp-expense')}
                      className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                    >
                      <span>Expenses</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['emp-expense'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                    </button>
                    {!collapsedSections['emp-expense'] && (
                      <div className="space-y-1">
                        <NavLink
                          to="/payroll/expenses"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-expense' : ''}`
                          }
                        >
                          <FileSpreadsheet className="w-4 h-4 shrink-0" />
                          <span>My expense claims</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/office-expense"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-expense' : ''}`
                          }
                        >
                          <Building className="w-4 h-4 shrink-0" />
                          <span>Office expenses</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}

                {isSign && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <FileSignature className="w-4 h-4 shrink-0" />
                          <span>Sign dashboard</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-compliance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>HR Policies & Compliance</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-compliance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-compliance'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/handbook"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <span>Employee handbook</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/policies"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>HR policies</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/acknowledgements"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>Policy acknowledgements</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-documents')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Documents</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-documents'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-documents'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/requests"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Signature requests</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/templates"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <Tag className="w-4 h-4 shrink-0" />
                          <span>Templates</span>
                        </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                                {isConnect && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>Company feed</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-engagement')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Employee Engagement</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-engagement'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-engagement'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect/birthdays"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Gift className="w-4 h-4 shrink-0" />
                            <span>Birthdays & anniversaries</span>
                          </NavLink>
                          <NavLink
                            to="/connect/events"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Company events</span>
                          </NavLink>
                          <NavLink
                            to="/connect/feedback"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>Employee feedback</span>
                          </NavLink>
                          <NavLink
                            to="/connect/townhall"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Megaphone className="w-4 h-4 shrink-0" />
                            <span>Town hall meetings</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-communicate')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Communicate</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-communicate'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-communicate'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect/announcements"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Megaphone className="w-4 h-4 shrink-0" />
                            <span>Announcements</span>
                          </NavLink>
                          <NavLink
                            to="/people/directory"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>People directory</span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isShift && (
                  <>
                    {/* ATTENDANCE & LEAVE matching Screenshot 2 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('shift-attendance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Attendance & Leave</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['shift-attendance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['shift-attendance'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/shift/attendance"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Daily attendance</span>
                          </NavLink>
                          <NavLink
                            to="/shift/requests"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Leave requests</span>
                          </NavLink>
                          <NavLink
                            to="/shift/quotas"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <CheckSquare className="w-4 h-4 shrink-0" />
                            <span>Leave balance</span>
                          </NavLink>
                          <NavLink
                            to="/shift/wfh"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Laptop className="w-4 h-4 shrink-0" />
                            <span>Work from home tracker</span>
                          </NavLink>
                          <NavLink
                            to="/shift/comp-off"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Award className="w-4 h-4 shrink-0" />
                            <span>Comp-off tracker</span>
                          </NavLink>
                          <NavLink
                            to="/shift/holidays"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Holiday calendar</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* ROSTER & SHIFTS matching Screenshot 2 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('shift-roster')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Roster & Shifts</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['shift-roster'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['shift-roster'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/shift/roster"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Weekly roster</span>
                          </NavLink>
                          <NavLink
                            to="/shift/shifts"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Clock className="w-4 h-4 shrink-0" />
                            <span>Attendance & shifts</span>
                          </NavLink>
                          <NavLink
                            to="/shift/swaps"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <Layers className="w-4 h-4 shrink-0" />
                            <span>Swap requests</span>
                          </NavLink>
                          <NavLink
                            to="/shift/calculator"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                            }
                          >
                            <BarChart3 className="w-4 h-4 shrink-0" />
                            <span>Leave calculator</span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isPlus && (
                  <div>
                    <div className="nav-category-header">
                      <span>Unified Suite</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      <NavLink
                        to="/suite/dashboard"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                        }
                      >
                        <LayoutGrid className="w-4 h-4 shrink-0" />
                        <span>My dashboard</span>
                      </NavLink>
                      <NavLink
                        to="/people-plus"
                        className={({ isActive }) =>
                          `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                        }
                      >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span>Open Fullscreen Suite</span>
                      </NavLink>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ------------------------------------------------------------- */}
            {/* HR ADMIN COMPANY-WIDE NAVIGATION matching Screenshots 3, 4, 5 */}
            {/* ------------------------------------------------------------- */}
            {!isEmployee && (
              <>
                {isRecruit && (
                  <>
                    <div>
                      <div className="nav-category-header">
                        <span>Overview</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/recruit/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Recruit dashboard</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Recruitment & Onboarding</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/recruit/manpower"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <Briefcase className="w-4 h-4 shrink-0" />
                          <span>Manpower requirements</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/candidate-tracker"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span>Candidate tracker</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/interviews"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Interview scheduling</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/offers"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <Send className="w-4 h-4 shrink-0" />
                          <span>Offer letters</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/joining"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>Joining formalities</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/onboarding"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <CheckSquare className="w-4 h-4 shrink-0" />
                          <span>Onboarding checklist</span>
                        </NavLink>
                        <NavLink
                          to="/recruit/internships"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <GraduationCap className="w-4 h-4 shrink-0" />
                          <span>Internship management</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Hiring</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/recruit/pipeline"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-recruit' : ''}`
                          }
                        >
                          <Briefcase className="w-4 h-4 shrink-0" />
                          <span>Pipeline & jobs</span>
                        </NavLink>
                      </div>
                    </div>
                  </>
                )}

                {isLearn && (
                  <>
                    {/* OVERVIEW matching Screenshot 1 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('learn-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group uppercase tracking-wider text-[11px] font-bold"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['learn-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['learn-overview'] && (
                        <div className="space-y-1 mt-1">
                          <NavLink
                            to="/learn/dashboard"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <LayoutGrid className="w-4 h-4 shrink-0" />
                            <span>Learn dashboard</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* TRAINING & DEVELOPMENT matching Screenshot 1 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('learn-training')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group uppercase tracking-wider text-[11px] font-bold"
                      >
                        <span>Training & Development</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['learn-training'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['learn-training'] && (
                        <div className="space-y-1 mt-1">
                          <NavLink
                            to="/learn/training"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <GraduationCap className="w-4 h-4 shrink-0" />
                            <span>Training & development</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* COMPLIANCE TRAINING matching Screenshot 1 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('learn-compliance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group uppercase tracking-wider text-[11px] font-bold"
                      >
                        <span>Compliance Training</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['learn-compliance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['learn-compliance'] && (
                        <div className="space-y-1 mt-1">
                          <NavLink
                            to="/learn/posh"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <Shield className="w-4 h-4 shrink-0" />
                            <span>POSH training & committee</span>
                          </NavLink>
                          <NavLink
                            to="/learn/security-training"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>Security & compliance training</span>
                          </NavLink>
                          <NavLink
                            to="/learn/completion"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <CheckSquare className="w-4 h-4 shrink-0" />
                            <span>Training completion</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* CATALOGUE matching Screenshot 1 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('learn-catalogue')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group uppercase tracking-wider text-[11px] font-bold"
                      >
                        <span>Catalogue</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['learn-catalogue'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['learn-catalogue'] && (
                        <div className="space-y-1 mt-1">
                          <NavLink
                            to="/learn/courses"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-learn' : ''}`
                            }
                          >
                            <GraduationCap className="w-4 h-4 shrink-0" />
                            <span>Courses</span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isPeople && (
                  <>
                    <div>
                      <div className="nav-category-header">
                        <span>Workforce Management</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/directory"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Users className="w-4 h-4 shrink-0" />
                          <span>Directory & profiles</span>
                        </NavLink>
                        <NavLink
                          to="/people/leaves-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Leave approvals</span>
                        </NavLink>
                        <NavLink
                          to="/people/leave-requests"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Leave requests</span>
                        </NavLink>
                        <NavLink
                          to="/people/shifts-schedule"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Shifts schedule</span>
                        </NavLink>
                        <NavLink
                          to="/people/weekly-roster"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Weekly roster</span>
                        </NavLink>
                        <NavLink
                          to="/people/comp-off"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <CheckSquare className="w-4 h-4 shrink-0" />
                          <span>Comp-off tracker</span>
                        </NavLink>
                        <NavLink
                          to="/people/wfh"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Laptop className="w-4 h-4 shrink-0" />
                          <span>Work from home</span>
                        </NavLink>
                        <NavLink
                          to="/people/attendance-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Attendance logs</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Lifecycle Management</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/onboarding-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <UserPlus className="w-4 h-4 shrink-0" />
                          <span>Onboarding pipeline</span>
                        </NavLink>
                        <NavLink
                          to="/people/exit-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <UserMinus className="w-4 h-4 shrink-0" />
                          <span>Exit & offboarding</span>
                        </NavLink>
                        <NavLink
                          to="/people/probation-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>Probation review</span>
                        </NavLink>
                        <NavLink
                          to="/people/performance-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <BarChart3 className="w-4 h-4 shrink-0" />
                          <span>Performance admin</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Operations & Records</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/documents-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Employee documents</span>
                        </NavLink>
                        <NavLink
                          to="/people/benefits-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Award className="w-4 h-4 shrink-0" />
                          <span>Benefits admin</span>
                        </NavLink>
                        <NavLink
                          to="/people/policies"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Company policies</span>
                        </NavLink>
                        <NavLink
                          to="/people/assets-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <Laptop className="w-4 h-4 shrink-0" />
                          <span>Asset inventory</span>
                        </NavLink>
                        <NavLink
                          to="/people/helpdesk-admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <HelpCircle className="w-4 h-4 shrink-0" />
                          <span>Helpdesk queue</span>
                        </NavLink>
                        <NavLink
                          to="/people/csv-import"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-people' : ''}`
                          }
                        >
                          <FileSpreadsheet className="w-4 h-4 shrink-0" />
                          <span>Bulk CSV import</span>
                        </NavLink>
                      </div>
                    </div>
                  </>
                )}

                {isPayroll && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('payroll-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['payroll-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['payroll-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/payroll/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Payroll dashboard</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('payroll-compliance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Payroll & Compliance</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['payroll-compliance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['payroll-compliance'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/payroll/monthly"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Monthly payroll</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/salary-structure"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span>Salary structure</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/revisions"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <TrendingUp className="w-4 h-4 shrink-0" />
                          <span>Salary revision & appraisals</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/records"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <FileSpreadsheet className="w-4 h-4 shrink-0" />
                          <span>Payslip records</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/pf-esi"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>PF & ESI compliance</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/statutory"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Shield className="w-4 h-4 shrink-0" />
                          <span>Statutory compliance</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('payroll-runs')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Payroll</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['payroll-runs'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['payroll-runs'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/payroll/admin"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Receipt className="w-4 h-4 shrink-0" />
                          <span>Payroll runs</span>
                        </NavLink>
                        <NavLink
                          to="/payroll/benefits"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-payroll' : ''}`
                          }
                        >
                          <Award className="w-4 h-4 shrink-0" />
                          <span>Benefits</span>
                        </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isExpense && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('expense-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['expense-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['expense-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/expense/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-expense' : ''}`
                          }
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Expense dashboard</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('expense-office')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Office Expenses</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['expense-office'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['expense-office'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/expense/office"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-expense' : ''}`
                          }
                        >
                          <Building className="w-4 h-4 shrink-0" />
                          <span>Office expenses</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('expense-claims')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Claims</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['expense-claims'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['expense-claims'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/expense/claims"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-expense' : ''}`
                          }
                        >
                          <Receipt className="w-4 h-4 shrink-0" />
                          <span>All claims</span>
                        </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isSign && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <FileSignature className="w-4 h-4 shrink-0" />
                          <span>Sign dashboard</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-compliance')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>HR Policies & Compliance</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-compliance'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-compliance'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/handbook"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <span>Employee handbook</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/policies"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <ShieldCheck className="w-4 h-4 shrink-0" />
                          <span>HR policies</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/acknowledgements"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>Policy acknowledgements</span>
                        </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('sign-documents')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Documents</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['sign-documents'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['sign-documents'] && (
                        <div className="space-y-1">
                          <NavLink
                          to="/doc-sign/requests"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Signature requests</span>
                        </NavLink>
                        <NavLink
                          to="/doc-sign/templates"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-sign' : ''}`
                          }
                        >
                          <Tag className="w-4 h-4 shrink-0" />
                          <span>Templates</span>
                        </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                                {isConnect && (
                  <>
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-overview')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Overview</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-overview'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-overview'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>Company feed</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-engagement')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Employee Engagement</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-engagement'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-engagement'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect/birthdays"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Gift className="w-4 h-4 shrink-0" />
                            <span>Birthdays & anniversaries</span>
                          </NavLink>
                          <NavLink
                            to="/connect/events"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>Company events</span>
                          </NavLink>
                          <NavLink
                            to="/connect/feedback"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span>Employee feedback</span>
                          </NavLink>
                          <NavLink
                            to="/connect/townhall"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Megaphone className="w-4 h-4 shrink-0" />
                            <span>Town hall meetings</span>
                          </NavLink>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSection('connect-communicate')}
                        className="nav-category-header w-full flex items-center justify-between hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer group"
                      >
                        <span>Communicate</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsedSections['connect-communicate'] ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-500'}`} />
                      </button>
                      {!collapsedSections['connect-communicate'] && (
                        <div className="space-y-1">
                          <NavLink
                            to="/connect/announcements"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Megaphone className="w-4 h-4 shrink-0" />
                            <span>Announcements</span>
                          </NavLink>
                          <NavLink
                            to="/people/directory"
                            className={({ isActive }) =>
                              `nav-item-link ${isActive ? 'nav-item-active-connect' : ''}`
                            }
                          >
                            <Users className="w-4 h-4 shrink-0" />
                            <span>People directory</span>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isShift && (
                  <>
                    <div>
                      <div className="nav-category-header">
                        <span>Overview</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/weekly-roster"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>Weekly roster</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Attendance & Leave</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/daily-attendance"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Daily attendance</span>
                        </NavLink>
                        <NavLink
                          to="/people/login-logout"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <LogIn className="w-4 h-4 shrink-0" />
                          <span>Login & logout</span>
                        </NavLink>
                        <NavLink
                          to="/people/leave-requests"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <span>Leave requests</span>
                        </NavLink>
                        <NavLink
                          to="/people/leave-calculator"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Award className="w-4 h-4 shrink-0" />
                          <span>Leave balance</span>
                        </NavLink>
                        <NavLink
                          to="/people/wfh"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Home className="w-4 h-4 shrink-0" />
                          <span>Work from home</span>
                        </NavLink>
                        <NavLink
                          to="/people/comp-off"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <ArrowLeftRight className="w-4 h-4 shrink-0" />
                          <span>Comp-off tracker</span>
                        </NavLink>
                        <NavLink
                          to="/people/holidays"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Gift className="w-4 h-4 shrink-0" />
                          <span>Holiday calendar</span>
                        </NavLink>
                      </div>
                    </div>

                    <div>
                      <div className="nav-category-header">
                        <span>Manage</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/people/shift-swaps"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <ArrowLeftRight className="w-4 h-4 shrink-0" />
                          <span>Swap requests</span>
                        </NavLink>
                        <NavLink
                          to="/people/shifts-schedule"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-shift' : ''}`
                          }
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Attendance & shifts</span>
                        </NavLink>
                      </div>
                    </div>
                  </>
                )}

                {isPlus && (
                  <>
                    <div>
                      <div className="nav-category-header">
                        <span>Suite Governance</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1">
                        <NavLink
                          to="/suite/dashboard"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Suite overview</span>
                        </NavLink>
                        <NavLink
                          to="/suite/access"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <Key className="w-4 h-4 shrink-0" />
                          <span>Access control</span>
                        </NavLink>
                        <NavLink
                          to="/suite/actions"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>Automated actions</span>
                        </NavLink>
                        <NavLink
                          to="/suite/audit"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <History className="w-4 h-4 shrink-0" />
                          <span>System audit logs</span>
                        </NavLink>
                        <NavLink
                          to="/suite/backup"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <Database className="w-4 h-4 shrink-0" />
                          <span>Database backup</span>
                        </NavLink>
                        <NavLink
                          to="/suite/records"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <Layers className="w-4 h-4 shrink-0" />
                          <span>Master records</span>
                        </NavLink>
                        <NavLink
                          to="/people-plus"
                          className={({ isActive }) =>
                            `nav-item-link ${isActive ? 'nav-item-active-plus' : ''}`
                          }
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>Open Fullscreen Suite</span>
                        </NavLink>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#070E22]">
          <div className="sidebar-user-card bg-slate-50 dark:bg-[#0E1833]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`avatar-circle ${avatarClass}`}>
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userName}
                </div>
                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
    </>
  );
};

export default Sidebar;
