import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock,
  Download,
  Flag,
  Gauge,
  GraduationCap,
  Loader2,
  RefreshCw,
  Route,
  Signal,
  Sparkles,
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
import { InsightRow } from '@/components/careers/careers'
import { RoadmapModule, type ModuleStatus } from '@/components/roadmap/roadmap'
import { Stagger } from '@/motion'
import { cn } from '@/lib/utils'
import { useRoadmap } from '@/hooks/useRoadmap'
import { useProfile } from '@/hooks/useProfile'
import { useAppState } from '@/hooks/useAppState'

const parseHrs = (d: string) => Number(d.replace(/\D/g, '')) || 0
const REMAINING_WEEKS = 4

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

function dotClass(status: ModuleStatus) {
  switch (status) {
    case 'completed':
      return 'bg-foreground'
    case 'current':
      return 'bg-foreground ring-2 ring-foreground/20'
    case 'upcoming':
      return 'bg-muted-foreground/40'
    case 'locked':
      return 'bg-border'
  }
}

/** Keyboard-accessible collapsible built on local state only. */
function Collapsible({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string
  icon: typeof Gauge
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <WidgetCard variant="muted" padding="sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {title}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id={id} className="mt-3">
          {children}
        </div>
      )}
    </WidgetCard>
  )
}

