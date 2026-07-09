import type { LucideIcon } from 'lucide-react'
import { BookOpen, Clock, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/dashboard/ProgressBar'

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

const DIFFICULTY_BADGE: Record<
  Course['difficulty'],
  'outline' | 'muted' | 'secondary'
> = {
  Beginner: 'outline',
  Intermediate: 'muted',
  Advanced: 'secondary',
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="relative flex h-32 items-center justify-center bg-muted">
        <BookOpen className="size-8 text-muted-foreground" aria-hidden="true" />
        <span className="absolute right-3 top-3">
          <Badge
            variant={DIFFICULTY_BADGE[course.difficulty]}
            className="gap-1"
          >
            {course.difficulty}
          </Badge>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
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
        <p className="text-sm text-muted-foreground">{course.description}</p>
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Skills covered
          </p>
          <div className="flex flex-wrap gap-1.5">
            {course.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          <Button size="lg" className="flex-1" render={<Link to="/courses" />}>
            Start Learning
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            Save Course
          </Button>
        </div>
      </div>
    </article>
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
    <li className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
      {typeof progress === 'number' && <ProgressBar value={progress} />}
    </li>
  )
}
