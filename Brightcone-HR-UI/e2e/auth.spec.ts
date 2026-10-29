import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

/**
 * End-to-end coverage of the sign-in journey (ticket P1-22).
 *
 * The backend is stubbed at the network boundary so this runs in CI without a
 * database. Everything above that line is the real application: the real
 * router, the real API client with its in-memory access token, the real refresh
 * call on boot, and the real form validation.
 */

const employee = {
  pid: '11111111-1111-1111-1111-111111111111',
  email: 'rahul.varma@brightcone.ai',
  name: 'Rahul Varma',
  role: 'employee',
  must_change_password: false,
  permissions: ['profile:read:own', 'approvals:submit:own'],
}

const session = {
  access_token: 'access-token-for-e2e',
  token_type: 'Bearer',
  expires_in: 900,
  user: employee,
}

/** Stubs the two endpoints the app touches on boot and on sign-in. */
async function stubAuth(page: Page, opts: { signedInFromTheStart?: boolean } = {}) {
  await page.route('**/api/auth/refresh', (route) =>
    route.fulfill({
      status: opts.signedInFromTheStart ? 200 : 401,
      contentType: 'application/json',
      body: opts.signedInFromTheStart
        ? JSON.stringify(session)
        : JSON.stringify({ error: 'unauthorized' }),
    }),
  )

  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) }),
  )

  await page.route('**/api/auth/logout', (route) => route.fulfill({ status: 204, body: '' }))
}

test('an anonymous visitor is sent to the sign-in page', async ({ page }) => {
  await stubAuth(page)

  await page.goto('/')

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('a person signs in, lands on home, and signs out again', async ({ page }) => {
  await stubAuth(page)

  await page.goto('/login')
  await page.getByLabel('Work email').fill('rahul.varma@brightcone.ai')
  await page.getByLabel('Password').fill('a-long-enough-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening), Rahul/ }),
  ).toBeVisible()

  await page.locator('.pp-sidebar-logout').click()

  await expect(page).toHaveURL(/\/login$/)
})

test('the wrong password shows the server message and stays on the page', async ({ page }) => {
  await stubAuth(page)

  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'unauthorized',
        description: 'Email or password is incorrect.',
      }),
    }),
  )

  await page.goto('/login')
  await page.getByLabel('Work email').fill('rahul.varma@brightcone.ai')
  await page.getByLabel('Password').fill('a-long-enough-password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.')
  await expect(page).toHaveURL(/\/login$/)
})

test('an existing refresh cookie restores the session on reload', async ({ page }) => {
  await stubAuth(page, { signedInFromTheStart: true })

  await page.goto('/')

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening), Rahul/ }),
  ).toBeVisible()
})

test('the dark theme can be turned on and is remembered', async ({ page }) => {
  await stubAuth(page, { signedInFromTheStart: true })

  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /Good (morning|afternoon|evening), Rahul/ }),
  ).toBeVisible()

  await page.getByRole('button', { name: /Switch to (dark|light) theme/ }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
