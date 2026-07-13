import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-6">
        {/* Large 404 number */}
        <p className="text-[120px] font-semibold leading-none tracking-tight text-foreground/10 select-none">
          404
        </p>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back on track.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button render={<Link to="/" />} className="gap-1.5">
            <Home className="size-4" aria-hidden="true" />
            Go Home
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
