import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  BookOpen,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  UploadCloud,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { RegeneratingState } from '@/components/common/RegeneratingState'
import {
  FilterSelect,
  type FilterSelectProps,
} from '@/components/careers/careers'
import {
  CourseCard,
  DIFFICULTY_BADGE,
  type Course,
} from '@/components/courses/courses'
import { useCourses } from '@/hooks/useCourses'
import { useProfile } from '@/hooks/useProfile'
import { useAppState } from '@/hooks/useAppState'
import { Reveal, Stagger } from '@/motion'

/** Highlighted recommended course — clean card, no fabricated rating metrics. */
function FeaturedCourse({
  course,
  saved,
  onToggleSave,
  onViewSkill,
}: {
  course: Course
  saved: boolean
  onToggleSave: (id: string) => void
  onViewSkill: (skill: string) => void
}) {
  const headingId = `featured-${course.id}-title`
  return (
    <div
      aria-labelledby={headingId}
      className="flex flex-col overflow-hidden rounded-2xl border border-foreground/15 bg-card shadow-sm"
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:gap-7">
        <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-muted/70 to-muted">
          <BookOpen className="size-9 text-foreground/25" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="soft" size="sm" className="gap-1">
              <Sparkles className="size-3" aria-hidden="true" />
              AI Recommended
            </Badge>
            <Badge variant={DIFFICULTY_BADGE[course.difficulty]} size="sm">
              {course.difficulty}
            </Badge>
            <Badge variant="outline" size="sm">
              {course.platform}
            </Badge>
          </div>
          <h2
            id={headingId}
            className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {course.title}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm leading-relaxed text-muted-foreground">
            <Sparkles
              className="size-3.5 shrink-0 text-foreground/50"
              aria-hidden="true"
            />
            {course.reason}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {course.skills.map((skill) => (
              <Badge key={skill} variant="muted" size="xs">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {course.url ? (
              <Button
                size="sm"
                className="gap-1.5"
                render={
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Start Course
              </Button>
            ) : (
              <Button size="sm" disabled>
                Start Course
              </Button>
            )}
            <Button
              size="sm"
              variant={saved ? 'secondary' : 'outline'}
              aria-pressed={saved}
              onClick={() => onToggleSave(course.id)}
            >
              {saved ? 'Saved' : 'Save Course'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() => onViewSkill(course.skills[0])}
            >
              View Courses
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const { courses, summary } = useCourses()
  const { profile } = useProfile()
  const {
    loading,
    isRegenerating,
    error,
    refresh,
    activeResumeId,
    recommendCourses,
    settings,
    putSettings,
  } = useAppState()
  const goal = profile.targetCareer || 'your goal'
  const [refreshing, setRefreshing] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const skillParam = searchParams.get('skill')
  const [filters, setFilters] = useState<Record<string, string>>({
    Difficulty: 'All levels',
    Platform: 'All platforms',
    Sort: 'Best match',
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // The skill filter is driven directly by the ?skill= deep-link (used by the
  // roadmap "View Courses" links) so no effect-sync is needed.
  const skillFilter = skillParam ?? 'All skills'

  function setSkill(skill: string) {
    if (skill === 'All skills') setSearchParams({})
    else setSearchParams({ skill })
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    try {
      if (activeResumeId) {
        await recommendCourses(activeResumeId)
      } else {
        refresh()
      }
    } finally {
      timerRef.current = setTimeout(() => setRefreshing(false), 1600)
    }
  }

  const savedIds = useMemo(
    () => new Set(settings?.savedCourses ?? []),
    [settings],
  )

  async function handleToggleSave(id: string) {
    const current = settings?.savedCourses ?? []
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id]
    await putSettings({ savedCourses: next })
  }

  // Real filter + sort options derived from the data, never hardcoded.
  const skillOptions = useMemo(
    () => [
      'All skills',
      ...Array.from(new Set(courses.map((c) => c.skills[0]))),
    ],
    [courses],
  )
  const platformOptions = useMemo(
    () => ['All platforms', ...summary.platforms],
    [summary.platforms],
  )

  const visibleCourses = useMemo(() => {
    const out = courses.filter((c) => {
      if (
        filters.Platform !== 'All platforms' &&
        c.platform !== filters.Platform
      )
        return false
      if (
        filters.Difficulty !== 'All levels' &&
        c.difficulty !== filters.Difficulty
      )
        return false
      if (skillFilter !== 'All skills' && !c.skills.includes(skillFilter))
        return false
      return true
    })
    const sorted = [...out]
    switch (filters.Sort) {
      case 'Duration':
        sorted.sort(
          (a, b) => parseInt(a.duration, 10) - parseInt(b.duration, 10),
        )
        break
      case 'Difficulty':
        sorted.sort((a, b) => a.difficulty.localeCompare(b.difficulty))
        break
      default:
        break
    }
    return sorted
  }, [courses, filters, skillFilter])

  const [featured, ...rest] = visibleCourses

  const filterConfig: FilterSelectProps[] = [
    {
      label: 'Skill',
      options: skillOptions,
      value: skillFilter,
      onChange: setSkill,
    },
    {
      label: 'Difficulty',
      options: ['All levels', 'Beginner', 'Intermediate', 'Advanced'],
      value: filters.Difficulty,
      onChange: (v) => setFilters((f) => ({ ...f, Difficulty: v })),
    },
    {
      label: 'Platform',
      options: platformOptions,
      value: filters.Platform,
      onChange: (v) => setFilters((f) => ({ ...f, Platform: v })),
    },
    {
      label: 'Sort',
      options: ['Best match', 'Duration', 'Difficulty'],
      value: filters.Sort,
      onChange: (v) => setFilters((f) => ({ ...f, Sort: v })),
    },
  ]

  const skillFiltered = skillFilter !== 'All skills'

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Courses"
        title="AI Course Recommendations"
        description={`Curated courses picked to close your skill gaps and keep you on track for your ${goal} goal.`}
        lastUpdated={profile.lastUpdated}
        action={
          courses.length > 0 ? (
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
              {refreshing ? 'Refreshing…' : 'Regenerate Recommendations'}
            </Button>
          ) : undefined
        }
        context={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Target Career:{' '}
            <span className="font-medium text-foreground">{goal}</span>
          </span>
        }
      />

      {isRegenerating ? (
        <RegeneratingState targetCareer={profile.targetCareer} />
      ) : loading ? (
        <LoadingState label="Loading your courses…" />
      ) : error ? (
        <ErrorState
          title="Couldn't load courses"
          description={error}
          onRetry={refresh}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No course recommendations yet"
          description={
            <div className="mt-2 text-left inline-block">
              No course recommendations yet. To get personalized courses:
              <ol className="list-decimal pl-5 mt-3 space-y-1 text-sm text-muted-foreground text-left">
                <li>Upload a resume</li>
                <li>Choose your career goal</li>
                <li>AI analyzes your skill gap</li>
                <li>Personalized courses appear</li>
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
          {/* Real summary stats — derived from the data, no fabricated metrics */}
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <MetricCard
              variant="sm"
              label="Recommended Courses"
              value={String(summary.total)}
              sub="for your goal"
              icon={GraduationCap}
            />
            <MetricCard
              variant="sm"
              label="Free vs Paid"
              value={`${summary.free} free · ${summary.paid} paid`}
              sub="by access"
              icon={Sparkles}
            />
            <MetricCard
              variant="sm"
              label="Platforms available"
              value={String(summary.platforms.length)}
              sub={summary.platforms.join(', ')}
              icon={BookOpen}
            />
            <MetricCard
              variant="sm"
              label="Missing skills covered"
              value={String(summary.missingSkillsCovered)}
              sub="from your gap"
              icon={Target}
            />
            <MetricCard
              variant="sm"
              label="Target Career"
              value={goal}
              sub="your selected goal"
              icon={Target}
            />
          </Stagger>

          <Reveal>
            <WidgetCard variant="muted" padding="sm">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {filterConfig.map((cfg) => (
                  <FilterSelect key={cfg.label} {...cfg} />
                ))}
              </div>
            </WidgetCard>
          </Reveal>

          {skillFiltered && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5">
              <p className="text-sm text-muted-foreground">
                Courses that build{' '}
                <span className="font-medium text-foreground">
                  {skillFilter}
                </span>{' '}
                — part of your roadmap to {goal}.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSkill('All skills')}
              >
                Clear filter
              </Button>
            </div>
          )}

          {featured && (
            <FeaturedCourse
              course={featured}
              saved={savedIds.has(featured.id)}
              onToggleSave={handleToggleSave}
              onViewSkill={(skill) => {
                setSkill(skill)
              }}
            />
          )}

          <section aria-label="All course recommendations">
            {rest.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses match the current filters.
              </p>
            ) : (
              <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    saved={savedIds.has(course.id)}
                    onToggleSave={handleToggleSave}
                    onOpenSkill={
                      skillFiltered
                        ? undefined
                        : (skill) => {
                            setSkill(skill)
                          }
                    }
                  />
                ))}
              </Stagger>
            )}
          </section>
        </>
      )}
    </div>
  )
}
