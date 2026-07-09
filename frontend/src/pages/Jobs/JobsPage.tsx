import { useEffect, useRef, useState } from 'react'
import {
  Award,
  Clock,
  Gauge,
  Loader2,
  RefreshCw,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Trophy,
  Wallet,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricTile } from '@/components/skills/skills'
import {
  CareerCard,
  FilterSelect,
  InsightRow,
  TopMatchBanner,
  type Career,
} from '@/components/careers/careers'

const CAREERS: Career[] = [
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    match: 92,
    description:
      'Design, build and deploy intelligent systems and production ML models.',
    experience: '3–5 years',
    salary: '$120k – $180k',
    category: 'Artificial Intelligence',
    topSkills: ['Python', 'TensorFlow', 'Machine Learning'],
    missingSkills: ['Kubernetes', 'MLOps'],
    explanation: 'Excellent Python and Machine Learning foundation.',
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    match: 88,
    description:
      'Train, optimize and ship ML pipelines that scale across products.',
    experience: '3–5 years',
    salary: '$115k – $170k',
    category: 'Artificial Intelligence',
    topSkills: ['Python', 'TensorFlow', 'SQL'],
    missingSkills: ['MLOps', 'Spark'],
    explanation: 'Strong modeling skills align well with this role.',
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    match: 84,
    description:
      'Turn raw data into insights and predictive models for the business.',
    experience: '2–4 years',
    salary: '$110k – $160k',
    category: 'Data',
    topSkills: ['Python', 'SQL', 'Statistics'],
    missingSkills: ['Tableau', 'R'],
    explanation: 'Great analytical and Python ecosystem knowledge.',
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    match: 80,
    description:
      'Build reliable APIs, services and data layers that power applications.',
    experience: '2–4 years',
    salary: '$100k – $150k',
    category: 'Engineering',
    topSkills: ['Python', 'FastAPI', 'SQL'],
    missingSkills: ['AWS', 'Docker'],
    explanation: 'Strong backend skills align well with this role.',
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    match: 78,
    description: 'Develop and maintain robust software across the full stack.',
    experience: '2–4 years',
    salary: '$95k – $145k',
    category: 'Engineering',
    topSkills: ['Java', 'C++', 'Git'],
    missingSkills: ['System Design', 'AWS'],
    explanation: 'Solid programming fundamentals across languages.',
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    match: 74,
    description:
      'Design pipelines and infrastructure that move and store data at scale.',
    experience: '2–4 years',
    salary: '$105k – $155k',
    category: 'Data',
    topSkills: ['SQL', 'Python', 'MySQL'],
    missingSkills: ['Spark', 'Airflow'],
    explanation: 'Cloud knowledge needs improvement.',
  },
]

const TOP_MATCH = CAREERS[0]
const HIGHEST = Math.max(...CAREERS.map((c) => c.match))
const AVERAGE = Math.round(
  CAREERS.reduce((sum, c) => sum + c.match, 0) / CAREERS.length,
)

export default function JobsPage() {
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
          value={String(CAREERS.length)}
          icon={Sparkles}
        />
        <MetricTile
          label="Highest Match"
          value={`${HIGHEST}%`}
          sub={TOP_MATCH.title}
          icon={Trophy}
        />
        <MetricTile
          label="Average Match"
          value={`${AVERAGE}%`}
          icon={TrendingUp}
        />
        <MetricTile label="Career Readiness" value="84%" icon={Gauge} />
      </div>

      <TopMatchBanner career={TOP_MATCH} />

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
            {CAREERS.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1" aria-label="Career insights">
          <WidgetCard title="Career Insights" icon={Sparkles}>
            <ul className="space-y-3">
              <InsightRow
                icon={Trophy}
                label="Best Match"
                value="AI Engineer"
              />
              <InsightRow
                icon={Rocket}
                label="Fastest Career Path"
                value="Backend Developer"
              />
              <InsightRow
                icon={Wallet}
                label="Highest Salary"
                value="AI Engineer"
              />
              <InsightRow
                icon={XCircle}
                label="Most Missing Skills"
                value="Data Engineer"
              />
            </ul>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
              <Award
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-xs text-foreground">
                Closing 2 cloud skills could unlock 3 more strong matches.
              </p>
            </div>
          </WidgetCard>
        </aside>
      </div>
    </div>
  )
}
