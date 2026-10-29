import { useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/useAuth'
import { ModuleHeader } from '@/components/ModuleHeader'
import { SectionCard } from '@/components/SectionCard'
import { EmployeeForm } from './EmployeeForm'
import { EmployeeProfile } from './EmployeeProfile'
import { OrganizationSetup } from './OrganizationSetup'
import { useEmployees, useReferences, type Employee } from './api'

const cell = 'px-4 py-3 text-left text-sm'

export function EmployeesPage() {
  const { can } = useAuth()
  const allowed = can('people:manage') || can('users:manage')
  const employees = useEmployees(allowed)
  const departments = useReferences('departments', allowed)
  const grades = useReferences('grades', allowed)
  const locations = useReferences('locations', allowed)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [editing, setEditing] = useState<Employee | null>(null)
  const departmentNames = useMemo(
    () => new Map((departments.data ?? []).map((d) => [d.id, d.label])),
    [departments.data],
  )
  const rows = (employees.data ?? []).filter((person) =>
    `${person.first_name} ${person.last_name} ${person.employee_number} ${person.work_email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  return (
    <main className="mx-auto grid max-w-7xl gap-6 py-6 text-slate-100">
      <ModuleHeader title="Employees" subtitle="Employee records and organization assignments" />
      {!allowed ? (
        <Panel title="Access restricted">
          Your role does not include access to employee records.
        </Panel>
      ) : (
        <>
          <OrganizationSetup />
          <Panel title="Employee directory">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees"
                aria-label="Search employees"
                className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              />
              <button
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
              >
                Add employee
              </button>
            </div>
            {employees.isLoading ? (
              <p className="py-10 text-center text-sm text-slate-400">
                Loading live employee records…
              </p>
            ) : null}
            {employees.isError ? (
              <p role="alert" className="rounded-lg bg-rose-950/50 p-4 text-sm text-rose-200">
                Could not load employees: {employees.error.message}
              </p>
            ) : null}
            {!employees.isLoading && !employees.isError && rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                No employee records found. Add a record or clear the search.
              </p>
            ) : null}
            {rows.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      {['Employee', 'Number', 'Department', 'Type', 'Status', 'Start date'].map(
                        (head) => (
                          <th className={cell} key={head}>
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rows.map((person) => (
                      <tr
                        key={person.id}
                        className="cursor-pointer hover:bg-slate-900/70"
                        onClick={() => setSelected(person)}
                      >
                        <td className={cell}>
                          <strong>
                            {person.first_name} {person.last_name}
                          </strong>
                          <span className="block text-xs text-slate-400">{person.work_email}</span>
                        </td>
                        <td className={cell}>{person.employee_number}</td>
                        <td className={cell}>
                          {person.department_id
                            ? (departmentNames.get(person.department_id) ?? 'Unassigned')
                            : 'Unassigned'}
                        </td>
                        <td className={`${cell} capitalize`}>
                          {person.employment_type.replace('_', ' ')}
                        </td>
                        <td className={`${cell} capitalize`}>{person.status.replace('_', ' ')}</td>
                        <td className={cell}>{person.start_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </>
      )}
      {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}
      {editing && <EmployeeForm employee={editing} onClose={() => setEditing(null)} />}
      {selected && (
        <EmployeeProfile
          employee={selected}
          employees={employees.data ?? []}
          departments={departments.data ?? []}
          grades={grades.data ?? []}
          locations={locations.data ?? []}
          onEdit={() => setEditing(selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionCard title={title} subtitle="Connected to People API">
      <div className="min-h-24">{children}</div>
    </SectionCard>
  )
}
