import { useState, useEffect, useCallback } from 'react';
import type { ActiveTab, Shift, Holiday, LeaveType, LeaveQuota } from '../../types';
import {
  api,
  INITIAL_SHIFTS,
  INITIAL_HOLIDAYS,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_QUOTAS,
} from '../../services/api';

import { ShiftsPage } from '../ShiftsPage';
import { HolidaysPage } from '../HolidaysPage';
import { LeaveTypesPage } from '../LeaveTypesPage';
import { LeaveQuotasPage } from '../LeaveQuotasPage';
import { WeeklyRosterPage } from '../WeeklyRosterPage';
import { DailyAttendancePage } from '../DailyAttendancePage';
import { LoginLogoutPage } from '../LoginLogoutPage';
import { LeaveCalculatorPage } from '../LeaveCalculatorPage';
import { LeaveRequestsPage } from '../LeaveRequestsPage';
import { WorkFromHomePage } from '../WorkFromHomePage';
import { CompOffTrackerPage } from '../CompOffTrackerPage';
import { ShiftSwapPage } from './ShiftSwapPage';
import { CheckCircle2, X } from 'lucide-react';

export function TimeModulePage({ initialTab = 'weekly-roster' }: { initialTab?: ActiveTab }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('brightcone_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
    } catch (_) {}
    return true;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Backend Connection & Feedback State
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Master Data Collections
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(INITIAL_LEAVE_TYPES);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveQuota[]>(INITIAL_LEAVE_QUOTAS);

  // Sync dark mode class on document element & persist preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('brightcone_theme', 'dark');
      } catch (_) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('brightcone_theme', 'light');
      } catch (_) {}
    }
  }, [darkMode]);

  // Flash toast message
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Check backend health
  const checkBackendStatus = useCallback(async () => {
    try {
      const isOk = await api.checkHealth();
      setIsBackendConnected(isOk);
      if (isOk) {
        setApiError(null);
      } else {
        setApiError('PostgreSQL backend at port 5151 is unreachable.');
      }
    } catch {
      setIsBackendConnected(false);
      setApiError('Unable to connect to Rust backend service.');
    }
  }, []);

  // Fetch initial master data from database
  const refreshShifts = useCallback(async () => {
    const res = await api.fetchShifts();
    if (res.data) setShifts(res.data);
  }, []);

  const refreshHolidays = useCallback(async () => {
    const res = await api.fetchHolidays();
    if (res.data) setHolidays(res.data);
  }, []);

  const refreshLeaveTypes = useCallback(async () => {
    const res = await api.fetchLeaveTypes();
    if (res.data) setLeaveTypes(res.data);
  }, []);

  const refreshLeaveQuotas = useCallback(async () => {
    const res = await api.fetchLeaveQuotas();
    if (res.data) setLeaveQuotas(res.data);
  }, []);

  const loadAllMasterData = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([
      refreshShifts(),
      refreshHolidays(),
      refreshLeaveTypes(),
      refreshLeaveQuotas(),
    ]);
    setIsLoading(false);
  }, [refreshShifts, refreshHolidays, refreshLeaveTypes, refreshLeaveQuotas]);

  useEffect(() => {
    checkBackendStatus();
    loadAllMasterData();
  }, [checkBackendStatus, loadAllMasterData]);

  // Periodic heartbeat
  useEffect(() => {
    const interval = setInterval(checkBackendStatus, 15000);
    return () => clearInterval(interval);
  }, [checkBackendStatus]);

  // Handlers
  const handleAddShift = async (
    newShift: Omit<Shift, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.createShift(newShift);
        await refreshShifts();
        setApiError(null);
        showSuccess(`Shift "${newShift.name}" (${newShift.code}) saved to PostgreSQL.`);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create shift';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleUpdateShift = async (
    id: number,
    updatedFields: Partial<Shift>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.updateShift(id, updatedFields);
        await refreshShifts();
        setApiError(null);
        showSuccess('Shift updated in PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update shift';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleDeleteShift = async (id: number): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.deleteShift(id);
        await refreshShifts();
        setApiError(null);
        showSuccess('Shift removed from PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete shift';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleAddHoliday = async (
    newHoliday: Omit<Holiday, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.createHoliday(newHoliday);
        await refreshHolidays();
        setApiError(null);
        showSuccess(`Holiday "${newHoliday.name}" saved to PostgreSQL.`);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create holiday';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleUpdateHoliday = async (
    id: number,
    updatedFields: Partial<Holiday>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.updateHoliday(id, updatedFields);
        await refreshHolidays();
        setApiError(null);
        showSuccess('Holiday updated in PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update holiday';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleDeleteHoliday = async (id: number): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.deleteHoliday(id);
        await refreshHolidays();
        setApiError(null);
        showSuccess('Holiday removed from PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete holiday';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleAddLeaveType = async (
    newLt: Omit<LeaveType, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.createLeaveType(newLt);
        await refreshLeaveTypes();
        setApiError(null);
        showSuccess(`Leave type "${newLt.name}" saved to PostgreSQL.`);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create leave type';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleUpdateLeaveType = async (
    id: number,
    updatedFields: Partial<LeaveType>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.updateLeaveType(id, updatedFields);
        await refreshLeaveTypes();
        setApiError(null);
        showSuccess('Leave type updated in PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update leave type';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleDeleteLeaveType = async (id: number): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.deleteLeaveType(id);
        await refreshLeaveTypes();
        setApiError(null);
        showSuccess('Leave type removed from PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete leave type';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleAddLeaveQuota = async (
    newQuota: Omit<LeaveQuota, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.createLeaveQuota(newQuota);
        await refreshLeaveQuotas();
        setApiError(null);
        showSuccess('Leave quota saved to PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create quota';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleUpdateLeaveQuota = async (
    id: number,
    updatedFields: Partial<LeaveQuota>
  ): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.updateLeaveQuota(id, updatedFields);
        await refreshLeaveQuotas();
        setApiError(null);
        showSuccess('Leave quota updated in PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to update quota';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  const handleDeleteLeaveQuota = async (id: number): Promise<boolean> => {
    if (isBackendConnected) {
      try {
        await api.deleteLeaveQuota(id);
        await refreshLeaveQuotas();
        setApiError(null);
        showSuccess('Leave quota removed from PostgreSQL.');
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to delete quota';
        setApiError(msg);
        throw new Error(msg);
      }
    }
    return false;
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="w-full">
      {/* Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#10B981] text-white shadow-xl shadow-[#10B981]/20 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            className="ml-2 hover:opacity-80 p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-[#5B6787] dark:text-[#8D97B0]">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-4 h-4 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin" />
            <span>Synchronizing PostgreSQL tables...</span>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'weekly-roster' && (
            <WeeklyRosterPage
              shifts={shifts}
              searchQuery={searchQuery}
              showSuccessToast={showSuccess}
            />
          )}

          {activeTab === 'daily-attendance' && (
            <DailyAttendancePage
              showSuccessToast={showSuccess}
              onNavigateToEmployees={() => setActiveTab('weekly-roster')}
            />
          )}

          {activeTab === 'login-logout' && (
            <LoginLogoutPage showSuccessToast={showSuccess} />
          )}

          {activeTab === 'shifts' && (
            <ShiftsPage
              shifts={shifts}
              onAddShift={handleAddShift}
              onUpdateShift={handleUpdateShift}
              onDeleteShift={handleDeleteShift}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'holidays' && (
            <HolidaysPage
              holidays={holidays}
              onAddHoliday={handleAddHoliday}
              onUpdateHoliday={handleUpdateHoliday}
              onDeleteHoliday={handleDeleteHoliday}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'leave-types' && (
            <LeaveTypesPage
              leaveTypes={leaveTypes}
              onAddLeaveType={handleAddLeaveType}
              onUpdateLeaveType={handleUpdateLeaveType}
              onDeleteLeaveType={handleDeleteLeaveType}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'leave-quotas' && (
            <LeaveQuotasPage
              leaveQuotas={leaveQuotas}
              leaveTypes={leaveTypes}
              onAddQuota={handleAddLeaveQuota}
              onUpdateQuota={handleUpdateLeaveQuota}
              onDeleteQuota={handleDeleteLeaveQuota}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'leave-calculator' && (
            <LeaveCalculatorPage />
          )}

          {activeTab === 'leave-requests' && (
            <LeaveRequestsPage
              showSuccessToast={showSuccess}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'work-from-home' && (
            <WorkFromHomePage
              showSuccessToast={showSuccess}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'comp-off' && (
            <CompOffTrackerPage
              showSuccessToast={showSuccess}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'shift-swaps' && (
            <ShiftSwapPage
              showSuccessToast={showSuccess}
              searchQuery={searchQuery}
            />
          )}
        </>
      )}
    </div>
  );
}

export default TimeModulePage;

