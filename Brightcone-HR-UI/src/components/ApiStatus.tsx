import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/api/health'

/** Small badge that shows whether the backend and its database answer. */
export function ApiStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 30_000,
    retry: 1,
  })
  const healthy = !isLoading && !isError && data?.status === 'ok'
  return (
    <span className={`pp-pill ${healthy ? 'ok' : 'warn'}`}>
      <span className="pp-status-dot" />
      {isLoading ? 'Checking API' : healthy ? 'API connected' : 'API unavailable'}
    </span>
  )
}
