import type { LucideIcon } from 'lucide-react'
import { BookOpen, Clock, Star } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { GESTURE_LIMITS, cardReveal, listReveal, springSnappy } from '@/motion'

export interface Course {
  id: string
  title: string
  platform: string
  instructor: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  rating: number
  skills: string[]
  description: string
}

export const DIFFICULTY_BADGE: Record<
  Course['difficulty'],
  'outline' | 'muted' | 'secondary'
> = {
  Beginner: 'outline',
  Intermediate: 'muted',
  Advanced: 'secondary',
}

/**
 * Stable, deterministic progress for a course — derived from its id so the
 * value never flickers between renders. Purely a visual stand-in (the mock
 * data carries no per-course progress field); kept in [20, 89] so bars read
 * as "in progress" rather than empty or complete.
 */
export function courseProgress(course: Course): number {
  let h = 0
  for (const ch of course.id) h = (h * 31 + ch.charCodeAt(0)) % 1000
  return 20 + (h % 70)
}

export function CourseCard({ course }: { course: Course }) {
  const headingId = `course-${course.id}-title`
  const progress = courseProgress(course)
  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      aria-labelledby={headingId}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md"
    >
      {/* Editorial cover — icon field + category + difficulty */}
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-muted/70 to-muted">
        <BookOpen
          className="size-9 text-foreground/25 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="absolute left-3 top-3">
          <Badge variant="soft" size="xs" className="gap-1">
            {course.skills[0]}
          </Badge>
        </span>
        <span className="absolute right-3 top-3">
          <Badge variant={DIFFICULTY_BADGE[course.difficulty]} size="xs">
            {course.difficulty}
          </Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="truncate text-base font-semibold tracking-tight text-foreground"
          >
            {course.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {course.platform} · {course.instructor}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-3.5" aria-hidden="true" />
            {course.rating.toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        <div className="mt-auto space-y-3 pt-1">
          <ProgressBar value={progress} label="Progress" showValue size="sm" />
          <div className="flex flex-wrap gap-1.5">
            {course.skills.slice(1).map((skill) => (
              <Badge key={skill} variant="outline" size="xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row">
          <Button size="sm" className="flex-1" render={<Link to="/courses" />}>
            Start
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export function SidebarStat({
  icon: Icon,
  label,
  value,
  progress,
}: {
  icon: LucideIcon
  label: string
  value: string
  progress?: number
}) {
  return (
    <motion.li
      variants={listReveal}
      className="flex flex-col gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5"
    >
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {typeof progress === 'number' && (
        <ProgressBar value={progress} size="sm" />
      )}
    </motion.li>
  )
}
