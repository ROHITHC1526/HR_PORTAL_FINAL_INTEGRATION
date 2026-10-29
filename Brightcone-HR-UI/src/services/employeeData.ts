import { useState, useEffect } from 'react'
import axios from 'axios'
import type { EmployeeRef } from '../pages/payroll/payroll-data'

export interface UnifiedEmployee {
  id: string
  name: string
  email: string
  dept: string
  role: string
  location?: string
  status?: string
  manager?: string
  grade?: string
}

export const INITIAL_DEMO_EMPLOYEES: UnifiedEmployee[] = [
  { id: 'BC-1001', name: 'HR Admin', email: 'hr.admin@brightcone.ai', dept: 'People Ops', role: 'HR Admin', location: 'Hyderabad', status: 'Active', manager: 'Naresh Vemparala', grade: 'L6' },
  { id: 'BC-1002', name: 'Naresh Vemparala', email: 'naresh.vemparala@brightcone.ai', dept: 'Operations', role: 'VP Operations', location: 'Hyderabad', status: 'Active', manager: 'no manager', grade: 'L9' },
  { id: 'BC-1003', name: 'Karthik Reddy', email: 'karthik.reddy@brightcone.ai', dept: 'Engineering', role: 'Principal Architect', location: 'Hyderabad', status: 'Active', manager: 'Naresh Vemparala', grade: 'L8' },
  { id: 'BC-1004', name: 'Priya Menon', email: 'priya.menon@brightcone.ai', dept: 'Product', role: 'Head of Product', location: 'Bengaluru', status: 'Active', manager: 'Karthik Reddy', grade: 'L7' },
  { id: 'BC-1005', name: 'Meera Joshi', email: 'meera.joshi@brightcone.ai', dept: 'Finance', role: 'Finance Lead', location: 'Hyderabad', status: 'Active', manager: 'Naresh Vemparala', grade: 'L6' },
  { id: 'BC-1006', name: 'Rahul Varma', email: 'rahul.varma@brightcone.ai', dept: 'Engineering', role: 'Staff Engineer', location: 'Hyderabad', status: 'Active', manager: 'Priya Menon', grade: 'L4' },
  { id: 'BC-1007', name: 'Sneha Iyer', email: 'sneha.iyer@brightcone.ai', dept: 'Design', role: 'Product Designer', location: 'Hyderabad', status: 'On leave', manager: 'Priya Menon', grade: 'L5' },
  { id: 'BC-1008', name: 'Arjun Nair', email: 'arjun.nair@brightcone.ai', dept: 'Sales', role: 'Account Executive', location: 'Remote', status: 'Active', manager: 'Naresh Vemparala', grade: 'L5' },
  { id: 'BC-1012', name: 'Karthik Reddy', email: 'karthik.reddy@brightcone.ai', dept: 'AI Research', role: 'Principal AI Engineer', location: 'Hyderabad', status: 'Active', manager: 'Naresh Vemparala', grade: 'L8' },
  { id: 'BC-1023', name: 'Daniel Brooks', email: 'daniel.brooks@brightcone.ai', dept: 'Sales', role: 'Account Executive', location: 'San Francisco', status: 'Active', manager: 'Naresh Vemparala', grade: 'L6' },
]

const DYNAMIC_EMPLOYEES_KEY = 'brightcone_dynamic_employees'
const EMPLOYEES_UPDATED_EVENT = 'brightcone:employees-updated'

/**
 * Returns the merged list of all initial demo employees and locally/dynamically added employees.
 */
export function getUnifiedEmployees(): UnifiedEmployee[] {
  const mergedMap = new Map<string, UnifiedEmployee>()

  // 1. Seed with default demo employees
  INITIAL_DEMO_EMPLOYEES.forEach((emp) => {
    mergedMap.set(emp.id, { ...emp })
  })

  // 2. Read stored dynamic employees from localStorage
  try {
    const raw = localStorage.getItem(DYNAMIC_EMPLOYEES_KEY)
    if (raw) {
      const dynamicList = JSON.parse(raw) as UnifiedEmployee[]
      if (Array.isArray(dynamicList)) {
        dynamicList.forEach((emp) => {
          if (emp && emp.id) {
            mergedMap.set(emp.id, { ...mergedMap.get(emp.id), ...emp })
          }
        })
      }
    }
  } catch (err) {
    console.warn('Failed to parse dynamic employees from storage:', err)
  }

  return Array.from(mergedMap.values())
}

/**
 * Saves a new employee or updates an existing one, persisting to localStorage and firing a global event.
 */
