import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface SectionPlaceholderProps {
  title: string
  description?: string
  icon?: LucideIcon
  className?: string
}

/**
 * Consistent empty-state used by every dashboard section until its
 * widgets are built. Keeps the shell visually coherent without
 * duplicating markup across pages.
 */
export function SectionPlaceholder({
  title,
  description = 'This section is coming soon. The interface will appear here.',
  icon: Icon,
  className,
}: SectionPlaceholderProps) {
  return (
    <div className={cn('mx-auto w-full max-w-3xl', className)}>
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        {Icon && (
          <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
