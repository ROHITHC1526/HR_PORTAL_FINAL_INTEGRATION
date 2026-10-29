import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AppLauncherModal } from './AppLauncherModal';
import { usePortal } from '../../context/PortalContext';

export const AppLayout: React.FC = () => {
  const { currentApp, setCurrentApp } = usePortal();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (
      path.startsWith('/shift') ||
      path.includes('weekly-roster') ||
      path.includes('daily-attendance') ||
      path.includes('login-logout') ||
      path.includes('leave-requests') ||
      path.includes('leave-calculator') ||
      path.includes('shift-swaps') ||
      path.includes('shifts-schedule') ||
      path.includes('/people/wfh') ||
      path.includes('/people/comp-off') ||
      path.includes('/people/holidays') ||
      path.includes('/people/time')
    ) {
      if (currentApp !== 'shift') setCurrentApp('shift');
    } else if (path.startsWith('/expense') || path.startsWith('/expenses') || path.startsWith('/office-expenses') || path.startsWith('/my-expenses')) {
      if (currentApp !== 'expense') setCurrentApp('expense');
    } else if (path.startsWith('/doc-sign') || path.startsWith('/sign')) {
      if (currentApp !== 'sign') setCurrentApp('sign');
    } else if (path.startsWith('/connect') || path.startsWith('/engagement') || path.startsWith('/feed') || path.startsWith('/helpdesk')) {
      if (currentApp !== 'connect') setCurrentApp('connect');
    } else if (path.startsWith('/recruit')) {
      if (currentApp !== 'recruit') setCurrentApp('recruit');
    } else if (path.startsWith('/learn')) {
      if (currentApp !== 'learn') setCurrentApp('learn');
    } else if (path.startsWith('/payroll') || path.startsWith('/pay')) {
      if (currentApp !== 'payroll') setCurrentApp('payroll');
    } else if (path.startsWith('/suite') || path.startsWith('/plus') || path.startsWith('/people-plus')) {
      if (currentApp !== 'plus') setCurrentApp('plus');
    } else if (path.startsWith('/people')) {
      if (currentApp !== 'people') setCurrentApp('people');
    }
  }, [location.pathname, currentApp, setCurrentApp]);

  const accentClass =
    currentApp === 'recruit'
      ? 'top-accent-recruit'
      : currentApp === 'payroll'
      ? 'top-accent-payroll'
      : currentApp === 'expense'
      ? 'top-accent-expense'
      : currentApp === 'learn'
      ? 'top-accent-learn'
      : currentApp === 'sign'
      ? 'top-accent-sign'
      : currentApp === 'connect'
      ? 'top-accent-connect'
      : currentApp === 'shift'
      ? 'top-accent-shift'
      : currentApp === 'plus'
      ? 'top-accent-plus'
      : 'top-accent-people';

  return (
    <div className={`flex min-h-screen bg-[#F8FAFD] dark:bg-[#040A1A] text-slate-800 dark:text-slate-100 transition-colors duration-200 ${accentClass}`}>
      {/* App Switcher Modal */}
      <AppLauncherModal />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
