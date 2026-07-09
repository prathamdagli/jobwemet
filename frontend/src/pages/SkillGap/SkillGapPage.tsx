import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Gauge,
  ListOrdered,
  Loader2,
  PieChart,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { DistributionBar, MetricTile } from '@/components/skills/skills'
import {
  PriorityItem,
  RecommendationItem,
  SkillCategoryGroup,
} from '@/components/skillgap/skillgap'

const DETECTED = [
  { category: 'Programming', skills: ['Python', 'Java', 'SQL', 'C++'] },
  { category: 'Frameworks', skills: ['React', 'TensorFlow', 'FastAPI'] },
  { category: 'Databases', skills: ['MySQL', 'Firebase'] },
  { category: 'Tools', skills: ['Git', 'Docker'] },
]

const MISSING = [
  { category: 'Cloud', skills: ['AWS', 'Azure'] },
  { category: 'DevOps', skills: ['Kubernetes', 'CI/CD'] },
  { category: 'AI', skills: ['LLMs', 'LangChain'] },
]

const COVERAGE = [
  { label: 'Programming', value: 95 },
  { label: 'Frameworks', value: 82 },
  { label: 'Databases', value: 80 },
  { label: 'Cloud', value: 30 },
  { label: 'DevOps', value: 25 },
  { label: 'AI', value: 55 },
]

const PRIORITY = [
  {
    skill: 'Docker',
    priority: 'High' as const,
    time: '6 hrs',
    difficulty: 'Easy',
  },
  {
    skill: 'Kubernetes',
    priority: 'High' as const,
    time: '12 hrs',
    difficulty: 'Hard',
  },
  {
    skill: 'AWS',
    priority: 'Medium' as const,
    time: '15 hrs',
    difficulty: 'Medium',
  },
  {
    skill: 'LangChain',
    priority: 'Medium' as const,
    time: '10 hrs',
    difficulty: 'Medium',
  },
]

const RECOMMENDATIONS = [
  'Learn Docker before Kubernetes.',
  'AWS knowledge will significantly improve your AI Engineer match.',
  'TensorFlow is already strong.',
  'Focus on Cloud technologies next.',
]

export default function SkillGapPage() {
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
            Skill Gap Analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See what you have, what's missing, and what to learn next.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCw className="size-3.5" aria-hidden="true" />
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
          {refreshing ? 'Refreshing…' : 'Refresh Analysis'}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Detected Skills" value="18" icon={CheckCircle2} />
        <MetricTile label="Missing Skills" value="7" icon={AlertTriangle} />
        <MetricTile label="Coverage" value="72%" icon={PieChart} />
        <MetricTile label="Career Readiness" value="84%" icon={Gauge} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WidgetCard title="Detected Skills" icon={CheckCircle2}>
          <div className="space-y-4">
            {DETECTED.map((group) => (
              <SkillCategoryGroup
                key={group.category}
                title={group.category}
                skills={group.skills}
                tone="detected"
              />
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Missing Skills" icon={AlertTriangle}>
          <div className="space-y-4">
            {MISSING.map((group) => (
              <SkillCategoryGroup
                key={group.category}
                title={group.category}
                skills={group.skills}
                tone="missing"
              />
            ))}
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetCard
          title="Priority Skills"
          icon={ListOrdered}
          className="lg:col-span-2"
        >
          <ol className="space-y-3">
            {PRIORITY.map((item, index) => (
              <PriorityItem
                key={item.skill}
                rank={index + 1}
                skill={item.skill}
                priority={item.priority}
                time={item.time}
                difficulty={item.difficulty}
              />
            ))}
          </ol>
        </WidgetCard>

        <WidgetCard title="AI Recommendations" icon={Sparkles}>
          <ul className="space-y-3">
            {RECOMMENDATIONS.map((text, index) => (
              <RecommendationItem key={index} text={text} />
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard
          title="Skill Coverage"
          icon={BarChart3}
          className="lg:col-span-3"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COVERAGE.map((item) => (
              <DistributionBar
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
