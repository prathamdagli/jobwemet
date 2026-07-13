import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UploadCloud,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import {
  CareerCard,
  FilterSelect,
  InsightRow,
  TopMatchBanner,
} from '@/components/careers/careers'
import { useCareerMatches } from '@/hooks/useCareerMatches'
import { useProfile } from '@/hooks/useProfile'
import { useAppState } from '@/hooks/useAppState'
import { Reveal, Stagger } from '@/motion'

export default function JobsPage() {
  const { careers, insights, insightNote } = useCareerMatches()
  const { profile } = useProfile()
  const { loading, error, refresh, selectCareer } = useAppState()
  const [refreshing, setRefreshing] = useState(false)
  const [selecting, setSelecting] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  async function handleSelect(title: string) {
    if (selecting) return
    setSelecting(title)
    try {
      await selectCareer(title)
    } finally {
      setSelecting(null)
    }
  }

  const isEmpty = careers.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Career Matches"
        title="Your AI-recommended careers"
        description="Ranked roles based on your analyzed skills — with match confidence and the skills that qualify you. Set one as your goal to re-plan your roadmap and courses."
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
            Current goal:{' '}
            <span className="font-medium text-foreground">
              {profile.targetCareer || 'Not set'}
            </span>
          </span>
        }
      />

      {loading ? (
        <LoadingState label="Loading career matches…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load career matches"
          description={error}
          onRetry={refresh}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={Briefcase}
          title="No career matches yet"
          description="Upload your resume and our AI will analyze your skills and match you to the best-fit careers."
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
        <CareerMatchesBody
          careers={careers}
          insights={insights}
          insightNote={insightNote}
          goal={profile.targetCareer}
          selecting={selecting}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}

function CareerMatchesBody({
  careers,
  insights,
  insightNote,
  goal,
  selecting,
  onSelect,
}: {
  careers: ReturnType<typeof useCareerMatches>['careers']
  insights: ReturnType<typeof useCareerMatches>['insights']
  insightNote: string
  goal: string
  selecting: string | null
  onSelect: (title: string) => void
}) {
  const topMatch = careers[0]
  const highest = Math.max(...careers.map((c) => c.match))
  const average = Math.round(
    careers.reduce((sum, c) => sum + c.match, 0) / careers.length,
  )
  const isGoal = (title: string) =>
    goal.trim().toLowerCase() === title.trim().toLowerCase()

  const [minMatch, setMinMatch] = useState('Any')
  const [sortBy, setSortBy] = useState('Best match')

  const visible = useMemo(() => {
    const threshold =
      minMatch === '90%+'
        ? 90
        : minMatch === '80%+'
          ? 80
          : minMatch === '70%+'
            ? 70
            : 0
    const filtered = careers.filter((c) => c.match >= threshold)
    const sorted = [...filtered]
    if (sortBy === 'Title')
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    else sorted.sort((a, b) => b.match - a.match)
    return sorted
  }, [careers, minMatch, sortBy])

  return (
    <>
      {/* KPI row */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          variant="sm"
          label="Matches Found"
          value={String(careers.length)}
          sub="AI recommended"
          icon={Sparkles}
        />
        <MetricCard
          variant="sm"
          label="Top Match"
          value={`${highest}%`}
          sub={topMatch.title}
          icon={Trophy}
          trend={{ value: 'Top pick', positive: true }}
        />
        <MetricCard
          variant="sm"
          label="Avg Match"
          value={`${average}%`}
          sub="Across all roles"
          icon={TrendingUp}
        />
        <MetricCard
          variant="sm"
          label="Skills In Top Match"
          value={String(topMatch.topSkills.length)}
          sub="Qualifying skills"
          icon={Award}
        />
      </Stagger>

      {/* Dominant element — large featured #1 role + insights side panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Reveal className="lg:col-span-8">
          <TopMatchBanner
            career={topMatch}
            isGoal={isGoal(topMatch.title)}
            isSelecting={selecting === topMatch.title}
            onSelect={onSelect}
          />
        </Reveal>
        <Reveal className="lg:col-span-4">
          <WidgetCard
            title="Career Insights"
            icon={Sparkles}
            variant="muted"
            padding="sm"
            className="h-full"
          >
            <ul className="space-y-2.5">
              {insights.map((item) => (
                <InsightRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <Award
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-foreground">
                {insightNote}
              </p>
            </div>
          </WidgetCard>
        </Reveal>
      </div>

      {/* Slim filter toolbar */}
      <WidgetCard
        title="Refine matches"
        icon={SlidersHorizontal}
        variant="muted"
        padding="sm"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          <FilterSelect
            label="Minimum Match"
            options={['Any', '70%+', '80%+', '90%+']}
            value={minMatch}
            onChange={setMinMatch}
          />
          <FilterSelect
            label="Sort By"
            options={['Best match', 'Title']}
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </WidgetCard>

      {/* Ranked matches */}
      <section aria-label="Ranked career matches" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            All Matches
          </h2>
          <Badge variant="outline" size="sm">
            {visible.length} roles
          </Badge>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles match the current filter.
          </p>
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visible.map((career) => (
              <CareerCard
                key={career.id}
                career={career}
                isGoal={isGoal(career.title)}
                isSelecting={selecting === career.title}
                onSelect={onSelect}
              />
            ))}
          </Stagger>
        )}
      </section>
    </>
  )
}
