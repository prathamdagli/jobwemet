import { useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Clock,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { FilterSelect } from '@/components/careers/careers'
import {
  CourseCard,
  SidebarStat,
  DIFFICULTY_BADGE,
  courseProgress,
  type Course,
} from '@/components/courses/courses'
import { useCourses } from '@/hooks/useCourses'
import {
  Reveal,
  Stagger,
  cardReveal,
  GESTURE_LIMITS,
  springSnappy,
} from '@/motion'

/** Deterministic AI-match score (85–98%) derived from a course id. */
function courseMatch(id: string): number {
  let h = 0
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) % 1000
  return 85 + (h % 14)
}

function SectionTitle({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon
  title: string
  hint?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}

/** Highlighted "Recommended by AI" card — distinct editorial treatment. */
function RecommendedCourse({
  course,
  match,
}: {
  course: Course
  match: number
}) {
  const headingId = `rec-${course.id}-title`
  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      aria-labelledby={headingId}
      className="flex flex-col overflow-hidden rounded-2xl border border-foreground/15 bg-card shadow-sm transition-[box-shadow,border-color] duration-300 hover:shadow-md"
    >
      <div className="flex items-center gap-4 border-b border-border bg-foreground/[0.02] p-5">
        <CircularProgress
          value={match}
          size={64}
          strokeWidth={7}
          label="AI match"
        >
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {match}%
          </span>
        </CircularProgress>
        <div className="min-w-0">
          <Badge variant="soft" size="xs" className="gap-1">
            <Sparkles className="size-3" aria-hidden="true" />
            AI Pick
          </Badge>
          <h3
            id={headingId}
            className="mt-1.5 truncate text-base font-semibold tracking-tight text-foreground"
          >
            {course.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {course.platform} · {course.difficulty}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-3.5" aria-hidden="true" />
            {course.rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
          <Button size="sm" className="flex-1" render={<Link to="/courses" />}>
            Start
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

/** Compact item for the "Recently Viewed" horizontal scroll row. */
function RecentCourseItem({ course }: { course: Course }) {
  return (
    <Link
      to="/courses"
      className="group flex w-64 shrink-0 snap-start items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-foreground/15 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/50 transition-colors group-hover:bg-foreground/10">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {course.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {course.platform} · {course.duration}
        </span>
      </span>
    </Link>
  )
}

export default function CoursesPage() {
  const { courses, aiInsights, sidebarStats } = useCourses()
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

  // Derived KPIs (no data-hook changes — computed from the returned array).
  const totalHours = useMemo(
    () => courses.reduce((sum, c) => sum + (parseInt(c.duration, 10) || 0), 0),
    [courses],
  )
  const avgRating = useMemo(
    () =>
      courses.length
        ? (
            courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
          ).toFixed(1)
        : '0.0',
    [courses],
  )

  // Partition the list into editorial sections (featured + grouped rows).
  const [featured, ...rest] = courses
  const continueLearning = rest.slice(0, 3)
  const recommended = rest.slice(3, 5)
  const recentlyViewed = [rest[1], rest[2], rest[4], rest[0]].filter(
    Boolean,
  ) as Course[]
  const featuredMatch = featured ? courseMatch(featured.id) : 0
  const featuredProgress = featured ? courseProgress(featured) : 0

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="Courses"
        title="AI Course Recommendations"
        description="Curated courses picked to close your skill gaps and keep you on track for your AI Engineer goal."
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
            Target Career:{' '}
            <span className="font-medium text-foreground">AI Engineer</span>
          </span>
        }
      />

      <Reveal>
        <WidgetCard variant="muted" padding="sm">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <FilterSelect
              label="Skill"
              options={[
                'All skills',
                'Docker',
                'AWS',
                'Kubernetes',
                'LangChain',
              ]}
            />
            <FilterSelect
              label="Difficulty"
              options={['All levels', 'Beginner', 'Intermediate', 'Advanced']}
            />
            <FilterSelect
              label="Platform"
              options={[
                'All platforms',
                'Coursera',
                'Udemy',
                'KodeKloud',
                'YouTube',
              ]}
            />
            <FilterSelect
              label="Duration"
              options={['Any', 'Under 5 hrs', '5–10 hrs', '10+ hrs']}
            />
            <FilterSelect
              label="Sort"
              options={['Best match', 'Rating', 'Duration', 'Difficulty']}
            />
          </div>
        </WidgetCard>
      </Reveal>

      {/* KPI row */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          variant="sm"
          label="Recommended"
          value={String(courses.length)}
          sub="for your goal"
          icon={Sparkles}
        />
        <MetricCard
          variant="sm"
          label="Total Hours"
          value={`${totalHours} hrs`}
          sub="to complete"
          icon={Clock}
        />
        <MetricCard
          variant="sm"
          label="Avg Rating"
          value={avgRating}
          sub="across picks"
          icon={Star}
        />
        <MetricCard
          variant="sm"
          label="Career Match"
          value="+18%"
          sub="since last week"
          icon={TrendingUp}
          trend={{ value: '+18%', positive: true }}
        />
      </Stagger>

      {/* Dominant featured course + side panel (asymmetric 12-col grid) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {featured && (
          <WidgetCard variant="feature" padding="lg" className="lg:col-span-8">
            <div className="grid gap-6 md:grid-cols-5 md:items-center">
              {/* Cover / match */}
              <div className="relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-foreground/[0.04] to-transparent p-6 md:col-span-2">
                <Badge variant="soft" size="sm" className="gap-1">
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  Featured
                </Badge>
                <CircularProgress
                  value={featuredMatch}
                  size={132}
                  strokeWidth={12}
                  label="AI match"
                >
                  <span className="text-3xl font-semibold tabular-nums text-foreground">
                    {featuredMatch}%
                  </span>
                  <span className="mt-1 text-[0.65rem] text-muted-foreground">
                    AI Match
                  </span>
                </CircularProgress>
                <span className="text-xs text-muted-foreground">
                  {featured.platform}
                </span>
              </div>

              {/* Editorial details */}
              <div className="md:col-span-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={DIFFICULTY_BADGE[featured.difficulty]}
                    size="sm"
                  >
                    {featured.difficulty}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {featured.skills[0]}
                  </Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {featured.platform} · {featured.instructor}
                </p>
                <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {featured.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {featured.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="size-3.5" aria-hidden="true" />
                    {featured.rating.toFixed(1)}
                  </span>
                  <span>{featured.skills.length} skills covered</span>
                </div>
                <div className="mt-4 max-w-sm">
                  <ProgressBar
                    value={featuredProgress}
                    label="Your progress"
                    showValue
                    size="sm"
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="lg"
                    className="gap-1.5"
                    render={<Link to="/courses" />}
                  >
                    Continue Learning
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Save Course
                  </Button>
                </div>
              </div>
            </div>
          </WidgetCard>
        )}

        <aside className="space-y-4 lg:col-span-4" aria-label="Course insights">
          <WidgetCard title="Learning Overview" icon={Sparkles} variant="muted">
            <ul className="space-y-3">
              {sidebarStats.map((item) => (
                <SidebarStat
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  progress={item.progress}
                />
              ))}
            </ul>
          </WidgetCard>

          <WidgetCard title="AI Insights" icon={Sparkles}>
            <ul className="space-y-3">
              {aiInsights.map((text, index) => (
                <li
                  key={index}
                  className="flex gap-2.5 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
                >
                  <Sparkles
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </WidgetCard>
        </aside>
      </div>

      {/* Continue Learning */}
      <section aria-label="Continue Learning">
        <SectionTitle
          icon={GraduationCap}
          title="Continue Learning"
          hint="Pick up where you left off"
        />
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {continueLearning.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Stagger>
      </section>

      {/* Recommended by AI */}
      <section aria-label="Recommended by AI">
        <SectionTitle
          icon={Sparkles}
          title="Recommended by AI"
          hint="Curated for your goal"
        />
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {recommended.map((course) => (
            <RecommendedCourse
              key={course.id}
              course={course}
              match={courseMatch(course.id)}
            />
          ))}
        </Stagger>
      </section>

      {/* Recently Viewed — contained horizontal scroll-snap row */}
      <section aria-label="Recently Viewed">
        <SectionTitle
          icon={Clock}
          title="Recently Viewed"
          hint="Across your devices"
        />
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
          {recentlyViewed.map((course) => (
            <RecentCourseItem key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  )
}
