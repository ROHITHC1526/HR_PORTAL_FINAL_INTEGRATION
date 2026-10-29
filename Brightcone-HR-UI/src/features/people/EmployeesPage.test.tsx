import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '@/api/client'
import { AuthProvider } from '@/auth/AuthContext'
import { employee, jsonResponse, mockApi, sessionFor } from '@/test/fake-api'
import { EmployeesPage } from './EmployeesPage'

const hrAdmin = { ...employee, role: 'hr_admin', permissions: ['users:manage:all'] }
const person = {
  id: 'employee-1',
  employee_number: 'BC-001',
  first_name: 'Asha',
  last_name: 'Rao',
  work_email: 'asha@brightcone.ai',
  phone: null,
  department_id: 'dept-1',
  grade_id: null,
  location_id: null,
  manager_id: null,
  employment_type: 'full_time',
  status: 'active',
  start_date: '2026-09-01',
  end_date: null,
}

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <AuthProvider>
          <EmployeesPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => clearAccessToken())
afterEach(() => vi.restoreAllMocks())

describe('EmployeesPage', () => {
  it('loads employee records from the People API and opens the live profile', async () => {
    mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(hrAdmin)),
      'GET /people/employees': () => jsonResponse([person]),
      'GET /people/departments': () =>
        jsonResponse([{ id: 'dept-1', code: 'ENG', label: 'Engineering', parent_id: null }]),
      'GET /people/grades': () => jsonResponse([]),
      'GET /people/locations': () => jsonResponse([]),
    })
    renderPage()

    const name = await screen.findByText('Asha Rao')
    expect(screen.getByText('asha@brightcone.ai')).toBeInTheDocument()
    expect(await screen.findAllByText('Engineering')).not.toHaveLength(0)
    fireEvent.click(name.closest('tr') as HTMLElement)
    expect(await screen.findByRole('heading', { name: 'Asha Rao' })).toBeInTheDocument()
  })

  it('does not request employee data for users without People permission', async () => {
    const fake = mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee)) })
    renderPage()
    expect(
      await screen.findByText(/does not include access to employee records/),
    ).toBeInTheDocument()
    expect(fake.count('GET /people/employees')).toBe(0)
  })

  it('opens the edit screen and archives the live employee record', async () => {
    const fake = mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(hrAdmin)),
      'GET /people/employees': () => jsonResponse([person]),
      'GET /people/departments': () => jsonResponse([]),
      'GET /people/grades': () => jsonResponse([]),
      'GET /people/locations': () => jsonResponse([]),
      'POST /people/employees/employee-1/archive': () => jsonResponse(null, 204),
    })
    renderPage()
    fireEvent.click((await screen.findByText('Asha Rao')).closest('tr') as HTMLElement)
    fireEvent.click(await screen.findByRole('button', { name: 'Archive' }))
    await waitFor(() => expect(fake.count('POST /people/employees/employee-1/archive')).toBe(1))
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('heading', { name: 'Edit employee' })).toBeInTheDocument()
  })
})
