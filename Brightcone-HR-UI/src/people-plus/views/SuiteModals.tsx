import React, { useState } from 'react'
import { usePeoplePlus } from '../people-plus-context'
import { useCreateEmployee, useReferences, useEmployees } from '@/features/people/api'
import type { EmployeeInput } from '@/features/people/api'
import { useAuth } from '@/auth/useAuth'

export const SuiteModals: React.FC = () => {
  const { modal, closeModal, toast } = usePeoplePlus()
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')

  const departments = useReferences('departments', allowed)
  const locations = useReferences('locations', allowed)
  const employees = useEmployees(allowed)
  const createEmployee = useCreateEmployee()

  const deptList = departments.data ?? []
  const locList = locations.data ?? []
  const empList = employees.data ?? []

  const [leaveType, setLeaveType] = useState('Earned leave')
  const [leaveFrom, setLeaveFrom] = useState(new Date().toISOString().slice(0, 10))
  const [leaveTo, setLeaveTo] = useState(new Date().toISOString().slice(0, 10))
  const [leaveDays, setLeaveDays] = useState(1)
  const [leaveReason, setLeaveReason] = useState('')

  const [expCat, setExpCat] = useState('Internet')
  const [expAmt, setExpAmt] = useState(1500)
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10))
  const [expDesc, setExpDesc] = useState('')

  const [ticketSub, setTicketSub] = useState('')
  const [ticketCat, setTicketCat] = useState('Payroll & tax')
  const [ticketPri, setTicketPri] = useState<'Normal' | 'High'>('Normal')

  const [empFirst, setEmpFirst] = useState('')
  const [empLast, setEmpLast] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empNumber, setEmpNumber] = useState('')
  const [empDept, setEmpDept] = useState('')
  const [empLoc, setEmpLoc] = useState('')
  const [empType, setEmpType] = useState('full_time')

  if (!modal) return null

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast('Leave API is not yet available. Your request was not submitted.')
    closeModal()
  }

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast('Expense API is not yet available. Your claim was not submitted.')
    closeModal()
  }

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast('Helpdesk API is not yet available. Your ticket was not created.')
    closeModal()
  }

  const handleAddEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input: EmployeeInput = {
      first_name: empFirst,
      last_name: empLast,
      work_email: empEmail,
      employee_number: empNumber || `BC-${Date.now().toString(36).toUpperCase()}`,
      employment_type: empType,
      status: 'probation',
      start_date: new Date().toISOString().slice(0, 10),
      department_id: empDept || null,
      location_id: empLoc || null,
    }
    try {
      await createEmployee.mutateAsync(input)
      toast(`Employee ${empFirst} ${empLast} added successfully.`)
      closeModal()
    } catch (err) {
      toast(`Failed to add employee: ${(err as Error).message}`)
    }
  }

  return (
    <>
      <div className="scrim on" onClick={closeModal} />
      <div className="modal on">
        {modal.type === 'applyLeave' && (
          <form onSubmit={handleLeaveSubmit}>
            <h2>Apply for Leave</h2>
            <p className="sub">Submit your time off request for manager approval.</p>

            <div className="field">
              <span>Leave Type</span>
              <select className="input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                <option value="Earned leave">Earned leave</option>
                <option value="Casual leave">Casual leave</option>
                <option value="Sick leave">Sick leave</option>
                <option value="Comp off">Compensatory off</option>
              </select>
            </div>

            <div className="frow">
              <div className="field">
                <span>Start Date</span>
                <input className="input" type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} required />
              </div>
              <div className="field">
                <span>End Date</span>
                <input className="input" type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <span>Number of Days</span>
              <input className="input" type="number" min="0.5" step="0.5" value={leaveDays} onChange={(e) => setLeaveDays(Number(e.target.value))} required />
            </div>

            <div className="field">
              <span>Reason</span>
              <textarea className="input" rows={2} placeholder="Brief reason for time off..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required />
            </div>

            <div className="mfoot">
              <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn primary">Submit Leave Application</button>
            </div>
          </form>
        )}

        {modal.type === 'claimExpense' && (
          <form onSubmit={handleExpenseSubmit}>
            <h2>Claim Expense Reimbursement</h2>
            <p className="sub">Submit business expenses with invoice details.</p>

            <div className="field">
              <span>Category</span>
              <select className="input" value={expCat} onChange={(e) => setExpCat(e.target.value)}>
                <option value="Travel">Travel & Lodging</option>
                <option value="Meals">Team Meals & Entertainment</option>
                <option value="Internet">Home Broadband / Mobile</option>
                <option value="Equipment">Peripherals & Hardware</option>
                <option value="Books">Books & Learning Materials</option>
              </select>
            </div>

            <div className="frow">
              <div className="field">
                <span>Amount (INR)</span>
                <input className="input" type="number" min="1" value={expAmt} onChange={(e) => setExpAmt(Number(e.target.value))} required />
              </div>
              <div className="field">
                <span>Expense Date</span>
                <input className="input" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <span>Description & Business Purpose</span>
              <textarea className="input" rows={2} placeholder="Purpose of this expense..." value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required />
            </div>

            <div className="mfoot">
              <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn primary">Submit Claim</button>
            </div>
          </form>
        )}

        {modal.type === 'raiseTicket' && (
          <form onSubmit={handleTicketSubmit}>
            <h2>Raise HR Helpdesk Ticket</h2>
            <p className="sub">Request assistance with payroll, letters, insurance, or workplace services.</p>

            <div className="field">
              <span>Subject</span>
              <input className="input" placeholder="e.g. Need address verification letter" value={ticketSub} onChange={(e) => setTicketSub(e.target.value)} required />
            </div>

            <div className="frow">
              <div className="field">
                <span>Category</span>
                <select className="input" value={ticketCat} onChange={(e) => setTicketCat(e.target.value)}>
                  <option value="Payroll & tax">Payroll & Tax</option>
                  <option value="Letters & documents">Letters & Documents</option>
                  <option value="Benefits & insurance">Benefits & Insurance</option>
                  <option value="IT & Assets">IT & Workplace Assets</option>
                </select>
              </div>
              <div className="field">
                <span>Priority</span>
                <select className="input" value={ticketPri} onChange={(e) => setTicketPri(e.target.value as 'Normal' | 'High')}>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="mfoot">
              <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn primary">Create Ticket</button>
            </div>
          </form>
        )}

        {modal.type === 'addEmp' && (
          <form onSubmit={handleAddEmpSubmit}>
            <h2>Add New Employee</h2>
            <p className="sub">Create a new employee profile via the People API.</p>

            <div className="frow">
              <div className="field">
                <span>First Name</span>
                <input className="input" placeholder="e.g. Sravan" value={empFirst} onChange={(e) => setEmpFirst(e.target.value)} required />
              </div>
              <div className="field">
                <span>Last Name</span>
                <input className="input" placeholder="e.g. Kumar" value={empLast} onChange={(e) => setEmpLast(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <span>Work Email</span>
              <input className="input" type="email" placeholder="e.g. sravan.kumar@brightcone.ai" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} required />
            </div>

            <div className="frow">
              <div className="field">
                <span>Department</span>
                <select className="input" value={empDept} onChange={(e) => setEmpDept(e.target.value)}>
                  <option value="">Select department</option>
                  {deptList.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
              <div className="field">
                <span>Location</span>
                <select className="input" value={empLoc} onChange={(e) => setEmpLoc(e.target.value)}>
                  <option value="">Select location</option>
                  {locList.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <span>Employment Type</span>
              <select className="input" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="mfoot">
              <button type="button" className="btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="btn primary" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? 'Adding…' : 'Add Employee'}
              </button>
            </div>
          </form>
        )}

        {modal.type === 'requestSwap' && (
          <div>
            <h2>Request Shift Swap</h2>
            <p className="sub">Select a teammate to swap shifts for coverage.</p>
            <div className="field">
              <span>Date</span>
              <input className="input" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div className="field">
              <span>Teammate to Swap With</span>
              <select className="input">
                {empList.map((e) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                ))}
                {empList.length === 0 && <option disabled>No employees loaded</option>}
              </select>
            </div>
            <div className="mfoot">
              <button className="btn" onClick={closeModal}>Cancel</button>
              <button className="btn primary" onClick={() => { closeModal(); toast('Shift swap API is not yet available.') }}>Send Request</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
