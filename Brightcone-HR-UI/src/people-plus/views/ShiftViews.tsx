import React, { useState, useEffect, useCallback } from 'react';
import { usePeoplePlus } from '../people-plus-context';
import type { Shift, Holiday } from '../../types';
import {
  api,
  INITIAL_SHIFTS,
  INITIAL_HOLIDAYS,
} from '../../services/api';

// Shift & Attendance Subview Components matching Screenshots 2, 3, 4, 5
import { WeeklyRosterPage } from '../../pages/WeeklyRosterPage';
import { DailyAttendancePage } from '../../pages/DailyAttendancePage';
import { LoginLogoutPage } from '../../pages/LoginLogoutPage';
import { LeaveRequestsPage } from '../../pages/LeaveRequestsPage';
import { LeaveCalculatorPage } from '../../pages/LeaveCalculatorPage';
import { WorkFromHomePage } from '../../pages/WorkFromHomePage';
import { CompOffTrackerPage } from '../../pages/CompOffTrackerPage';
import { HolidaysPage } from '../../pages/HolidaysPage';
import { ShiftSwapPage } from '../../pages/time/ShiftSwapPage';
import { ShiftsPage } from '../../pages/ShiftsPage';

export const ShiftViews: React.FC = () => {
  const { activeView, setActiveView } = usePeoplePlus();

  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 4000);
  }, []);

  // Fetch initial shifts and holidays
  useEffect(() => {
    let isMounted = true;
    api.fetchShifts().then((res) => {
      if (isMounted && res.data && res.data.length > 0) {
        setShifts(res.data);
      }
    });
    api.fetchHolidays().then((res) => {
      if (isMounted && res.data && res.data.length > 0) {
        setHolidays(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for ShiftsPage
  const handleAddShift = async (
    shift: Omit<Shift, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    try {
      const res = await api.createShift(shift);
      setShifts((prev) => [res, ...prev]);
      showToast('Shift created successfully');
      return true;
    } catch {
      const fallback: Shift = {
        id: Date.now(),
        pid: `S-${Date.now()}`,
        name: shift.name,
        code: shift.code,
        start_time: shift.start_time,
        end_time: shift.end_time,
        break_duration_minutes: shift.break_duration_minutes,
        grace_period_minutes: shift.grace_period_minutes ?? 15,
        is_overnight: shift.is_overnight,
        is_active: shift.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setShifts((prev) => [fallback, ...prev]);
      showToast('Shift created');
      return true;
    }
  };

  const handleUpdateShift = async (id: number, shift: Partial<Shift>): Promise<boolean> => {
    try {
      const res = await api.updateShift(id, shift);
      setShifts((prev) => prev.map((s) => (s.id === id ? res : s)));
      showToast('Shift updated');
      return true;
    } catch {
      setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, ...shift } : s)));
      showToast('Shift updated');
      return true;
    }
  };

  const handleDeleteShift = async (id: number, name: string): Promise<boolean> => {
    try {
      await api.deleteShift(id);
      setShifts((prev) => prev.filter((s) => s.id !== id));
      showToast(`Shift "${name}" deleted`);
      return true;
    } catch {
      setShifts((prev) => prev.filter((s) => s.id !== id));
      showToast(`Shift "${name}" deleted`);
      return true;
    }
  };

  // Handlers for HolidaysPage
  const handleAddHoliday = async (
    holiday: Omit<Holiday, 'id' | 'pid' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    try {
      const res = await api.createHoliday(holiday);
      setHolidays((prev) => [res, ...prev]);
      showToast('Holiday created');
      return true;
    } catch {
      const fallback: Holiday = {
        id: Date.now(),
        pid: `H-${Date.now()}`,
        name: holiday.name,
        holiday_date: holiday.holiday_date || (holiday as any).date || new Date().toISOString().split('T')[0],
        applicable_location: holiday.applicable_location || (holiday as any).location || 'All',
        is_recurring: holiday.is_recurring,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setHolidays((prev) => [fallback, ...prev]);
      showToast('Holiday created');
      return true;
    }
  };

  const handleUpdateHoliday = async (id: number, holiday: Partial<Holiday>): Promise<boolean> => {
    try {
      const res = await api.updateHoliday(id, holiday);
      setHolidays((prev) => prev.map((h) => (h.id === id ? res : h)));
      showToast('Holiday updated');
      return true;
    } catch {
      setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, ...holiday } : h)));
      showToast('Holiday updated');
      return true;
    }
  };

  const handleDeleteHoliday = async (id: number, name: string): Promise<boolean> => {
    try {
      await api.deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      showToast(`Holiday "${name}" deleted`);
      return true;
    } catch {
      setHolidays((prev) => prev.filter((h) => h.id !== id));
      showToast(`Holiday "${name}" deleted`);
      return true;
    }
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#0B6FDB] text-white text-xs font-semibold shadow-xl shadow-[#0B6FDB]/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Subview router matching active sidebar selection */}
      {(() => {
        switch (activeView) {
          case 'dailyAttendance':
            return (
              <DailyAttendancePage
                showSuccessToast={showToast}
                onNavigateToEmployees={() => setActiveView('shiftRoster')}
              />
            );

          case 'loginLogout':
            return <LoginLogoutPage showSuccessToast={showToast} />;

          case 'leaveRequests':
            return (
              <LeaveRequestsPage
                showSuccessToast={showToast}
                searchQuery={searchQuery}
              />
            );

          case 'leaveBalance':
            return <LeaveCalculatorPage />;

          case 'wfh':
            return (
              <WorkFromHomePage
                showSuccessToast={showToast}
                searchQuery={searchQuery}
              />
            );

          case 'compOff':
            return (
              <CompOffTrackerPage
                showSuccessToast={showToast}
                searchQuery={searchQuery}
              />
            );

          case 'holidays':
            return (
              <HolidaysPage
                holidays={holidays}
                onAddHoliday={handleAddHoliday}
                onUpdateHoliday={handleUpdateHoliday}
                onDeleteHoliday={handleDeleteHoliday}
                searchQuery={searchQuery}
              />
            );

          case 'shiftSwaps':
            return (
              <ShiftSwapPage
                showSuccessToast={showToast}
                searchQuery={searchQuery}
              />
            );

          case 'attendanceAdmin':
            return (
              <ShiftsPage
                shifts={shifts}
                onAddShift={handleAddShift}
                onUpdateShift={handleUpdateShift}
                onDeleteShift={handleDeleteShift}
                searchQuery={searchQuery}
              />
            );

          case 'shiftRoster':
          default:
            return (
              <WeeklyRosterPage
                shifts={shifts}
                searchQuery={searchQuery}
                showSuccessToast={showToast}
              />
            );
        }
      })()}
    </div>
  );
};

export default ShiftViews;
