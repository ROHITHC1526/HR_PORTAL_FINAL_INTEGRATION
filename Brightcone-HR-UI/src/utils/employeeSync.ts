import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SyncedEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  grade?: string;
  location?: string;
  manager?: string;
  status: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  annualCtc?: number;
}

export const INITIAL_SYNCED_EMPLOYEES: SyncedEmployee[] = [
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
    dateOfBirth: '1985-04-15',
    joiningDate: '2023-01-01',
    annualCtc: 3600000,
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
    dateOfBirth: '1992-10-25',
    joiningDate: '2023-06-15',
    annualCtc: 1800000,
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
    dateOfBirth: '1988-11-10',
    joiningDate: '2023-03-01',
    annualCtc: 3200000,
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
    dateOfBirth: '1990-11-18',
    joiningDate: '2023-05-10',
    annualCtc: 2600000,
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
    dateOfBirth: '1996-10-07',
    joiningDate: '2024-02-01',
    annualCtc: 1500000,
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
    dateOfBirth: '1993-10-02',
    joiningDate: '2023-10-02',
    annualCtc: 1900000,
  },
  {
    id: 'BC-1057',
    name: 'Siddharth Verma',
    role: 'Staff Rust Engineer',
    department: 'Engineering',
    grade: 'L4',
    location: 'Hyderabad',
    manager: 'Ananya Rao',
    status: 'Active',
    email: 'siddharth.verma.emp@brightcone.ai',
    dateOfBirth: '1994-12-05',
    joiningDate: '2024-01-15',
    annualCtc: 2100000,
  },
  {
    id: 'BC-1058',
    name: 'rohith rock',
    role: 'DSA',
    department: 'Engineering',
    grade: 'L5',
    location: 'Hyderabad',
    manager: 'somesh',
    status: 'Active',
    email: 'r@gmail.com',
    dateOfBirth: '1997-11-04',
    joiningDate: '2024-06-01',
    annualCtc: 1600000,
  },
];

const STORAGE_KEY = 'brightcone_synced_employees';

export function getCachedEmployees(): SyncedEmployee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_SYNCED_EMPLOYEES;
}

export function saveCachedEmployees(employees: SyncedEmployee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    window.dispatchEvent(new Event('employee-data-updated'));
  } catch {}
}

export async function fetchLiveEmployees(): Promise<SyncedEmployee[]> {
  try {
    const res = await axios.get<SyncedEmployee[]>('/api/employees');
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      const cached = getCachedEmployees();
      const mergedMap = new Map<string, SyncedEmployee>();
      
      // Seed with cached data
      for (const e of cached) {
        mergedMap.set(e.id, e);
      }
      // Merge with API data
      for (const e of res.data) {
        const existing = mergedMap.get(e.id);
        mergedMap.set(e.id, { ...existing, ...e });
      }
      
      const mergedList = Array.from(mergedMap.values());
      saveCachedEmployees(mergedList);
      return mergedList;
    }
  } catch {}

  return getCachedEmployees();
}

export function useLiveEmployees() {
  const [employees, setEmployees] = useState<SyncedEmployee[]>(getCachedEmployees);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    const data = await fetchLiveEmployees();
    setEmployees(data);
    setIsLoading(false);
  };

  useEffect(() => {
    refresh();

    const handler = () => {
      setEmployees(getCachedEmployees());
    };

    window.addEventListener('employee-data-updated', handler);
    return () => window.removeEventListener('employee-data-updated', handler);
  }, []);

  return { employees, isLoading, refresh };
}

// Celebration / Birthday / Anniversary calculation
export interface CelebrationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  occasion: 'Birthday' | 'Work anniversary';
  date: string;
  when: string;
  daysUntil: number;
  milestone: string;
  avatarInitials: string;
}

export function computeUpcomingCelebrations(employees: SyncedEmployee[], windowDays = 60): CelebrationItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayStart = new Date(currentYear, now.getMonth(), now.getDate()).getTime();

  const results: CelebrationItem[] = [];

  for (const emp of employees) {
    const initials = emp.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    // 1. Birthday
    if (emp.dateOfBirth) {
      const [bYear, bMonth, bDay] = emp.dateOfBirth.split('-').map(Number);
      if (bMonth && bDay) {
        let bDate = new Date(currentYear, bMonth - 1, bDay);
        if (bDate.getTime() < todayStart) {
          bDate = new Date(currentYear + 1, bMonth - 1, bDay);
        }
        const diffDays = Math.round((bDate.getTime() - todayStart) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= windowDays) {
          const age = bDate.getFullYear() - bYear;
          const whenStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
          results.push({
            id: `BD-${emp.id}`,
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            occasion: 'Birthday',
            date: bDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            when: whenStr,
            daysUntil: diffDays,
            milestone: `${age}th Birthday`,
            avatarInitials: initials,
          });
        }
      }
    }

    // 2. Work Anniversary
    if (emp.joiningDate) {
      const [jYear, jMonth, jDay] = emp.joiningDate.split('-').map(Number);
      if (jMonth && jDay) {
        let aDate = new Date(currentYear, jMonth - 1, jDay);
        if (aDate.getTime() < todayStart) {
          aDate = new Date(currentYear + 1, jMonth - 1, jDay);
        }
        const diffDays = Math.round((aDate.getTime() - todayStart) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= windowDays) {
          const years = aDate.getFullYear() - jYear;
          if (years > 0) {
            const whenStr = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
            const suffix = years === 1 ? 'st' : years === 2 ? 'nd' : years === 3 ? 'rd' : 'th';
            results.push({
              id: `WA-${emp.id}`,
              employeeId: emp.id,
              employeeName: emp.name,
              department: emp.department,
              occasion: 'Work anniversary',
              date: aDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
              when: whenStr,
              daysUntil: diffDays,
              milestone: `${years}${suffix} Anniversary`,
              avatarInitials: initials,
            });
          }
        }
      }
    }
  }

  // Sort by daysUntil ascending
  results.sort((a, b) => a.daysUntil - b.daysUntil);
  return results;
}
