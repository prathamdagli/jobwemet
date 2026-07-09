import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Download,
  Gauge,
  GraduationCap,
  Loader2,
  RefreshCw,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricTile } from '@/components/skills/skills'
import { InsightRow } from '@/components/careers/careers'
import { RoadmapModule } from '@/components/roadmap/roadmap'
import { Reveal, Stagger, staggerContainer } from '@/motion'
import { useRoadmap } from '@/hooks/useRoadmap'

export default function RoadmapPage() {
  const { modules, insights, stats } = useRoadmap()
  const [regenerating, setRegenerating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleRegenerate() {
    if (regenerating) return
    setRegenerating(true)
    timerRef.current = setTimeout(() => setRegenerating(false), 1600)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      <Reveal>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Learning Roadmap
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your personalized path from current skills to your target career.
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="size-3.5" aria-hidden="true" />
              Target Career: AI Engineer
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Last generated Jul 9, 2026
            </p>
          </div>
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            size="lg"
            className="gap-1.5"
          >
            {regenerating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {regenerating ? 'Generating…' : 'Regenerate Roadmap'}
          </Button>
        </header>
      </Reveal>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Overall Progress" value="68%" icon={Gauge} />
        <MetricTile
          label="Modules Completed"
          value="7 / 12"
          icon={GraduationCap}
        />
        <MetricTile label="Current Module" value="Docker" icon={Route} />
        <MetricTile label="Est. Completion" value="4 Weeks" icon={Clock} />
      </Stagger>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WidgetCard title="Your Roadmap" icon={Route}>
            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="relative"
            >
              {modules.map((module, index) => (
                <RoadmapModule
                  key={module.title}
                  {...module}
                  isLast={index === modules.length - 1}
                />
              ))}
            </motion.ol>
          </WidgetCard>
        </div>

        <aside className="lg:col-span-1 space-y-4" aria-label="Roadmap details">
          <WidgetCard title="Roadmap Insights" icon={Sparkles}>
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
          </WidgetCard>

          <WidgetCard title="Learning Stats" icon={Gauge}>
            <ul className="space-y-3">
              {stats.map((item) => (
                <InsightRow
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </ul>
          </WidgetCard>

          <WidgetCard title="Quick Actions" icon={Sparkles}>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="gap-1.5"
                render={<Link to="/courses" />}
              >
                <GraduationCap className="size-4" aria-hidden="true" />
                Continue Learning
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-1.5"
                render={<Link to="/courses" />}
              >
                <BookOpen className="size-4" aria-hidden="true" />
                View Courses
              </Button>
              <Button size="lg" variant="outline" className="gap-1.5" disabled>
                <Download className="size-4" aria-hidden="true" />
                Download Roadmap
              </Button>
            </div>
          </WidgetCard>
        </aside>
      </div>
    </div>
  )
}
