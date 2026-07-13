import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenSpinner } from '@/components/common/FullScreenSpinner'

/**
 * Redirects authenticated users away from auth pages (e.g. /login) to the
 * protected app. Renders the nested route for guests.
 */
export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullScreenSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