export function saveUnifiedEmployee(emp: Partial<UnifiedEmployee>): UnifiedEmployee {
  const currentList = getUnifiedEmployees()
  
  // Auto-generate ID if missing
  let id = emp.id?.trim()
  if (!id) {
    let maxNum = 1008
    currentList.forEach((e) => {
      const match = e.id.match(/^BC-(\d+)$/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (!isNaN(num) && num > maxNum) maxNum = num
      }
    })
    id = `BC-${maxNum + 1}`
  }

  const newEmp: UnifiedEmployee = {
    id,
    name: emp.name?.trim() || 'New Employee',
    email: emp.email?.trim() || `${(emp.name || 'employee').toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
    dept: emp.dept?.trim() || 'Engineering',
    role: emp.role?.trim() || 'Software Engineer',
    location: emp.location?.trim() || 'Hyderabad',
    status: emp.status?.trim() || 'Active',
    manager: emp.manager?.trim() || 'Naresh Vemparala',
    grade: emp.grade?.trim() || 'L4',
  }

  // Update dynamic list in localStorage
  try {
    const raw = localStorage.getItem(DYNAMIC_EMPLOYEES_KEY)
    const stored = raw ? (JSON.parse(raw) as UnifiedEmployee[]) : []
    const existingIndex = stored.findIndex((e) => e.id === id)
    if (existingIndex >= 0) {
      stored[existingIndex] = { ...stored[existingIndex], ...newEmp }
    } else {
      stored.push(newEmp)
    }
    localStorage.setItem(DYNAMIC_EMPLOYEES_KEY, JSON.stringify(stored))
  } catch (err) {
    console.error('Failed to save employee to localStorage:', err)
  }

  // Dispatch custom window event for instant live-sync across all tabs and open modals
  try {
    window.dispatchEvent(new CustomEvent(EMPLOYEES_UPDATED_EVENT, { detail: newEmp }))
  } catch {
    // fallback
  }

  // Asynchronously mirror to backend API if live
  axios
    .post('/api/employees', {
      id: newEmp.id,
      name: newEmp.name,
      email: newEmp.email,
      department: newEmp.dept,
      role: newEmp.role,
      location: newEmp.location,
      status: newEmp.status,
      manager: newEmp.manager,
      grade: newEmp.grade,
    })
    .catch(() => {
      // Backend may be offline or in mock mode; local cache is guaranteed
    })

  return newEmp
}

/**
 * React hook that returns the reactive list of employees across the entire application.
 * Re-renders automatically whenever an employee is added or updated in ANY module.
 */
export function useUnifiedEmployees(): {
  employees: UnifiedEmployee[]
  saveEmployee: (emp: Partial<UnifiedEmployee>) => UnifiedEmployee
  refresh: () => void
} {
  const [employees, setEmployees] = useState<UnifiedEmployee[]>(() => getUnifiedEmployees())

  const refresh = () => {
    setEmployees(getUnifiedEmployees())
  }

  useEffect(() => {
    const handleUpdate = () => {
      setEmployees(getUnifiedEmployees())
    }

    window.addEventListener(EMPLOYEES_UPDATED_EVENT, handleUpdate)
    window.addEventListener('storage', handleUpdate)

    // Background fetch from backend to integrate any database seeded/stored records
    axios
      .get('/api/employees')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const raw = localStorage.getItem(DYNAMIC_EMPLOYEES_KEY)
          const stored = raw ? (JSON.parse(raw) as UnifiedEmployee[]) : []
          let updated = false

          res.data.forEach((apiEmp: any) => {
            const id = apiEmp.id || apiEmp.employee_id
            if (id && !stored.some((s) => s.id === id)) {
              stored.push({
                id,
                name: apiEmp.name || apiEmp.employee_name || 'Employee',
                email: apiEmp.email || `${id.toLowerCase()}@brightcone.ai`,
                dept: apiEmp.department || apiEmp.dept || 'Engineering',
                role: apiEmp.role || 'Member',
                location: apiEmp.location || 'Hyderabad',
                status: apiEmp.status || 'Active',
                manager: apiEmp.manager || 'Naresh Vemparala',
                grade: apiEmp.grade || 'L4',
              })
              updated = true
            }
          })

          if (updated) {
            localStorage.setItem(DYNAMIC_EMPLOYEES_KEY, JSON.stringify(stored))
            setEmployees(getUnifiedEmployees())
          }
        }
      })
      .catch(() => {
        // Backend offline or fallback
      })

    return () => {
      window.removeEventListener(EMPLOYEES_UPDATED_EVENT, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return {
    employees,
    saveEmployee: saveUnifiedEmployee,
    refresh,
  }
}
