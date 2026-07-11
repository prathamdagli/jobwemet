import { motion } from 'motion/react'
import { ArrowRight, Sparkles, Target, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useCountUp } from '@/motion'
import { Stagger } from '@/motion'
import { useAuth } from '@/hooks/useAuth'
import { useAppState } from '@/hooks/useAppState'
import { useCareerMatches } from '@/hooks/useCareerMatches'
import { useDashboard } from '@/hooks/useDashboard'
import { useProfile } from '@/hooks/useProfile'
import { useResume } from '@/hooks/useResume'
import { useSkillGap } from '@/hooks/useSkillGap'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import {
  LearningProgressWidget,
  MissingSkillsWidget,
  RecentActivityWidget,
  RecommendedNextStepWidget,
  ResumeWidget,
  TopCareerMatchesWidget,
} from '@/components/dashboard/widgets'

function Greeting() {
  const { user } = useAuth()
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? 'there'
  const firstName = name.split(/[\s.]+/)[0] || name
  const hour = new Date().getHours()
  const part =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <>
      {part}, <span className="text-foreground">{firstName}</span>
    </>
  )
}

export default function DashboardPage() {
  const { loading, error, refresh } = useAppState()
  const dashboard = useDashboard()
  const { profile } = useProfile()
  const { careers } = useCareerMatches()
  const resume = useResume()
  const { priority: skillGaps } = useSkillGap()

  const readiness = Math.round(useCountUp(dashboard.readiness))
  const topMatch = careers[0]?.match ?? dashboard.topMatch
  const topMatchTitle = careers[0]?.title ?? dashboard.topMatchTitle
  const goal = profile.targetCareer || 'your goal'

  if (loading) return <LoadingState label="Loading your workspace…" />
  if (error)
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description={error}
        onRetry={refresh}
      />
    )

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow={<Greeting />}
        title="Your AI career workspace"
        description="A living snapshot of your readiness, matches, and the next best step toward your goal."
        action={
          <>
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
              View Roadmap
            </Button>
            <Button
              render={<Link to="/courses" />}
              size="sm"
              className="gap-1.5"
            >
              Browse Courses
            </Button>
          </>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Goal: <span className="font-medium text-foreground">{goal}</span>
          </span>
        }
      />

      {/* Dominant hero — Today's Summary */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-muted/50 to-card p-6 shadow-md md:p-8"
      >
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Today&apos;s Summary
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              You&apos;re {readiness}% ready
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Solid momentum toward your {goal} goal. Close a few skill gaps to
              reach the top career match and keep your roadmap on track.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                render={<Link to="/courses" />}
                size="sm"
                className="gap-1.5"
              >
                Continue Learning
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button
                render={<Link to="/jobs" />}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                See Matches
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <CircularProgress
              value={dashboard.readiness}
              size={208}
              strokeWidth={16}
              label="Career readiness"
            >
              <span className="text-5xl font-semibold tracking-tight text-foreground">
                {readiness}%
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Career Readiness
              </span>
            </CircularProgress>
          </div>
        </div>
      </motion.section>

      {/* KPI row — small variant tiles */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          variant="sm"
          label="Top Match"
          value={`${topMatch}%`}
          sub={topMatchTitle || 'No match yet'}
          icon={Target}
        />
        <MetricCard
          variant="sm"
          label="Skill Gaps"
          value={`${skillGaps.length}`}
          sub="to close"
          icon={Sparkles}
        />
        <MetricCard
          variant="sm"
          label="Roadmap"
          value={`${dashboard.roadmapComplete}%`}
          sub={`${dashboard.lessonsFinished} of ${dashboard.lessonsTotal} lessons`}
          icon={Target}
        />
        <MetricCard
          variant="sm"
          label="Resume"
          value={resume.fileName}
          sub={resume.recent.length ? `Parsed ${resume.uploaded}` : 'No resume'}
          icon={Upload}
        />
      </Stagger>

      {/* Matches + Activity — asymmetric */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopCareerMatchesWidget />
        </div>
        <RecentActivityWidget />
      </div>

      {/* Supporting insights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ResumeWidget />
        <MissingSkillsWidget />
        <LearningProgressWidget />
      </div>

      {/* Recommended next step */}
      <RecommendedNextStepWidget />
    </div>
  )
}
