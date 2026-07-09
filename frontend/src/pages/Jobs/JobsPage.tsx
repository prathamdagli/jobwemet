import { useEffect, useRef, useState } from 'react'
import {
  Award,
  Clock,
  Gauge,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricTile } from '@/components/skills/skills'
import {
  CareerCard,
  FilterSelect,
  InsightRow,
  TopMatchBanner,
} from '@/components/careers/careers'
import { useCareerMatches } from '@/hooks/useCareerMatches'

export default function JobsPage() {
  const { careers, insights, insightNote } = useCareerMatches()
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

  const topMatch = careers[0]
  const highest = Math.max(...careers.map((c) => c.match))
  const average = Math.round(
    careers.reduce((sum, c) => sum + c.match, 0) / careers.length,
  )

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Career Matches
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-recommended careers based on your analyzed skills.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Last updated Jul 9, 2026
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="lg"
          className="gap-1.5"
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {refreshing ? 'Refreshing…' : 'Refresh Recommendations'}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Total Career Matches"
          value={String(careers.length)}
          icon={Sparkles}
        />
        <MetricTile
          label="Highest Match"
          value={`${highest}%`}
          sub={topMatch.title}
          icon={Trophy}
        />
        <MetricTile
          label="Average Match"
          value={`${average}%`}
          icon={TrendingUp}
        />
        <MetricTile label="Career Readiness" value="84%" icon={Gauge} />
      </div>

      <TopMatchBanner career={topMatch} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <WidgetCard title="Filters" icon={SlidersHorizontal}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Minimum Match %"
                options={['Any', '70%+', '80%+', '90%+']}
              />
              <FilterSelect
                label="Experience Level"
                options={['All levels', 'Entry', 'Mid', 'Senior']}
              />
              <FilterSelect
                label="Career Category"
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {careers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1" aria-label="Career insights">
          <WidgetCard title="Career Insights" icon={Sparkles}>
            <ul className="space-y-3">
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
              <p className="text-xs text-foreground">{insightNote}</p>
            </div>
          </WidgetCard>
        </aside>
      </div>
    </div>
  )
}
