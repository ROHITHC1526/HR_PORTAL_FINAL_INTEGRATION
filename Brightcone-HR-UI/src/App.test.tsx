import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { clearAccessToken } from './api/client'
import { AuthProvider } from './auth/AuthContext'
import { employee, jsonResponse, mockApi, sessionFor } from './test/fake-api'

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

beforeEach(() => clearAccessToken())
afterEach(() => vi.restoreAllMocks())

describe('signed out', () => {
  const signedOut = {
    'POST /auth/refresh': () => jsonResponse({ error: 'unauthorized' }, 401),
  }

  it('sends visitors of a protected page to the sign-in page', async () => {
    mockApi(signedOut)
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('validates the form before calling the server', async () => {
    const fake = mockApi(signedOut)
    renderAt('/login')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Enter your work email.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(fake.count('POST /auth/login')).toBe(0)
  })

  it('shows the server message for a wrong password and stays on the page', async () => {
    mockApi({
      ...signedOut,
      'POST /auth/login': () =>
        jsonResponse(
          { error: 'unauthorized', description: 'Email or password is incorrect.' },
          401,
        ),
    })
    renderAt('/login')
    await userEvent.type(await screen.findByLabelText('Work email'), 'rahul.varma@brightcone.ai')
    await userEvent.type(screen.getByLabelText('Password'), 'not the password')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.')
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('shows the locked-account message from the server', async () => {
    mockApi({
      ...signedOut,
      'POST /auth/login': () =>
        jsonResponse(
          {
            error: 'account_locked',
            description: 'This account is locked. Contact HR to unlock it.',
          },
          403,
        ),
    })
    renderAt('/login')
    await userEvent.type(await screen.findByLabelText('Work email'), 'a@brightcone.ai')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever it is')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText(/This account is locked/)).toBeInTheDocument()
  })

  it('always shows the same confirmation after asking for a reset link', async () => {
    mockApi({ ...signedOut, 'POST /auth/forgot': () => jsonResponse({ message: 'ok' }) })
    renderAt('/forgot-password')
    await userEvent.type(await screen.findByLabelText('Work email'), 'anyone@brightcone.ai')
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByText(/If an account exists for that email/)).toBeInTheDocument()
  })

  it('refuses a reset page opened without a token', async () => {
    mockApi(signedOut)
    renderAt('/reset-password')
    expect(await screen.findByText(/This link is incomplete/)).toBeInTheDocument()
  })
})

describe('signing in and out', () => {
  it('signs in, shows the home page, and signs out again', async () => {
    let signedIn = false
    const fake = mockApi({
      'POST /auth/refresh': () =>
        signedIn
          ? jsonResponse(sessionFor(employee))
          : jsonResponse({ error: 'unauthorized' }, 401),
      'POST /auth/login': () => {
        signedIn = true
        return jsonResponse(sessionFor(employee))
      },
      'POST /auth/logout': () => {
        signedIn = false
        return jsonResponse(null, 204)
      },
    })
    renderAt('/')

    await userEvent.type(await screen.findByLabelText('Work email'), 'rahul.varma@brightcone.ai')
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery staple')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByRole('heading', { name: /Good (morning|afternoon|evening), Rahul/ }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Sign out' })[0])
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText("You've signed out.")).toBeInTheDocument()
    expect(fake.count('POST /auth/logout')).toBe(1)
  })

  it('restores the session after a page reload', async () => {
    mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee)) })
    renderAt('/')
    expect(
      await screen.findByRole('heading', { name: /Good (morning|afternoon|evening), Rahul/ }),
    ).toBeInTheDocument()
  })

  it('forces a password change when HR set a temporary password', async () => {
    const temp = { ...employee, must_change_password: true }
    mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(temp)) })
    renderAt('/')
    expect(
      await screen.findByRole('heading', { name: 'Choose your own password' }),
    ).toBeInTheDocument()
  })

  it('keeps people without the permission out of a guarded page', async () => {
    mockApi({ 'POST /auth/refresh': () => jsonResponse(sessionFor(employee)) })
    const { RequireAuth } = await import('./auth/RequireAuth')
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/secret']}>
          <AuthProvider>
            <RequireAuth permission="audit:read">
              <p>Audit log</p>
            </RequireAuth>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    await waitFor(() => expect(screen.queryByText('Audit log')).not.toBeInTheDocument())
  })
})
