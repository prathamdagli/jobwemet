import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCountUp } from '@/motion'
import { cn } from '@/lib/utils'
import { useCareerMatches } from '@/hooks/useCareerMatches'
import { useDashboard } from '@/hooks/useDashboard'
import { useProfile } from '@/hooks/useProfile'
import { useResume } from '@/hooks/useResume'
import { useSkillGap } from '@/hooks/useSkillGap'
import { ProgressBar } from './ProgressBar'
import { WidgetCard } from './WidgetCard'

export function MissingSkillsWidget() {
  const { missing } = useSkillGap()
  const skills = missing.flatMap((g) => g.skills)
  return (
    <WidgetCard
      title="Skill Gap"
      icon={AlertTriangle}
      action={<Badge variant="muted">{skills.length} missing</Badge>}
    >
      <div className="flex flex-1 flex-wrap content-center gap-2">
        {skills.length ? (
          skills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="px-2.5 py-1 text-sm"
            >
              {skill}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No skill gaps identified yet.
          </p>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Close these to boost your match score.
      </p>
    </WidgetCard>
  )
}

export function LearningProgressWidget() {
  const dashboard = useDashboard()
  const pct = dashboard.roadmapComplete
  return (
    <WidgetCard title="Learning Progress" icon={GraduationCap}>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {Math.round(useCountUp(pct))}%
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          of your roadmap complete
        </p>
        <ProgressBar value={pct} />
        <p className="mt-3 text-xs text-muted-foreground">
          {dashboard.lessonsFinished} of {dashboard.lessonsTotal} lessons
          finished
        </p>
      </div>
    </WidgetCard>
  )
}

export function ResumeWidget() {
  const resume = useResume()
  const has = resume.recent.length > 0
  return (
    <WidgetCard title="Resume" icon={FileText}>
      <div className="flex flex-1 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {resume.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {has ? `Uploaded · ${resume.uploaded}` : 'No resume uploaded yet'}
          </p>
        </div>
        <Badge variant="muted" className="gap-1">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          {has ? 'Uploaded' : '—'}
        </Badge>
      </div>
    </WidgetCard>
  )
}

export function TopCareerMatchesWidget({ className }: { className?: string }) {
  const { careers } = useCareerMatches()
  return (
    <WidgetCard
      className={className}
      title="Top Career Matches"
      icon={Target}
      action={
        <Button
          render={<Link to="/jobs" />}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          View all
        </Button>
      }
    >
      <ul className="flex flex-1 flex-col gap-3">
        {careers.slice(0, 3).map((career, index) => (
          <li key={career.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span
                className={cn(
                  'font-medium',
                  index === 0 ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {career.title}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {career.match}%
              </span>
            </div>
            <ProgressBar value={career.match} />
          </li>
        ))}
        {!careers.length && (
          <li className="text-sm text-muted-foreground">
            No matches yet — upload a resume to get started.
          </li>
        )}
      </ul>
    </WidgetCard>
  )
}

export function RecentActivityWidget() {
  const { activity } = useProfile()
  return (
    <WidgetCard title="Recent Activity" icon={Activity}>
      <ul className="flex flex-1 flex-col">
        {activity.map((item, index) => {
          const isLast = index === activity.length - 1
          const Icon = item.icon
          return (
            <li key={item.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
              </div>
              <div className={cn('pb-4', isLast && 'pb-0')}>
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </li>
          )
        })}
        {!activity.length && (
          <li className="text-sm text-muted-foreground">No activity yet.</li>
        )}
      </ul>
    </WidgetCard>
  )
}

export function RecommendedNextStepWidget() {
  const dashboard = useDashboard()
  return (
    <WidgetCard className="bg-gradient-to-br from-muted/60 to-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recommended Next Step
            </p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
              {dashboard.recommendedNext}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              Estimated time:{' '}
              <span className="font-medium text-foreground">
                {dashboard.recommendedNextHours} hours
              </span>
            </p>
          </div>
        </div>
        <Button
          render={<Link to="/courses" />}
          size="lg"
          className="mt-4 gap-1.5 shrink-0 sm:mt-0 sm:ml-6"
        >
          Continue Learning
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </WidgetCard>
  )
}
