import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  label?: string
  className?: string
}

/** Centered spinner + label. Reusable across pages awaiting data. */
export function LoadingState({
  label = 'Loading…',
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground',
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
