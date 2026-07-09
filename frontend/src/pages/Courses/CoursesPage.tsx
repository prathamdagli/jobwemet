import { useEffect, useRef, useState } from 'react'
import {
  Award,
  Clock,
  GraduationCap,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricTile } from '@/components/skills/skills'
import { FilterSelect } from '@/components/careers/careers'
import { CourseCard, SidebarStat } from '@/components/courses/courses'
import { useCourses } from '@/hooks/useCourses'

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

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            AI Course Recommendations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Curated courses picked to close your skill gaps and hit your goals.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            Target Career: AI Engineer
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
        <MetricTile label="Recommended Courses" value="18" icon={Sparkles} />
        <MetricTile label="Skills Covered" value="12" icon={Award} />
        <MetricTile label="Estimated Hours" value="126 Hours" icon={Clock} />
        <MetricTile
          label="Career Match Improvement"
          value="+18%"
          icon={TrendingUp}
        />
      </div>

      <WidgetCard title="Filters" icon={GraduationCap}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <FilterSelect
            label="Skill"
            options={['All skills', 'Docker', 'AWS', 'Kubernetes', 'LangChain']}
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-4" aria-label="Course insights">
          <WidgetCard title="Learning Overview" icon={Sparkles}>
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
                <li key={index} className="flex gap-2.5">
                  <Sparkles
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-foreground">{text}</span>
                </li>
              ))}
            </ul>
          </WidgetCard>
        </aside>
      </div>
    </div>
  )
}
