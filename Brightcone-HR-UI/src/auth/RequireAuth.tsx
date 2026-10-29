import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useAuth } from './AuthContext'

/**
 * Route guard. Hiding a page here is for comfort only: the server checks every request again.
 * - not signed in         -> sign-in page, and back here afterwards
 * - must change password  -> the change-password page
 * - missing `permission`  -> home, with a notice
 */
export function RequireAuth({
  children,
  permission,
}: {
  children: ReactNode
  permission?: string
}) {
  const { status, user, can } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Spinner label="Checking your session" />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (user.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  if (permission && !can(permission)) {
    return <Navigate to="/" replace state={{ notice: "You don't have access to that page." }} />
  }
  return <>{children}</>
}
