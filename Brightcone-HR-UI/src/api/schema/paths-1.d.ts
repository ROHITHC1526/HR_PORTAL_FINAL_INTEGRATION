import type { operations } from '../schema'

export interface PathGroup1 {
  '/api/admin/users': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Lists accounts, 25 per page by default. */
    get: operations['list']
    put?: never
    /** Creates an account with a temporary password the person must change at first sign-in. */
    post: operations['create']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/admin/users/{pid}/disable': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Disables an account and signs it out everywhere. */
    post: operations['disable']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/admin/users/{pid}/reset-password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Sets a new temporary password (shown once) and signs the person out everywhere. */
    post: operations['reset_password']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/admin/users/{pid}/role': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /** Changes an account's role. */
    put: operations['set_role']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/admin/users/{pid}/unlock': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Unlocks a locked account, or re-enables a disabled one. */
    post: operations['unlock']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/audit': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Who did what and when, newest first. */
    get: operations['list']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/forgot': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Asks for a reset link. The answer is always the same, so nobody can discover which e-mails exist. */
    post: operations['forgot']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/login': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Signs a user in with e-mail and password. */
    post: operations['login']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/logout': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Ends the session. Always answers 204, even if the cookie was already invalid. */
    post: operations['logout']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/refresh': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Swaps the refresh cookie for a new one and returns a fresh access token. */
    post: operations['refresh']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/auth/reset': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    /** Sets a new password using the link from the e-mail. */
    post: operations['reset']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/backup': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get: operations['backup']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/backup/import': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    put?: never
    post: operations['import']
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/health': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /**
     * Liveness plus a database check. Used by monitoring and the frontend start page.
     *     Returns 503 when the database does not answer so load balancers stop sending traffic.
     */
    get: operations['health']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/me': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Who am I and what may I do? Called by the frontend after sign-in and after a page reload. */
    get: operations['current']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
  '/api/me/password': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    get?: never
    /** Changes the password and signs out every other device. Returns a fresh session for this one. */
    put: operations['change_password']
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
