import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Flag,
  GraduationCap,
  Loader2,
  RefreshCw,
  Route,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingState } from '@/components/common/LoadingState'
import { RegeneratingState } from '@/components/common/RegeneratingState'
import { RoadmapModule, type ModuleStatus } from '@/components/roadmap/roadmap'
import { Stagger } from '@/motion'
import { cn } from '@/lib/utils'
import { useRoadmap } from '@/hooks/useRoadmap'
import { useProfile } from '@/hooks/useProfile'
import { useCourses } from '@/hooks/useCourses'
import { useAppState } from '@/hooks/useAppState'

function dotClass(status: ModuleStatus) {
  switch (status) {
    case 'completed':
      return 'bg-foreground'
    case 'current':
      return 'bg-foreground ring-2 ring-foreground/20'
    default:
      return 'bg-muted-foreground/40'
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
  icon: LucideIcon
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
  const { modules } = useRoadmap()
  const { courses } = useCourses()
  const { profile } = useProfile()
  const {
    loading,
    isRegenerating,
    error,
    refresh,
    activeResumeId,
    regenerateRoadmap,
  } = useAppState()
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
  const currentModule = current[0]
  const hasProgress = completed.length > 0

  // Link each roadmap module to the courses that build its required skills.
  const coursesBySkill = new Map<string, { title: string; url: string }[]>()
  for (const course of courses) {
    const skill = course.skills[0]
    if (!coursesBySkill.has(skill)) coursesBySkill.set(skill, [])
    coursesBySkill.get(skill)!.push({ title: course.title, url: course.url })
  }
  const coursesFor = (skills: string[] = []) =>
    skills.flatMap((s) => coursesBySkill.get(s) ?? []).filter((c) => c.url)

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow={modules.length > 0 ? 'Learning Roadmap' : undefined}
        title={modules.length > 0 ? `Your path to ${goal}` : 'Learning Roadmap'}
        description={
          modules.length > 0
            ? `A personalized track from your current skills to ${goal} — what's in progress and what's next.`
            : 'Plan your journey from your current skills to your goal career.'
        }
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
            {regenerating ? 'Generating…' : 'Regenerate Roadmap'}
          </Button>
        }
        context={
          <Badge variant="soft" size="sm" className="gap-1">
            <Route className="size-3.5" aria-hidden="true" />
            {modules.length} modules
          </Badge>
        }
      />

      {isRegenerating ? (
        <RegeneratingState targetCareer={profile.targetCareer} />
      ) : loading ? (
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
          description={
            <div className="mt-2 text-left inline-block">
              No roadmap has been generated. To generate a roadmap:
              <ol className="list-decimal pl-5 mt-3 space-y-1 text-sm text-muted-foreground text-left">
                <li>Upload a resume</li>
                <li>Choose your career goal</li>
                <li>AI analyzes your skills</li>
                <li>Personalized roadmap appears</li>
              </ol>
            </div>
          }
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
          </Stagger>

          {!hasProgress && (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              No learning progress recorded yet. Complete modules to track your
              journey to {goal}.
            </div>
          )}

          {/* Dominant column: current-module highlight + timeline */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              {currentModule && (
                <WidgetCard
                  variant="feature"
                  padding="lg"
                  className="overflow-hidden"
                >
                  <div className="grid gap-5">
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
                        <Badge variant="soft" size="sm" className="gap-1">
                          <Flag className="size-3" aria-hidden="true" />
                          {currentModule.difficulty}
                        </Badge>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          render={
                            <Link
                              to={
                                currentModule.skills?.length
                                  ? `/courses?skill=${encodeURIComponent(currentModule.skills[0])}`
                                  : '/courses'
                              }
                            />
                          }
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
                        recommendedCourses={coursesFor(module.skills)}
                        isLast={index === modules.length - 1}
                      />
                    ))}
                  </ol>
                </Stagger>
              </WidgetCard>
            </div>

            {/* Side panel: milestones + quick actions */}
            <aside
              className="space-y-4 lg:col-span-4"
              aria-label="Roadmap details"
            >
              <WidgetCard title="Milestones" icon={Flag} padding="lg">
                <ul className="space-y-0.5">
                  {modules.map((module) => (
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
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Upcoming
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </WidgetCard>

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
                </div>
              </Collapsible>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
