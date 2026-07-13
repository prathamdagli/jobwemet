import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ListOrdered,
  Loader2,
  PieChart,
  RefreshCw,
  Sparkles,
  Target,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { DistributionBar } from '@/components/skills/skills'
import {
  PriorityItem,
  RecommendationItem,
  SkillCategoryGroup,
} from '@/components/skillgap/skillgap'
import { useSkillGap } from '@/hooks/useSkillGap'
import { useProfile } from '@/hooks/useProfile'
import { useAppState } from '@/hooks/useAppState'
import { Stagger, useCountUp } from '@/motion'

export default function SkillGapPage() {
  const { detected, missing, coverage, priority, recommendations } =
    useSkillGap()
  const { profile } = useProfile()
  const { loading, error, refresh } = useAppState()
  const [refreshing, setRefreshing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasGoal = !!profile.targetCareer
  const goal = profile.targetCareer || 'your goal'

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleRefresh() {
    if (refreshing) return
    refresh()
    setRefreshing(true)
    timerRef.current = setTimeout(() => setRefreshing(false), 1600)
  }

  const gapsToClose = priority.length
  const highPriority = priority.filter((p) => p.priority === 'High').length
  const avgCoverage = coverage.length
    ? Math.round(
        coverage.reduce((sum, c) => sum + c.value, 0) / coverage.length,
      )
    : 0
  const toGoal = Math.round(useCountUp(avgCoverage))
  const hasData = priority.length > 0 || detected.length > 0

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Skill Gap"
        title="Close the gap to your goal"
        description={`A prioritized path of the skills standing between you and ${goal} — ranked by impact and learning effort.`}
        lastUpdated={profile.lastUpdated}
        action={
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="gap-1.5"
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {refreshing ? 'Refreshing…' : 'Regenerate Gap Analysis'}
          </Button>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Goal: <span className="font-medium text-foreground">{goal}</span>
          </span>
        }
      />

      {loading ? (
        <LoadingState label="Loading your skill gap…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load skill gap"
          description={error}
          onRetry={refresh}
        />
      ) : !hasGoal ? (
        <EmptyState
          icon={Target}
          title="No target career set"
          description="Select your target career to generate a personalized skill gap analysis."
          action={
            <Button
              render={<Link to="/profile" />}
              size="sm"
              className="mt-1 gap-1.5"
            >
              Set Target Career
            </Button>
          }
        />
      ) : !hasData ? (
        <EmptyState
          icon={Target}
          title="No skill gap analysis yet"
          description="Upload your resume and our AI will map the skills you have against the ones your goal role requires."
          action={
            <Button
              render={<Link to="/resume" />}
              size="sm"
              className="mt-1 gap-1.5"
            >
              <UploadCloud className="size-4" aria-hidden="true" />
              Upload Resume
            </Button>
          }
        />
      ) : (
        <>
          {/* KPI row */}
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              variant="sm"
              label="Gaps to close"
              value={`${gapsToClose}`}
              sub="on your path"
              icon={ListOrdered}
            />
            <MetricCard
              variant="sm"
              label="High priority"
              value={`${highPriority}`}
              sub={`of ${priority.length} skills`}
              icon={AlertTriangle}
            />
            <MetricCard
              variant="sm"
              label="Coverage"
              value={`${avgCoverage}%`}
              sub="avg across areas"
              icon={PieChart}
            />
          </Stagger>

          {/* Dominant hero + side coverage */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <WidgetCard
              variant="feature"
              padding="lg"
              className="lg:col-span-8"
            >
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Road to your goal
                  </p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    Close {gapsToClose} gaps to reach{' '}
                    <span className="text-foreground">{goal}</span>
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    You&apos;re {avgCoverage}% of the way there. Follow the
                    prioritized path below — start with the quick wins, then
                    build toward the heavier infrastructure skills.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
                      <Target className="size-3.5" aria-hidden="true" />
                      Goal:{' '}
                      <span className="font-medium text-foreground">
                        {goal}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <CircularProgress
                    value={avgCoverage}
                    size={208}
                    strokeWidth={16}
                    label={`Progress to ${goal}`}
                  >
                    <span className="text-5xl font-semibold tracking-tight text-foreground">
                      {toGoal}%
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      To goal
                    </span>
                  </CircularProgress>
                </div>
              </div>
            </WidgetCard>

            <WidgetCard
              variant="muted"
              title="Skill Coverage"
              icon={BarChart3}
              className="lg:col-span-4"
            >
              <div className="space-y-4">
                {coverage.map((item) => (
                  <DistributionBar
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </WidgetCard>
          </div>

          {/* Grouped gaps + AI recommendations */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <WidgetCard
              title="Your prioritized path"
              icon={ListOrdered}
              action={
                <Badge variant="soft" size="xs">
                  1–{priority.length} in order
                </Badge>
              }
              className="lg:col-span-8"
            >
              <ol className="space-y-3">
                {priority.map((item, index) => (
                  <PriorityItem
                    key={item.skill}
                    rank={index + 1}
                    skill={item.skill}
                    priority={item.priority}
                    difficulty={item.difficulty}
                  />
                ))}
              </ol>
            </WidgetCard>

            <WidgetCard
              title="AI Recommendations"
              icon={Sparkles}
              className="lg:col-span-4"
            >
              <ul className="space-y-3">
                {recommendations.map((text, index) => (
                  <RecommendationItem key={index} text={text} />
                ))}
              </ul>
            </WidgetCard>
          </div>

          {/* Detected vs missing, grouped */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <WidgetCard title="What you have" icon={CheckCircle2}>
              <div className="space-y-5">
                {detected.map((group) => (
                  <SkillCategoryGroup
                    key={group.category}
                    title={group.category}
                    skills={group.skills}
                    tone="detected"
                  />
                ))}
              </div>
            </WidgetCard>

            <WidgetCard title="What's missing" icon={AlertTriangle}>
              <div className="space-y-5">
                {missing.map((group) => (
                  <SkillCategoryGroup
                    key={group.category}
                    title={group.category}
                    skills={group.skills}
                    tone="missing"
                  />
                ))}
              </div>
            </WidgetCard>
          </div>
        </>
      )}
    </div>
  )
}
