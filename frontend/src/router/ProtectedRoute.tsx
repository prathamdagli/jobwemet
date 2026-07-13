import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span
        className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}

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
