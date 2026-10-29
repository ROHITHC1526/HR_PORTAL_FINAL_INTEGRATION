import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken } from '@/api/client'
import { AuthProvider } from '@/auth/AuthContext'
import { employee, jsonResponse, mockApi, sessionFor } from '@/test/fake-api'
import { AccountsPage } from './AccountsPage'

const hrAdmin = {
  ...employee,
  name: 'Ananya Rao',
  email: 'ananya.rao@brightcone.ai',
  role: 'hr_admin',
  permissions: ['users:manage:all', 'audit:read:all'],
}

const account = (name: string, status: string, role = 'employee') => ({
  pid: `pid-${name}`,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@brightcone.ai`,
  role,
  status,
  failed_logins: 0,
  must_change_password: false,
  last_login_at: null,
  created_at: '2026-09-01T10:00:00Z',
})

const LIST = 'GET /admin/users?page=1&page_size=100'

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <AuthProvider>
          <AccountsPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => clearAccessToken())
afterEach(() => vi.restoreAllMocks())

describe('AccountsPage', () => {
  it('lists live accounts with status badges and summary numbers', async () => {
    mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(hrAdmin)),
      [LIST]: () =>
        jsonResponse({
          results: [
            account('Rahul Varma', 'active'),
            account('Sneha Iyer', 'locked'),
            account('Priya Menon', 'disabled', 'manager'),
          ],
          pagination: { page: 1, page_size: 100, total_pages: 1, total_items: 3 },
        }),
    })
    renderPage()

    expect(await screen.findByText('Rahul Varma')).toBeInTheDocument()
    expect(screen.getByText('rahul.varma@brightcone.ai')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
    expect(screen.getAllByText('Locked').length).toBeGreaterThan(0)

    const accountsTile = screen.getByText('Accounts').closest('.stat-tile') as HTMLElement
    expect(within(accountsTile).getByText('3')).toBeInTheDocument()
  })

  it('does not call the API for someone without permission', async () => {
    const fake = mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee)) })
    renderPage()

    expect(await screen.findByText(/restricted to HR administrators/)).toBeInTheDocument()
    expect(fake.count(LIST)).toBe(0)
  })

  it('shows the server error instead of an empty table', async () => {
    mockApi({
      'POST /auth/refresh': () => jsonResponse(sessionFor(hrAdmin)),
      [LIST]: () =>
        jsonResponse({ error: 'forbidden', description: 'You do not have access.' }, 403),
    })
    renderPage()

    // The hook retries once before giving up, so allow a little longer than the default wait.
    const alert = await screen.findByRole('alert', {}, { timeout: 4000 })
    expect(alert).toHaveTextContent('You do not have access.')
  })
})
