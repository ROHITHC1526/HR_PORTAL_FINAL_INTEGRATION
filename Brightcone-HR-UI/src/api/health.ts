import type { components } from './schema'
import { api } from './client'

// Type comes from the backend's openapi.json (npm run gen:api), so it cannot drift.
export type Health = components['schemas']['HealthResponse']

export const getHealth = () => api<Health>('/health')
