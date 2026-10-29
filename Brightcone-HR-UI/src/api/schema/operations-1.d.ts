import type { components } from '../schema'

export interface OperationGroup1 {
  list: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description A page of accounts */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description HR Admin only */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  create: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateUserParams']
      }
    }
    responses: {
      /** @description Account created */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TemporaryPasswordResponse']
        }
      }
      /** @description E-mail already used */
      409: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  disable: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Account id */
        pid: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Account disabled */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  reset_password: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Account id */
        pid: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Temporary password, shown once */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['TemporaryPasswordResponse']
        }
      }
    }
  }
  set_role: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Account id */
        pid: string
      }
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['SetRoleParams']
      }
    }
    responses: {
      /** @description Role changed */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  unlock: {
    parameters: {
      query?: never
      header?: never
      path: {
        /** @description Account id */
        pid: string
      }
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Account is active again */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  list: {
    parameters: {
      query?: {
        /** @description Page cursor */
        before_id?: number
        /** @description 1 to 200, default 50 */
        limit?: number
        /** @description Filter, e.g. auth. */
        action_prefix?: string
        /** @description Filter by who did it */
        actor_user_id?: number
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['AuditPage']
        }
      }
      /** @description HR Admin only */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  forgot: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ForgotParams']
      }
    }
    responses: {
      /** @description Always succeeds */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['MessageResponse']
        }
      }
    }
  }
  login: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['LoginParams']
      }
    }
    responses: {
      /** @description Signed in. The refresh token is set as an HttpOnly cookie. */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SessionResponse']
        }
      }
      /** @description E-mail or password is incorrect */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Account locked or disabled (code account_locked / account_disabled) */
      403: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Too many attempts */
      429: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  logout: {
    parameters: {
      query?: {
        /** @description Sign out on every device */
        all?: boolean
      }
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Signed out; the refresh cookie is deleted */
      204: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
}
