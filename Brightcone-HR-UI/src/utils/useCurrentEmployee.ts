import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Employee } from '../types';

export interface UseCurrentEmployeeResult {
  currentEmployee: Employee | null;
  currentEmployeeId: number;
  isLoggedIn: boolean;
  userEmail: string;
  userName: string;
  userRole: string;
}

/**
 * Hook to dynamically resolve and reflect the currently authenticated employee
 * across Attendance, Leaves, WFH, Comp-Off, Roster, and Swaps.
 *
 * When a user logs in or logs out, this hook immediately re-evaluates the active
 * employee record matching their profile email, name, or ID.
 */
export function useCurrentEmployee(employees: Employee[] = []): UseCurrentEmployeeResult {
  const { user, isAuthenticated } = useAuth();

  const currentEmployee = useMemo<Employee | null>(() => {
    if (user) {
      const userEmail = (user.email || '').trim().toLowerCase();
      const userName = (user.name || '').trim().toLowerCase();
      const userId = Number(user.id);

      if (employees.length > 0) {
        // 1. Match by email
        if (userEmail) {
          const found = employees.find(
            (e) => e.email && e.email.trim().toLowerCase() === userEmail
          );
          if (found) return found;
        }

        // 2. Match by exact or partial name
        if (userName) {
          const found = employees.find(
            (e) => e.name && e.name.trim().toLowerCase() === userName
          );
          if (found) return found;
        }

        // 3. Match by numeric ID
        if (!isNaN(userId) && userId > 0) {
          const found = employees.find((e) => e.id === userId);
          if (found) return found;
        }
      }

      // Synthesize an employee object from logged-in user if not directly in the list
      return {
        id: !isNaN(userId) && userId > 0 ? userId : 1,
        pid: String(user.id || 'EMP-1'),
        name: user.name || 'Active Employee',
        email: user.email || '',
        role: user.role || 'Employee',
        department: 'Operations',
        avatar_color: '#3B82F6',
        is_active: true,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Default to first employee when not logged in
    return employees.length > 0 ? employees[0] : null;
  }, [user, employees]);

  const currentEmployeeId = currentEmployee?.id || 1;

  return {
    currentEmployee,
    currentEmployeeId,
    isLoggedIn: isAuthenticated && !!user,
    userEmail: user?.email || currentEmployee?.email || '',
    userName: user?.name || currentEmployee?.name || 'Guest User',
    userRole: user?.role || currentEmployee?.role || 'Employee',
  };
}
