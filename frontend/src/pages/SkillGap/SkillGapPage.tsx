import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  ListOrdered,
  Loader2,
  PieChart,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { DistributionBar } from '@/components/skills/skills'
import {
  PriorityItem,
  RecommendationItem,
  SkillCategoryGroup,
} from '@/components/skillgap/skillgap'
import { useSkillGap } from '@/hooks/useSkillGap'
import { Stagger, useCountUp } from '@/motion'

export default function SkillGapPage() {
  const { detected, missing, coverage, priority, recommendations } =
    useSkillGap()
  const [refreshing, setRefreshing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    timerRef.current = setTimeout(() => setRefreshing(false), 1600)
  }

  const gapsToClose = priority.length
  const estHours = priority.reduce(
    (sum, p) => sum + (parseInt(p.time, 10) || 0),
    0,
  )
  const highPriority = priority.filter((p) => p.priority === 'High').length
  const avgCoverage = Math.round(
    coverage.reduce((sum, c) => sum + c.value, 0) / coverage.length,
  )
  const toGoal = Math.round(useCountUp(avgCoverage))

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Skill Gap"
        title="Close the gap to your goal"
        description="A prioritized path of the skills standing between you and AI Engineer — ranked by impact and learning effort."
        lastUpdated="Jul 9, 2026"
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
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Goal:{' '}
            <span className="font-medium text-foreground">AI Engineer</span>
          </span>
        }
      />

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
          label="Est. hours"
          value={`${estHours}h`}
          sub="to close all"
          icon={Clock}
        />
        <MetricCard
          variant="sm"
          label="High priority"
          value={`${highPriority}`}
          sub="of 4 skills"
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
        <WidgetCard variant="feature" padding="lg" className="lg:col-span-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Road to your goal
              </p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                Close {gapsToClose} gaps to reach{' '}
                <span className="text-foreground">AI Engineer</span>
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                You&apos;re {avgCoverage}% of the way there. Follow the
                prioritized path below — start with the quick wins, then build
                toward the heavier infrastructure skills.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                  <Target className="size-3.5" aria-hidden="true" />
                  Goal:{' '}
                  <span className="font-medium text-foreground">
                    AI Engineer
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {estHours}h to close
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <CircularProgress
                value={avgCoverage}
                size={208}
                strokeWidth={16}
                label="Progress to AI Engineer"
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
                time={item.time}
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
    </div>
  )
}
