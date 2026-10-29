import type { components } from '../schema'

export interface OperationGroup2 {
  refresh: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description New access token; the refresh cookie is replaced */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SessionResponse']
        }
      }
      /** @description No valid refresh cookie */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  reset: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ResetParams']
      }
    }
    responses: {
      /** @description Password changed; all sessions were signed out */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['MessageResponse']
        }
      }
      /** @description Link invalid or expired, or password too weak */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  backup: {
    parameters: {
      query?: never
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
          'application/json': components['schemas']['BackupDocument']
        }
      }
    }
  }
  import: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['BackupImport']
      }
    }
    responses: {
      /** @description Import summary */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  health: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Server and database are up */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['HealthResponse']
        }
      }
      /** @description Database is not answering */
      503: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['HealthResponse']
        }
      }
    }
  }
  current: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description The signed-in user */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['MeResponse']
        }
      }
      /** @description Not signed in */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  change_password: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['ChangePasswordParams']
      }
    }
    responses: {
      /** @description Password changed */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': components['schemas']['SessionResponse']
        }
      }
      /** @description Current password wrong, or new password too weak */
      400: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
      /** @description Not signed in */
      401: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
  list: {
    parameters: {
      query?: never
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
          'application/json': components['schemas']['NotificationPage']
        }
      }
    }
  }
  mark_read: {
    parameters: {
      query?: never
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
          'application/json': components['schemas']['Notification']
        }
      }
    }
  }
  list: {
    parameters: {
      query?: never
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
          'application/json': components['schemas']['RecordCatalog']
        }
      }
    }
  }
  csv: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description CSV export */
      200: {
        headers: {
          [name: string]: unknown
        }
        content?: never
      }
    }
  }
}
