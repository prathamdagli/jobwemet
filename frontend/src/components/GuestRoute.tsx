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
