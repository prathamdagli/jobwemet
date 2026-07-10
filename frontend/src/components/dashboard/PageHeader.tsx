import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { fadeUp, useInViewReveal } from '@/motion'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: string
  description?: string
  lastUpdated?: string
  action?: ReactNode
  context?: ReactNode
  className?: string
}

/**
 * The hero for every authenticated page: large title, small description,
 * primary action(s), and "last updated" / context metadata — so pages read as
 * views inside one product rather than a stack of cards.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  lastUpdated,
  action,
  context,
  className,
}: PageHeaderProps) {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()

  return (
    <motion.header
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {(lastUpdated || context) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground/40" />
                Updated {lastUpdated}
              </span>
            )}
            {context}
          </div>
        )}
      </div>
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {action}
        </div>
      )}
    </motion.header>
  )
}
