import { motion } from 'motion/react'
import { Check, Clock, Lock, Signal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { cn } from '@/lib/utils'
import { GESTURE_LIMITS, springSnappy, timelineReveal } from '@/motion'

export type ModuleStatus = 'completed' | 'current' | 'upcoming' | 'locked'

const STATUS_LABEL: Record<ModuleStatus, string> = {
  completed: 'Completed',
  current: 'Current',
  upcoming: 'Upcoming',
  locked: 'Locked',
}

const STATUS_BADGE: Record<ModuleStatus, 'secondary' | 'outline' | 'muted'> = {
  completed: 'secondary',
  current: 'outline',
  upcoming: 'muted',
  locked: 'muted',
}

function nodeClass(status: ModuleStatus) {
  switch (status) {
    case 'completed':
      return 'bg-foreground'
    case 'current':
      return 'border-2 border-foreground bg-background'
    case 'upcoming':
      return 'border-2 border-border bg-background'
    case 'locked':
      return 'border-2 border-border bg-muted'
  }
}

function cardClass(status: ModuleStatus) {
  switch (status) {
    case 'current':
      return 'border-foreground/30 ring-1 ring-foreground/10'
    case 'locked':
      return 'opacity-70'
    default:
      return 'border-border'
  }
}

export function RoadmapModule({
  title,
  status,
  description,
  duration,
  difficulty,
  progress,
  isLast = false,
}: {
  title: string
  status: ModuleStatus
  description: string
  duration: string
  difficulty: string
  progress?: number
  isLast?: boolean
}) {
  return (
    <motion.li variants={timelineReveal} className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            nodeClass(status),
          )}
        >
          {status === 'completed' ? (
            <Check className="size-4 text-background" aria-hidden="true" />
          ) : status === 'locked' ? (
            <Lock
              className="size-3.5 text-muted-foreground"
              aria-hidden="true"
            />
          ) : status === 'current' ? (
            <span className="size-2 rounded-full bg-foreground" />
          ) : (
            <span className="size-2 rounded-full bg-muted-foreground/50" />
          )}
        </span>
        {!isLast && (
          <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />
        )}
      </div>

      <motion.div
        whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
        transition={springSnappy}
        className={cn(
          'mb-6 flex-1 rounded-2xl border bg-card p-5 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md',
          cardClass(status),
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={cn(
                'text-base font-semibold tracking-tight text-foreground',
                status === 'locked' && 'text-muted-foreground',
              )}
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge variant={STATUS_BADGE[status]} className="shrink-0 gap-1">
            {STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {duration}
          </span>
          <span className="flex items-center gap-1">
            <Signal className="size-3.5" aria-hidden="true" />
            {difficulty}
          </span>
        </div>

        {status === 'current' && typeof progress === 'number' && (
          <div className="mt-3">
            <ProgressBar value={progress} label="Progress" showValue />
          </div>
        )}
      </motion.div>
    </motion.li>
  )
}
