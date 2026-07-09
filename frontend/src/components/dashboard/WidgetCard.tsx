import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetCardProps {
  title?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  children: ReactNode
}

/** Reusable rounded card chrome shared by every dashboard widget. */
export function WidgetCard({
  title,
  icon: Icon,
  action,
  className,
  children,
}: WidgetCardProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md',
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            {title && (
              <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </section>
  )
}
