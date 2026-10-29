import React, { useState, useEffect } from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { useEmployees, useReferences, type Employee } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'
import { Icon } from '../Icon'
import { avatarColor, initials } from '../helpers'
import { APPS } from '../data'

export const SuiteOverlays: React.FC = () => {
  const { drawer, closeDrawer, paletteOpen, setPaletteOpen, toastMsg, setActiveApp, setActiveView, openModal, logout } = usePeoplePlus()
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')

  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)

  const empList = employees.data ?? []
  const deptList = departments.data ?? []
  const locList = locations.data ?? []

  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      } else if (e.key === 'Escape') {
        setPaletteOpen(false)
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setPaletteOpen, closeDrawer])

  const actions = [
    { label: 'Apply for leave', hint: 'Leave & Attendance', run: () => openModal('applyLeave') },
    { label: 'Claim an expense', hint: 'Expense & Travel', run: () => openModal('claimExpense') },
    { label: 'Raise an HR request', hint: 'Helpdesk & Support', run: () => openModal('raiseTicket') },
    { label: 'Run payroll', hint: 'Payroll Administration', run: () => { setActiveApp('payroll'); setActiveView('payrollDash') } },
    { label: 'Add new employee', hint: 'People Operations', run: () => openModal('addEmp') },
    { label: 'View shift roster', hint: 'Shift & Schedule', run: () => { setActiveApp('shift'); setActiveView('shiftDash') } },
    { label: 'Sign out', hint: 'Session', run: logout },
  ]

  const appItems = APPS.map((a) => ({
    label: a.name,
    hint: `Open ${a.name} App`,
    run: () => { setActiveApp(a.key); setActiveView(`${a.key}Dash`) },
  }))

  const peopleItems = empList.map((e) => ({
    label: `${e.first_name} ${e.last_name}`,
    hint: `${e.employee_number} · ${e.work_email}`,
    run: () => { setActiveApp('people'); setActiveView('employees') },
  }))

  const allItems = [...actions, ...appItems, ...peopleItems]
  const filteredItems = allItems
    .filter((i) => !query || (i.label + i.hint).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10)

  const selectedEmp = drawer?.data?.emp as Employee | undefined

  const getDeptLabel = (id?: string | null) => {
    if (!id) return 'Unassigned'
    return deptList.find((d) => d.id === id)?.label ?? id
  }

  const getLocLabel = (id?: string | null) => {
    if (!id) return 'Unknown'
    return locList.find((l) => l.id === id)?.label ?? id
  }

  return (
    <>
      <div id="toast" className={`toast ${toastMsg ? 'on' : ''}`}>
        <Icon name="check" size={18} />
        <span>{toastMsg}</span>
      </div>

      <div className={`scrim ${drawer || paletteOpen ? 'on' : ''}`} onClick={() => { closeDrawer(); setPaletteOpen(false) }} />

      <div className={`palette ${paletteOpen ? 'on' : ''}`}>
        <input
          type="search"
          placeholder="Search apps, actions, or employees... (Esc to close)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={paletteOpen}
        />
        <ul id="plist">
          {filteredItems.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                setPaletteOpen(false)
                item.run()
              }}
            >
              <b>{item.label}</b>
              <span>{item.hint}</span>
            </li>
          ))}
          {filteredItems.length === 0 && (
            <div className="empty">No results found for "{query}".</div>
          )}
        </ul>
      </div>

      <div className={`drawer ${drawer?.type === 'empProfile' ? 'on' : ''}`}>
        {selectedEmp && (
          <div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
              <div className="av lg" style={{ background: avatarColor(`${selectedEmp.first_name} ${selectedEmp.last_name}`) }}>
                {initials(`${selectedEmp.first_name} ${selectedEmp.last_name}`)}
              </div>
              <div>
                <h2>{selectedEmp.first_name} {selectedEmp.last_name}</h2>
                <div className="muted">{selectedEmp.employee_number} · {selectedEmp.work_email}</div>
              </div>
            </div>

            <div style={{ margin: '14px 0' }}>
              <span className={`pill ${selectedEmp.status === 'active' ? 'p-ok' : 'p-warn'}`}>
                {selectedEmp.status}
              </span>
            </div>

            <div className="kv-grid">
              <div className="kv">
                <dt>Department</dt>
                <dd><b>{getDeptLabel(selectedEmp.department_id)}</b></dd>
                <dt>Location</dt>
                <dd>{getLocLabel(selectedEmp.location_id)}</dd>
                <dt>Employment type</dt>
                <dd style={{ textTransform: 'capitalize' }}>{selectedEmp.employment_type.replace('_', ' ')}</dd>
                <dt>Start date</dt>
                <dd>{selectedEmp.start_date}</dd>
                <dt>Work email</dt>
                <dd>{selectedEmp.work_email}</dd>
                {selectedEmp.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>{selectedEmp.phone}</dd>
                  </>
                )}
              </div>
            </div>

            <div className="mfoot" style={{ marginTop: '24px', justifyContent: 'flex-start' }}>
              <button className="btn primary" onClick={closeDrawer}>Close Profile</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
