import { useEffect, useRef, useState } from 'react'
import {
  Award,
  CalendarDays,
  Clock,
  Flame,
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
import {
  CourseCard,
  SidebarStat,
  type Course,
} from '@/components/courses/courses'

const COURSES: Course[] = [
  {
    id: 'docker-fundamentals',
    title: 'Docker Fundamentals',
    platform: 'Coursera',
    instructor: 'Cloud Academy',
    difficulty: 'Beginner',
    duration: '6 Hours',
    rating: 4.7,
    skills: ['Docker', 'Containers', 'DevOps'],
    description:
      'Containerize applications and master the core Docker workflow from image to run.',
  },
  {
    id: 'aws-cloud-essentials',
    title: 'AWS Cloud Essentials',
    platform: 'Udemy',
    instructor: 'AWS Training',
    difficulty: 'Intermediate',
    duration: '8 Hours',
    rating: 4.6,
    skills: ['AWS', 'Cloud', 'EC2'],
    description:
      'Core AWS services for building scalable, resilient cloud deployments.',
  },
  {
    id: 'kubernetes-for-developers',
    title: 'Kubernetes for Developers',
    platform: 'KodeKloud',
    instructor: 'Mumshad Mannambeth',
    difficulty: 'Intermediate',
    duration: '10 Hours',
    rating: 4.8,
    skills: ['Kubernetes', 'Orchestration', 'DevOps'],
    description:
      'Deploy, scale and manage containers with Kubernetes in practice.',
  },
  {
    id: 'langchain-crash-course',
    title: 'LangChain Crash Course',
    platform: 'YouTube',
    instructor: 'freeCodeCamp',
    difficulty: 'Beginner',
    duration: '4 Hours',
    rating: 4.5,
    skills: ['LangChain', 'LLMs', 'Python'],
    description: 'Build LLM-powered applications quickly with LangChain.',
  },
  {
    id: 'mlops-fundamentals',
    title: 'MLOps Fundamentals',
    platform: 'Coursera',
    instructor: 'Andrew Ng',
    difficulty: 'Advanced',
    duration: '12 Hours',
    rating: 4.7,
    skills: ['MLOps', 'CI/CD', 'Monitoring'],
    description: 'Productionize machine learning pipelines end to end.',
  },
  {
    id: 'system-design-basics',
    title: 'System Design Basics',
    platform: 'Educative',
    instructor: 'Educative',
    difficulty: 'Intermediate',
    duration: '9 Hours',
    rating: 4.6,
    skills: ['System Design', 'Scalability', 'Architecture'],
    description: 'Design scalable, reliable systems with confidence.',
  },
]

const AI_INSIGHTS = [
  'Learning Docker first unlocks three future roadmap modules.',
  'AWS improves AI Engineer compatibility by 8%.',
  'LangChain is optional but recommended.',
]

export default function CoursesPage() {
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
            {COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-4" aria-label="Course insights">
          <WidgetCard title="Learning Overview" icon={Sparkles}>
            <ul className="space-y-3">
              <SidebarStat
                icon={Award}
                label="Most Recommended Skill"
                value="Docker"
              />
              <SidebarStat
                icon={GraduationCap}
                label="Learning Progress"
                value="65%"
                progress={65}
              />
              <SidebarStat icon={Clock} label="Weekly Goal" value="5 hrs" />
              <SidebarStat
                icon={CalendarDays}
                label="Est. Completion"
                value="4 Weeks"
              />
              <SidebarStat
                icon={Flame}
                label="Learning Streak"
                value="12 Days"
              />
            </ul>
          </WidgetCard>

          <WidgetCard title="AI Insights" icon={Sparkles}>
            <ul className="space-y-3">
              {AI_INSIGHTS.map((text, index) => (
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