export default function RoadmapPage() {
  const { modules, insights, stats } = useRoadmap()
  const { profile } = useProfile()
  const { loading, error, refresh, activeResumeId, regenerateRoadmap } =
    useAppState()
  const goal = profile.targetCareer || 'your goal'
  const [regenerating, setRegenerating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleRegenerate() {
    if (regenerating) return
    setRegenerating(true)
    try {
      if (activeResumeId) {
        // Regenerate the roadmap for the active resume, then refresh all data.
        await regenerateRoadmap(activeResumeId)
      } else {
        refresh()
      }
    } finally {
      timerRef.current = setTimeout(() => setRegenerating(false), 1600)
    }
  }

  const completed = modules.filter((m) => m.status === 'completed')
  const current = modules.filter((m) => m.status === 'current')
  const totalHrs = modules.reduce((s, m) => s + parseHrs(m.duration), 0)
  const doneHrs = [...completed, ...current].reduce(
    (s, m) => s + parseHrs(m.duration),
    0,
  )
  const currentModule = current[0]
  const estRemaining =
    insights.find((i) => i.label === 'Est. Time Remaining')?.value ?? '4 Weeks'

  const estWeeks = Number(estRemaining.match(/\d+/)?.[0] ?? '4')
  const estDate = new Date()
  estDate.setDate(estDate.getDate() + estWeeks * 7)
  const estCompletionLabel = estDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // View-only projection of milestone dates from the "N Weeks" remaining figure.
  const milestones = useMemo(() => {
    const remaining = modules.filter((m) => m.status !== 'completed')
    const totalRemainingHrs =
      remaining.reduce((s, m) => s + parseHrs(m.duration), 0) || 1
    const daysPerHr = (REMAINING_WEEKS * 7) / totalRemainingHrs
    const start = new Date()
    const offsets = modules.reduce<number[]>((arr, m) => {
      const prev = arr.length ? arr[arr.length - 1] : 0
      arr.push(
        m.status === 'completed'
          ? prev
          : prev + parseHrs(m.duration) * daysPerHr,
      )
      return arr
    }, [])
    return modules.map((m, i) => ({
      module: m,
      date:
        m.status === 'completed'
          ? null
          : (() => {
              const d = new Date(start)
              d.setDate(d.getDate() + offsets[i])
              return d
            })(),
    }))
  }, [modules])

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Learning Roadmap"
        title={`Your path to ${goal}`}
        description={`A personalized, adaptive track from your current skills to ${goal} — completed milestones, what's in progress, and what's next.`}
        lastUpdated={profile.lastUpdated}
        action={
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            size="sm"
            className="gap-1.5"
          >
            {regenerating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {regenerating ? 'Generating…' : 'Regenerate'}
          </Button>
        }
        context={
          <Badge variant="soft" size="sm" className="gap-1">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Est. completion {estCompletionLabel}
          </Badge>
        }
      />

      {loading ? (
        <LoadingState label="Loading your roadmap…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load roadmap"
          description={error}
          onRetry={refresh}
        />
      ) : modules.length === 0 ? (
        <EmptyState
          icon={Route}
          title="No roadmap yet"
          description="Upload your resume and our AI will build a personalized learning track toward your goal career."
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
              label="Modules Completed"
              value={`${completed.length}/${modules.length}`}
              sub="modules done"
              icon={GraduationCap}
            />
            <MetricCard
              variant="sm"
              label="In Progress"
              value={String(current.length)}
              sub={currentModule?.title ?? '—'}
              icon={Route}
            />
            <MetricCard
              variant="sm"
              label="Est. Completion"
              value={estRemaining}
              sub="to finish"
              icon={CalendarDays}
            />
            <MetricCard
              variant="sm"
              label="Total Hours"
              value={`${totalHrs}h`}
              sub={`${doneHrs}h done`}
              icon={Clock}
            />
          </Stagger>

          {/* Dominant column: current-module highlight + premium timeline */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {currentModule && (
                <WidgetCard
                  variant="feature"
                  padding="lg"
                  className="overflow-hidden"
                >
                  <div className="grid gap-5 md:grid-cols-2 md:items-center">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Route className="size-3.5" aria-hidden="true" />
                        Current Module
                      </span>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {currentModule.title}
                      </h2>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                        {currentModule.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" size="sm" className="gap-1">
                          <Clock className="size-3" aria-hidden="true" />
                          {currentModule.duration}
                        </Badge>
                        <Badge variant="soft" size="sm" className="gap-1">
                          <Signal className="size-3" aria-hidden="true" />
                          {currentModule.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          render={<Link to="/courses" />}
                        >
                          Continue Learning
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          render={<Link to="/roadmap" />}
                        >
                          View Full Roadmap
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <CircularProgress
                        value={currentModule.progress ?? 0}
                        size={168}
                        strokeWidth={14}
                        label="Module progress"
                      >
                        <span className="text-4xl font-semibold tracking-tight text-foreground">
                          {currentModule.progress ?? 0}%
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          Complete
                        </span>
                      </CircularProgress>
                    </div>
                  </div>
                </WidgetCard>
              )}

              <WidgetCard title="Roadmap Timeline" icon={Route} padding="lg">
                <Stagger>
                  <ol className="relative list-none p-0 m-0">
                    {modules.map((module, index) => (
                      <RoadmapModule
                        key={module.title}
                        {...module}
                        isLast={index === modules.length - 1}
                      />
                    ))}
                  </ol>
                </Stagger>
              </WidgetCard>
            </div>

            {/* Side panel: milestones + collapsible stats / actions */}
            <aside
              className="space-y-4 lg:col-span-4"
              aria-label="Roadmap details"
            >
              <WidgetCard title="Milestones" icon={Flag} padding="lg">
                <p className="mb-3 text-xs text-muted-foreground">
                  Estimated completion{' '}
                  <span className="font-medium text-foreground">
                    {estCompletionLabel}
                  </span>
                </p>
                <ul className="space-y-0.5">
                  {milestones.map(({ module, date }) => (
                    <li
                      key={module.title}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/40"
                    >
                      <span
                        className={cn(
                          'size-2 shrink-0 rounded-full',
                          dotClass(module.status),
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {module.title}
                      </span>
                      <span className="shrink-0 text-xs">
                        {module.status === 'completed' ? (
                          <Badge variant="muted" size="xs">
                            Done
                          </Badge>
                        ) : module.status === 'current' ? (
                          <Badge variant="default" size="xs">
                            In progress
                          </Badge>
                        ) : module.status === 'locked' ? (
                          <Badge variant="muted" size="xs">
                            Locked
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {date ? fmtDate(date) : ''}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </WidgetCard>

              <Collapsible
                title="Learning Stats"
                icon={Gauge}
                defaultOpen={false}
              >
                <ul className="space-y-2">
                  {stats.map((item) => (
                    <InsightRow
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </ul>
              </Collapsible>

              <Collapsible title="Quick Actions" icon={Sparkles} defaultOpen>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    render={<Link to="/courses" />}
                  >
                    <GraduationCap className="size-4" aria-hidden="true" />
                    Continue Learning
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    render={<Link to="/courses" />}
                  >
                    <BookOpen className="size-4" aria-hidden="true" />
                    View Courses
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download Roadmap
                  </Button>
                </div>
              </Collapsible>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
