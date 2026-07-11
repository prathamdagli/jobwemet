import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Banknote,
  Briefcase,
  Clock,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
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
import { useAppState } from '@/hooks/useAppState'
import { Reveal, Stagger } from '@/motion'

export default function JobsPage() {
  const { careers, insights, insightNote } = useCareerMatches()
  const { loading, error, refresh } = useAppState()
  const [refreshing, setRefreshing] = useState(false)
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

  const isEmpty = careers.length === 0

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Career Matches"
        title="Your AI-recommended careers"
        description="Ranked roles based on your analyzed skills — with salary, confidence, and the skills you'd need to close the gap."
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
            <Clock className="size-3.5" aria-hidden="true" />
            Updated {careers[0]?.match ? 'recently' : '—'}
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
        />
      )}
    </div>
  )
}

function CareerMatchesBody({
  careers,
  insights,
  insightNote,
}: {
  careers: ReturnType<typeof useCareerMatches>['careers']
  insights: ReturnType<typeof useCareerMatches>['insights']
  insightNote: string
}) {
  const topMatch = careers[0]
  const highest = Math.max(...careers.map((c) => c.match))
  const average = Math.round(
    careers.reduce((sum, c) => sum + c.match, 0) / careers.length,
  )

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
          label="Top Salary"
          value={topMatch.salary}
          sub="Highest range"
          icon={Banknote}
        />
      </Stagger>

      {/* Dominant element — large featured #1 role + insights side panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Reveal className="lg:col-span-8">
          <TopMatchBanner career={topMatch} />
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <FilterSelect
            label="Minimum Match"
            options={['Any', '70%+', '80%+', '90%+']}
          />
          <FilterSelect
            label="Experience"
            options={['All levels', 'Entry', 'Mid', 'Senior']}
          />
          <FilterSelect
            label="Category"
            options={[
              'All categories',
              'Artificial Intelligence',
              'Data',
              'Engineering',
            ]}
          />
          <FilterSelect
            label="Sort By"
            options={['Best match', 'Salary', 'Experience', 'Title']}
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
            {careers.length} roles
          </Badge>
        </div>
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {careers.map((career) => (
            <CareerCard key={career.id} career={career} />
          ))}
        </Stagger>
      </section>
    </>
  )
}
