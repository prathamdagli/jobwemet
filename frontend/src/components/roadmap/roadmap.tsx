import { motion } from 'motion/react'
import { Check, ExternalLink, Flag, Signal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { GESTURE_LIMITS, springSnappy, timelineReveal } from '@/motion'

export type ModuleStatus = 'completed' | 'current' | 'upcoming'

const STATUS_LABEL: Record<ModuleStatus, string> = {
  completed: 'Completed',
  current: 'Current',
  upcoming: 'Upcoming',
}

const STATUS_BADGE: Record<ModuleStatus, 'default' | 'secondary' | 'outline'> =
  {
    completed: 'secondary',
    current: 'default',
    upcoming: 'outline',
  }

function nodeClass(status: ModuleStatus) {
  switch (status) {
    case 'completed':
      return 'bg-foreground text-background'
    case 'current':
      return 'border-2 border-foreground bg-background'
    default:
      return 'border-2 border-border bg-background'
  }
}

function cardClass(status: ModuleStatus) {
  switch (status) {
    case 'current':
      return 'border-foreground/30 bg-foreground/[0.02] ring-1 ring-foreground/10'
    default:
      return 'border-border'
  }
}

export interface RoadmapCourseRef {
  title: string
  url: string
}

/**
 * A single node on the roadmap timeline. Renders a status node on a connecting
 * spine plus a card with the module's title, description, meta and (for the
 * active module) recommended courses. `completed` only appears when the backend
 * genuinely marks a phase done — the app never fabricates completion.
 */
export function RoadmapModule({
  title,
  status,
  description,
  difficulty,
  estimatedHours,
  skills,
  recommendedCourses = [],
  isLast = false,
}: {
  title: string
  status: ModuleStatus
  description: string
  difficulty: string
  estimatedHours?: number
  skills?: string[]
  recommendedCourses?: RoadmapCourseRef[]
  isLast?: boolean
}) {
  const isCurrent = status === 'current'
  const isCompleted = status === 'completed'

  return (
    <motion.li variants={timelineReveal} className="flex gap-4">
      {/* Spine + status node */}
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full',
            nodeClass(status),
            isCurrent && 'shadow-[0_0_0_4px] shadow-foreground/10',
          )}
        >
          {isCompleted ? (
            <Check className="size-4" aria-hidden="true" />
          ) : isCurrent ? (
            <span className="size-2.5 rounded-full bg-foreground" />
          ) : (
            <span className="size-2.5 rounded-full bg-muted-foreground/50" />
          )}
        </span>
        {!isLast && (
          <span
            className={cn(
              'mt-1 w-px flex-1',
              isCurrent
                ? 'bg-gradient-to-b from-foreground/40 to-border'
                : 'bg-border',
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Module card */}
      <motion.div
        whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
        transition={springSnappy}
        className={cn(
          'mb-5 flex-1 rounded-2xl border bg-card p-4 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md sm:p-5',
          cardClass(status),
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              {isCurrent && (
                <Flag
                  className="size-3.5 shrink-0 text-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge
            variant={STATUS_BADGE[status]}
            size="xs"
            className="shrink-0 gap-1"
          >
            {STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" aria-hidden="true" />
            {difficulty}
          </span>
          {typeof estimatedHours === 'number' && (
            <span className="flex items-center gap-1">
              <Signal className="size-3.5" aria-hidden="true" />~
              {estimatedHours}h
            </span>
          )}
        </div>

        {skills && skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <Badge key={skill} variant="muted" size="xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {recommendedCourses.length > 0 && (
          <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-foreground">
              Recommended courses
            </p>
            <ul className="mt-2 space-y-1.5">
              {recommendedCourses.map((c) => (
                <li key={c.title}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <ExternalLink
                      className="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </motion.li>
  )
}
