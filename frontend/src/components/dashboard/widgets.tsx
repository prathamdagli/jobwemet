import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  GraduationCap,
  Route,
  Sparkles,
  Target,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useCountUp } from '@/motion'
import { cn } from '@/lib/utils'
import { CircularProgress } from './CircularProgress'
import { ProgressBar } from './ProgressBar'
import { WidgetCard } from './WidgetCard'

const MISSING_SKILLS = ['Docker', 'TensorFlow', 'Kubernetes', 'FastAPI']
const CAREER_MATCHES = [
  { title: 'AI Engineer', match: 92 },
  { title: 'Machine Learning Engineer', match: 84 },
  { title: 'Data Engineer', match: 79 },
]
const ACTIVITY: { icon: LucideIcon; text: string; when: string }[] = [
  { icon: FileText, text: 'Resume uploaded', when: '2 days ago' },
  { icon: Sparkles, text: 'AI analysis completed', when: '2 days ago' },
  { icon: Route, text: 'Roadmap generated', when: '1 day ago' },
]

export function DashboardHeader() {
  const { user } = useAuth()
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? 'there'
  const goal = 'AI Engineer'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {name}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Target className="size-4" aria-hidden="true" />
          Goal: <span className="font-medium text-foreground">{goal}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          render={<Link to="/resume" />}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <Upload className="size-4" aria-hidden="true" />
          Upload Resume
        </Button>
        <Button
          render={<Link to="/roadmap" />}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <Route className="size-4" aria-hidden="true" />
          View Roadmap
        </Button>
        <Button render={<Link to="/courses" />} size="sm" className="gap-1.5">
          <GraduationCap className="size-4" aria-hidden="true" />
          Browse Courses
        </Button>
      </div>
    </div>
  )
}

export function CareerReadinessWidget() {
  return (
    <WidgetCard title="Career Readiness" icon={Gauge}>
      <div className="flex flex-1 flex-col items-center justify-center py-1">
        <CircularProgress value={68} label="Career readiness">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {Math.round(useCountUp(68))}%
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">Complete</span>
        </CircularProgress>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        You're building solid momentum toward your goal.
      </p>
    </WidgetCard>
  )
}

export function TopCareerMatchWidget() {
  return (
    <WidgetCard title="Top Career Match" icon={Briefcase}>
      <div className="flex flex-1 flex-col items-center justify-center py-1">
        <CircularProgress
          value={92}
          size={120}
          strokeWidth={11}
          label="Top career match"
        >
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {Math.round(useCountUp(92))}%
          </span>
          <span className="text-xs text-muted-foreground">Match</span>
        </CircularProgress>
      </div>
      <p className="mt-3 text-center text-sm font-medium text-foreground">
        AI Engineer
      </p>
    </WidgetCard>
  )
}

export function MissingSkillsWidget() {
  return (
    <WidgetCard
      title="Skill Gap"
      icon={AlertTriangle}
      action={<Badge variant="muted">{MISSING_SKILLS.length} missing</Badge>}
    >
      <div className="flex flex-1 flex-wrap content-center gap-2">
        {MISSING_SKILLS.map((skill) => (
          <Badge key={skill} variant="outline" className="px-2.5 py-1 text-sm">
            {skill}
          </Badge>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Close these to boost your match score.
      </p>
    </WidgetCard>
  )
}

export function LearningProgressWidget() {
  return (
    <WidgetCard title="Learning Progress" icon={GraduationCap}>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {Math.round(useCountUp(68))}%
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          of your roadmap complete
        </p>
        <ProgressBar value={68} />
        <p className="mt-3 text-xs text-muted-foreground">
          12 of 18 lessons finished
        </p>
      </div>
    </WidgetCard>
  )
}

export function ResumeWidget() {
  return (
    <WidgetCard title="Resume" icon={FileText}>
      <div className="flex flex-1 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            Resume_v2.pdf
          </p>
          <p className="text-xs text-muted-foreground">Uploaded · 2 days ago</p>
        </div>
        <Badge variant="muted" className="gap-1">
          <CheckCircle2 className="size-3.5" aria-hidden="true" />
          Uploaded
        </Badge>
      </div>
    </WidgetCard>
  )
}

export function TopCareerMatchesWidget({ className }: { className?: string }) {
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
        {CAREER_MATCHES.map((match, index) => (
          <li key={match.title}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span
                className={cn(
                  'font-medium',
                  index === 0 ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {match.title}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {match.match}%
              </span>
            </div>
            <ProgressBar value={match.match} />
          </li>
        ))}
      </ul>
    </WidgetCard>
  )
}

export function RecentActivityWidget() {
  return (
    <WidgetCard title="Recent Activity" icon={Activity}>
      <ul className="flex flex-1 flex-col">
        {ACTIVITY.map((item, index) => {
          const isLast = index === ACTIVITY.length - 1
          return (
            <li key={item.text} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
              </div>
              <div className={cn('pb-4', isLast && 'pb-0')}>
                <p className="text-sm font-medium text-foreground">
                  {item.text}
                </p>
                <p className="text-xs text-muted-foreground">{item.when}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </WidgetCard>
  )
}

export function RecommendedNextStepWidget() {
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
              Complete Docker Fundamentals
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              Estimated time:{' '}
              <span className="font-medium text-foreground">6 hours</span>
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
