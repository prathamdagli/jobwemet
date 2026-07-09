import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingRowProps {
  title: string
  description?: string
  htmlFor?: string
  children?: ReactNode
  className?: string
}

/**
 * Single reusable row used across every settings section.
 * Left column holds the label + description, right column holds the control.
 */
export function SettingRow({
  title,
  description,
  htmlFor,
  children,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            className="block text-sm font-medium text-foreground"
          >
            {title}
          </label>
        ) : (
          <p className="text-sm font-medium text-foreground">{title}</p>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
