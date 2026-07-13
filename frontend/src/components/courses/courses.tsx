import { BookOpen, ExternalLink, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GESTURE_LIMITS, cardReveal, springSnappy } from '@/motion'

export interface Course {
  id: string
  title: string
  /** Delivery platform / provider (normalized from the course dataset). */
  platform: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  /** Real duration from the dataset (e.g. "6 weeks"). */
  duration: string
  /** Skills this course builds, taken from the skill gap it closes. */
  skills: string[]
  /** Why the AI recommended this course (derived from the skill gap). */
  reason: string
  /** Real external link to the course. */
  url: string
}

export const DIFFICULTY_BADGE: Record<
  Course['difficulty'],
  'outline' | 'muted' | 'secondary'
> = {
  Beginner: 'outline',
  Intermediate: 'muted',
  Advanced: 'secondary',
}

export function CourseCard({
  course,
  saved,
  onToggleSave,
  onOpenSkill,
}: {
  course: Course
  saved?: boolean
  onToggleSave?: (id: string) => void
  /** Optional handler to filter courses by one of this course's skills. */
  onOpenSkill?: (skill: string) => void
}) {
  const headingId = `course-${course.id}-title`
  const hasUrl = Boolean(course.url)
  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      aria-labelledby={headingId}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-muted/70 to-muted">
        <BookOpen
          className="size-8 text-foreground/25 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
        <span className="absolute left-3 top-3">
          <Badge variant="soft" size="xs" className="gap-1">
            {course.platform}
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
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {course.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {course.duration}
          </p>
        </div>

        {course.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.skills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={onOpenSkill ? () => onOpenSkill(skill) : undefined}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                disabled={!onOpenSkill}
              >
                {skill}
              </button>
            ))}
          </div>
        )}

        <p className="flex gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
          <Sparkles
            className="mt-0.5 size-3.5 shrink-0 text-foreground/50"
            aria-hidden="true"
          />
          <span>{course.reason}</span>
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          {hasUrl ? (
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              render={
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Start Course
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              Start Course
            </Button>
          )}
          <Button
            size="sm"
            variant={saved ? 'secondary' : 'outline'}
            className="flex-1"
            aria-pressed={saved}
            onClick={() => onToggleSave?.(course.id)}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
