import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { clearAccessToken } from '@/api/client'
import { AuthProvider } from '@/auth/AuthContext'
import { MODULE_ALIASES, MODULE_STUBS } from '@/features/modules/modules'
import { employee, jsonResponse, mockApi, sessionFor } from '@/test/fake-api'

function renderAt(path: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  clearAccessToken()
  mockApi({
    'POST /auth/refresh': () => jsonResponse(sessionFor(employee)),
    'GET /health': () => jsonResponse({ status: 'ok', database: 'ok' }),
  })
})
afterEach(() => vi.restoreAllMocks())

describe('route table', () => {
  it('shows an honest "coming soon" page for modules without a backend', async () => {
    renderAt('/leave')
    // Employees see their own wording for the page.
    expect(await screen.findByRole('heading', { name: 'My leave' })).toBeInTheDocument()
    expect(screen.getByText(/P3 Time, ticket P3-05/)).toBeInTheDocument()
  })

  it('serves every module path and its aliases', async () => {
    for (const stub of MODULE_STUBS.slice(0, 3)) {
      const { unmount } = renderAt(`/${stub.path}`)
      expect(await screen.findByText('Coming soon', { selector: '.pp-pill' })).toBeInTheDocument()
      unmount()
    }
    expect(Object.keys(MODULE_ALIASES).length).toBeGreaterThan(0)
  })

  it('sends people without audit permission away from the audit log', async () => {
    renderAt('/audit')
    expect(await screen.findByText(/Good (morning|afternoon|evening)/)).toBeInTheDocument()
    expect(screen.queryByText('Timestamp')).not.toBeInTheDocument()
  })

  it('shows the not-found page for unknown URLs', async () => {
    renderAt('/definitely/not/here')
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
