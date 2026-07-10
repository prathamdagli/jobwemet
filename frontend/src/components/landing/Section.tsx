import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  id?: string
  className?: string
  children: ReactNode
}

/**
 * Shared section primitive: consistent horizontal gutter, responsive vertical
 * rhythm, and scroll offset for the fixed navbar. Backgrounds and minimum
 * heights are supplied per-section via `className` so the rhythm stays uniform.
 */
export default function Section({ id, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20 px-6 py-16 md:py-24 lg:py-32 relative z-10',
        className,
      )}
    >
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </section>
  )
}
