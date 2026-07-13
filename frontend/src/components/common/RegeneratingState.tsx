import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegeneratingStateProps {
  targetCareer?: string
  className?: string
}

export function RegeneratingState({
  targetCareer,
  className,
}: RegeneratingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm text-center min-h-[400px]',
        className,
      )}
    >
      <Loader2
        className="size-10 animate-spin text-primary"
        aria-hidden="true"
      />
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Rebuilding your path
        </h3>
        <p className="max-w-md text-sm text-muted-foreground mx-auto">
          {targetCareer
            ? `Processing your new goal (${targetCareer}). `
            : 'Processing your request. '}
          Please wait while we generate your missing skills, roadmap, and
          recommended courses...
        </p>
      </div>
    </div>
  )
}
