import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FullScreenSpinner } from '@/components/common/FullScreenSpinner'

interface ProtectedRouteProps {
  redirectTo?: string
}

/**
 * Blocks unauthenticated users from protected routes, redirecting them to the
 * auth flow. Renders the nested route for signed-in users.
 */
export default function ProtectedRoute({
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <FullScreenSpinner />
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
