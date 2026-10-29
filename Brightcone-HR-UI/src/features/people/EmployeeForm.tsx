import { useState, type FormEvent } from 'react'
import {
  useCreateEmployee,
  useEmployees,
  useReferences,
  useUpdateEmployee,
  type Employee,
  type EmployeeInput,
} from './api'

const fields =
  'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500'
const label = 'grid gap-1.5 text-xs font-medium text-slate-300'

export function EmployeeForm({ onClose, employee }: { onClose: () => void; employee?: Employee }) {
  const create = useCreateEmployee()
  const update = useUpdateEmployee()
  const departments = useReferences('departments', true)
  const grades = useReferences('grades', true)
  const locations = useReferences('locations', true)
  const employees = useEmployees(true)
  const [message, setMessage] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const input: EmployeeInput = {
      employee_number: String(form.get('employee_number') ?? '').trim(),
      first_name: String(form.get('first_name') ?? '').trim(),
      last_name: String(form.get('last_name') ?? '').trim(),
      work_email: String(form.get('work_email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim() || null,
      department_id: String(form.get('department_id') ?? '') || null,
      grade_id: String(form.get('grade_id') ?? '') || null,
      location_id: String(form.get('location_id') ?? '') || null,
      manager_id: String(form.get('manager_id') ?? '') || null,
      employment_type: String(form.get('employment_type') ?? 'full_time'),
      status: String(form.get('status') ?? 'draft'),
      start_date: String(form.get('start_date') ?? ''),
      end_date: String(form.get('end_date') ?? '') || null,
    }
    try {
      if (employee)
        await update.mutateAsync({
          id: employee.id,
          payload: { input, reason_code: 'hr_profile_update' },
        })
      else await create.mutateAsync(input)
      onClose()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Employee could not be saved.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/80 p-4"
      role="presentation"
    >
      <form
        onSubmit={submit}
        className="grid w-full max-w-2xl gap-5 rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {employee ? 'Edit employee' : 'Add employee'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Personal fields are encrypted before storage.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Close
          </button>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Employee number
            <input
              required
              maxLength={64}
              name="employee_number"
              defaultValue={employee?.employee_number}
              className={fields}
            />
          </label>
          <label className={label}>
            Work email
            <input
              required
              type="email"
              maxLength={254}
              name="work_email"
              defaultValue={employee?.work_email}
              className={fields}
            />
          </label>
          <label className={label}>
            First name
            <input
              required
              maxLength={100}
              name="first_name"
              defaultValue={employee?.first_name}
              className={fields}
            />
          </label>
          <label className={label}>
            Last name
            <input
              required
              maxLength={100}
              name="last_name"
              defaultValue={employee?.last_name}
              className={fields}
            />
          </label>
          <label className={label}>
            Phone
            <input
              type="tel"
              name="phone"
              defaultValue={employee?.phone ?? ''}
              className={fields}
            />
          </label>
          <label className={label}>
            Start date
            <input
              required
              type="date"
              name="start_date"
              defaultValue={employee?.start_date}
              className={fields}
            />
          </label>
          <label className={label}>
            End date
            <input
              type="date"
              name="end_date"
              defaultValue={employee?.end_date ?? ''}
              className={fields}
            />
          </label>
          <SelectField
            name="department_id"
            title="Department"
            value={employee?.department_id}
            items={departments.data ?? []}
          />
          <SelectField
            name="grade_id"
            title="Grade"
            value={employee?.grade_id}
            items={grades.data ?? []}
          />
          <SelectField
            name="location_id"
            title="Location"
            value={employee?.location_id}
            items={locations.data ?? []}
          />
          <SelectField
            name="manager_id"
            title="Manager"
            value={employee?.manager_id}
            items={(employees.data ?? [])
              .filter((person) => person.status === 'active' && person.id !== employee?.id)
              .map((person) => ({
                id: person.id,
                label: `${person.first_name} ${person.last_name}`,
              }))}
          />
          <label className={label}>
            Employment type
            <select
              name="employment_type"
              defaultValue={employee?.employment_type ?? 'full_time'}
              className={fields}
            >
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </label>
          <label className={label}>
            Status
            <select name="status" defaultValue={employee?.status ?? 'draft'} className={fields}>
              <option value="draft">Draft</option>
              <option value="preboarding">Preboarding</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="probation">Probation</option>
              <option value="notice">Notice</option>
              <option value="exited">Exited</option>
            </select>
          </label>
        </div>
        {(message || create.isError) && (
          <p role="alert" className="text-sm text-rose-300">
            {message || create.error?.message || 'Employee could not be saved.'}
          </p>
        )}
        <footer className="flex justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300"
          >
            Cancel
          </button>
          <button
            disabled={create.isPending || update.isPending}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {create.isPending || update.isPending
              ? 'Saving…'
              : employee
                ? 'Save changes'
                : 'Create employee'}
          </button>
        </footer>
      </form>
    </div>
  )
}

function SelectField({
  name,
  title,
  value,
  items,
}: {
  name: string
  title: string
  value?: string | null
  items: { id: string; label: string }[]
}) {
  return (
    <label className={label}>
      {title}
      <select name={name} defaultValue={value ?? ''} className={fields}>
        <option value="">Unassigned</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
