import { useEmployeeLifecycle, type Employee, type ReferenceItem } from './api'

export function EmployeeProfile({
  employee,
  employees,
  departments,
  grades,
  locations,
  onClose,
  onEdit,
}: {
  employee: Employee
  employees: Employee[]
  departments: ReferenceItem[]
  grades: ReferenceItem[]
  locations: ReferenceItem[]
  onClose: () => void
  onEdit: () => void
}) {
  const lifecycle = useEmployeeLifecycle('archive')
  const manager = employees.find((item) => item.id === employee.manager_id)
  const references = [
    ['Department', departments.find((item) => item.id === employee.department_id)?.label],
    ['Grade', grades.find((item) => item.id === employee.grade_id)?.label],
    ['Location', locations.find((item) => item.id === employee.location_id)?.label],
    ['Manager', manager ? `${manager.first_name} ${manager.last_name}` : undefined],
    ['Employment type', employee.employment_type.replace('_', ' ')],
    ['Status', employee.status.replace('_', ' ')],
    ['Start date', employee.start_date],
    ['End date', employee.end_date || undefined],
    ['Phone', employee.phone || undefined],
  ]

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="employee-profile-title"
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"
      >
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              Employee profile
            </p>
            <h2 id="employee-profile-title" className="mt-1 text-xl font-semibold text-white">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {employee.employee_number} · {employee.work_email}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </header>
        <dl className="grid gap-3 sm:grid-cols-2">
          {references.map(([title, value]) => (
            <div key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <dt className="text-xs text-slate-400">{title}</dt>
              <dd className="mt-1 text-sm capitalize text-slate-100">{value || 'Unassigned'}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-amber-900/70 bg-amber-950/30 p-3 text-xs text-amber-200">
          <span>
            Profile data access is restricted to HR administrators. Lifecycle actions are audited.
          </span>
          <button
            onClick={() => lifecycle.mutate(employee.id)}
            disabled={lifecycle.isPending}
            className="rounded-lg border border-amber-700 px-3 py-2 font-semibold disabled:opacity-50"
          >
            {lifecycle.isPending ? 'Saving…' : 'Archive'}
          </button>
        </div>
      </section>
    </div>
  )
}
