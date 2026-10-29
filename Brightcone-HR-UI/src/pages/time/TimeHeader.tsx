import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  Grid,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import type { ActiveTab } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  activeTab: ActiveTab;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isBackendConnected: boolean | null;
  onRefreshConnection: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TimeHeader: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  activeTab,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const displayName = user?.name || 'Guest User';
  const displayRole = user?.role || (user ? 'Employee' : 'Not signed in');
  const displayInitials = (user?.name || 'GU')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const getBreadcrumbLabel = () => {
    switch (activeTab) {
      case 'weekly-roster':
        return 'Weekly roster';
      case 'daily-attendance':
        return 'Daily attendance';
      case 'shifts':
        return 'Attendance & shifts';
      case 'holidays':
        return 'Holiday calendar';
      case 'leave-types':
        return 'Leave types';
      case 'leave-quotas':
        return 'Leave quotas';
      case 'leave-calculator':
        return 'Leave calculator';
      case 'leave-requests':
        return 'Leave requests & balances';
      case 'work-from-home':
        return 'Work from home';
      case 'comp-off':
        return 'Comp-off tracker';
      case 'shift-swaps':
        return 'Swap requests';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-3.5 bg-white/90 dark:bg-[#060D1A]/90 backdrop-blur-md border-b border-[#E3E8F2] dark:border-[#152347] transition-colors text-[#0E1730] dark:text-[#C9D3EE]">
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-[#E3E8F2] dark:border-[#152347] bg-[#F8FAFD] dark:bg-[#0E1A38] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation matching screenshot */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <div className="p-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-[#152347] text-[#64748B] dark:text-[#8D9BB8]">
            <Grid className="w-4 h-4" />
          </div>
          <span className="text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white transition-colors cursor-pointer">
            Shift
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] dark:text-[#54658B]" />
          <span className="font-semibold text-[#0E1730] dark:text-white">
            {getBreadcrumbLabel()}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:flex items-center">
        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 text-[#94A3B8] dark:text-[#54658B] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search people, pages or actions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#091226] border border-[#E2E8F0] dark:border-[#18274A] text-[#0E1730] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#54658B] focus:outline-hidden focus:border-[#0B6FDB] transition-all"
          />
          <span className="absolute right-3 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-[#64748B] dark:text-[#54658B] bg-[#F1F5F9] dark:bg-[#0E1A38] border border-[#E2E8F0] dark:border-[#18274A]">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right Tools & User Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#152347] bg-[#F8FAFD] dark:bg-[#091226] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white transition-colors cursor-pointer"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#475569]" />}
        </button>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl border border-[#E2E8F0] dark:border-[#152347] bg-[#F8FAFD] dark:bg-[#091226] text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E2E8F0] dark:border-[#152347]">
          <div className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
            {displayInitials}
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <span className="font-semibold block text-[#0E1730] dark:text-white truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[11px] text-[#64748B] dark:text-[#647496] truncate max-w-[130px]">
              {displayRole}
            </span>
          </div>
          {user ? (
            <button
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="hidden sm:block p-1 text-[#64748B] dark:text-[#647496] hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              title="Sign In"
              aria-label="Sign In"
              className="hidden sm:block px-2.5 py-1 text-[11px] font-semibold bg-[#0B6FDB] text-white rounded-lg hover:bg-[#0B6FDB]/90 transition-colors cursor-pointer ml-1"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
