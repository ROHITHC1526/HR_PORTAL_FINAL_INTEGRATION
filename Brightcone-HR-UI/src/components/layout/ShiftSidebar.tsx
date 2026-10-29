import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  FileText,
  PieChart,
  X,
  Home,
  ArrowLeftRight,
  LogOut,
  LogIn,
  Calculator,
} from 'lucide-react';
import type { ActiveTab } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  shiftsCount: number;
  holidaysCount: number;
  leaveTypesCount: number;
  leaveQuotasCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  const { user } = useAuth();`r`n  const { user } = useAuth();`r`n  activeTab,`r`n  setActiveTab,
  isOpen,
  onClose,
  shiftsCount: _shiftsCount,
  holidaysCount: _holidaysCount,
  leaveTypesCount: _leaveTypesCount,
  leaveQuotasCount: _leaveQuotasCount,
}) => {
  // Far-left slim rail modules (production HR suite: Shift module active)
  const railModules = [
    { id: 'shift', icon: Calendar, label: 'Shift', isActive: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Main Dual Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Far-Left Slim Icon Rail */}
        <div className="w-16 bg-[#F8FAFD] dark:bg-[#040A15] border-r border-[#E3E8F2] dark:border-[#101C38] flex flex-col items-center py-4 justify-between shrink-0 select-none transition-colors">
          {/* App Top Logo */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B6FDB] to-[#0BA6CC] flex items-center justify-center font-bold text-white text-base shadow-lg shadow-[#0B6FDB]/30 mb-5">
            Γû▓
          </div>

          {/* Module Icons List */}
          <div className="flex-1 w-full space-y-3.5 flex flex-col items-center overflow-y-auto no-scrollbar">
            {railModules.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  title={m.label}
                  aria-label={m.label}
                  className={`relative p-2 rounded-xl transition-all cursor-pointer group flex flex-col items-center ${
                    m.isActive
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-[#0BA6CC] border border-[#0B6FDB]/30 dark:border-[#0BA6CC]/40 shadow-xs'
                      : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5 dark:text-[#647496] hover:text-[#0E1730] dark:hover:text-[#C9D3EE]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium tracking-tight mt-0.5 truncate max-w-12 text-center">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Sidebar (Shift & Attendance Menu) */}
        <div className="w-60 bg-white dark:bg-[#070F22] text-[#475569] dark:text-[#C9D3EE] border-r border-[#E3E8F2] dark:border-[#152347] flex flex-col p-4 transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 px-1 border-b border-[#E3E8F2] dark:border-[#152347]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B6FDB]/15 border border-[#0B6FDB]/30 dark:bg-[#0B6FDB]/20 dark:border-[#0B6FDB]/40 flex items-center justify-center text-[#0B6FDB] dark:text-[#0BA6CC] shadow-inner">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <b className="font-['Sora'] text-[#0E1730] dark:text-white text-base font-bold block leading-tight">
                  Shift
                </b>
                <span className="text-[#64748B] dark:text-[#647496] text-xs font-medium block">
                  HR Admin
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close navigation"
              className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#64748B] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs font-medium">
            {/* 1. OVERVIEW */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#54658B] px-2 mb-1.5">
                Overview
              </div>
              <button
                onClick={() => {
                  setActiveTab('weekly-roster');
                  onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'weekly-roster'
                    ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                    : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                }`}
              >
                <Calendar className={`w-4 h-4 ${activeTab === 'weekly-roster' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                <span>Weekly roster</span>
              </button>
            </div>

            {/* 2. ATTENDANCE & LEAVE */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#54658B] px-2 mb-1.5">
                Attendance & Leave
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('daily-attendance');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'daily-attendance'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${activeTab === 'daily-attendance' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Daily attendance</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login-logout');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'login-logout'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <LogIn className={`w-4 h-4 ${activeTab === 'login-logout' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Login & logout</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leave-requests');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'leave-requests'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'leave-requests' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Leave requests</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leave-calculator');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'leave-calculator'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <Calculator className={`w-4 h-4 ${activeTab === 'leave-calculator' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Leave calculator</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('work-from-home');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'work-from-home'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <Home className={`w-4 h-4 ${activeTab === 'work-from-home' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Work from home</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('comp-off');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'comp-off'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className={`w-4 h-4 ${activeTab === 'comp-off' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Comp-off tracker</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('holidays');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'holidays'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <Calendar className={`w-4 h-4 ${activeTab === 'holidays' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Holiday calendar</span>
                </button>
              </div>
            </div>

            {/* 3. MANAGE */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#54658B] px-2 mb-1.5">
                Manage
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab('shift-swaps');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'shift-swaps'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <ArrowLeftRight className={`w-4 h-4 ${activeTab === 'shift-swaps' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Swap requests</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('shifts');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'shifts'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${activeTab === 'shifts' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Attendance & shifts</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leave-quotas');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'leave-quotas'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <PieChart className={`w-4 h-4 ${activeTab === 'leave-quotas' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Leave quotas</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('leave-types');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                    activeTab === 'leave-types'
                      ? 'bg-[#0B6FDB]/15 text-[#0B6FDB] dark:bg-[#0B6FDB]/20 dark:text-white border border-[#0B6FDB]/30 dark:border-[#0B6FDB]/40 font-semibold shadow-xs'
                      : 'text-[#475569] dark:text-[#8D9BB8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0E1730] dark:hover:text-white'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${activeTab === 'leave-types' ? 'text-[#0B6FDB] dark:text-[#0BA6CC]' : 'opacity-70'}`} />
                  <span>Leave types</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Profile Card */}
          <div className="pt-3 border-t border-[#E3E8F2] dark:border-[#152347] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#722ED1] flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0">{(user?.name || 'HR Admin').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}</div><div className="min-w-0"><div className="font-semibold text-[#0E1730] dark:text-white truncate text-xs">{user?.name || 'HR Admin'}</div><div className="text-[10px] text-[#647496] dark:text-[#647496] truncate">{user?.email || 'admin@brightcone.ai'}</div>
              </div>
            </div>
            <button
              title="Logout"
              aria-label="Logout"
              className="p-1 rounded-lg text-[#64748B] dark:text-[#647496] hover:text-[#0E1730] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
