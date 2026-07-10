import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Crown,
  Gauge,
  Layers,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { CircularProgress } from '@/components/dashboard/CircularProgress'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { InsightRow } from '@/components/careers/careers'
import {
  CategoryHeader,
  SkillRow,
  SoftSkillChip,
  type TechnicalSkill,
} from '@/components/skills/skills'
import { useSkills } from '@/hooks/useSkills'
import { Stagger, useCountUp } from '@/motion'

function averageOf(skills: TechnicalSkill[]): number {
  if (skills.length === 0) return 0
  const total = skills.reduce((sum, skill) => sum + skill.confidence, 0)
  return Math.round(total / skills.length)
}

// Monochrome opacity steps so the composition bar reads as one system.
const SEGMENT_OPACITY = [0.9, 0.7, 0.52, 0.36, 0.24]

export default function SkillsPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    technicalSkills,
    categories,
    softSkills,
    distribution,
    insights,
    action,
  } = useSkills()
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )
  function handleReanalyze() {
    if (analyzing) return
    setAnalyzing(true)
    timerRef.current = setTimeout(() => setAnalyzing(false), 1600)
  }

  const avgConfidence = averageOf(technicalSkills)
  const skillGaps = technicalSkills.filter((s) => s.confidence < 70).length
  const topStrengths = [...technicalSkills]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
      <PageHeader
        eyebrow="AI Skill Analysis"
        title="Your skill profile"
        description="A confidence-weighted breakdown of the technical and soft skills extracted from your resume — what you've mastered, where the gaps are, and what to learn next."
        lastUpdated="Jul 8, 2026"
        action={
          <Button
            onClick={handleReanalyze}
            disabled={analyzing}
            size="sm"
            className="gap-1.5"
          >
            {analyzing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="size-4" aria-hidden="true" />
            )}
            {analyzing ? 'Analyzing…' : 'Re-analyze'}
          </Button>
        }
        context={
          <Badge variant="soft" size="xs" className="gap-1.5">
            <Gauge className="size-3" aria-hidden="true" />
            {avgConfidence}% avg confidence
          </Badge>
        }
      />

      {/* KPI row — small variant tiles */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          variant="sm"
          label="Skills Analyzed"
          value={String(technicalSkills.length)}
          sub={`across ${categories.length} categories`}
          icon={Layers}
        />
        <MetricCard
          variant="sm"
          label="Avg Confidence"
          value={`${avgConfidence}%`}
          sub="AI-calculated"
          icon={Gauge}
        />
        <MetricCard
          variant="sm"
          label="Categories"
          value={String(categories.length)}
          sub="distinct domains"
          icon={Sparkles}
        />
        <MetricCard
          variant="sm"
          label="Skill Gaps"
          value={String(skillGaps)}
          sub="below 70% confidence"
          icon={AlertTriangle}
        />
      </Stagger>

      {/* Dominant visualization + side panel — asymmetric */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          variant="feature"
          padding="lg"
          className="lg:col-span-8"
          title="Skill Confidence Overview"
          icon={Gauge}
          action={
            <Badge variant="soft" size="xs">
              {topStrengths[0]?.name} · top strength
            </Badge>
          }
        >
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div className="flex flex-col items-center justify-center text-center">
              <CircularProgress
                value={avgConfidence}
                size={200}
                strokeWidth={16}
                label="Overall confidence"
              >
                <span className="text-5xl font-semibold tracking-tight text-foreground">
                  {Math.round(useCountUp(avgConfidence))}%
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Avg Confidence
                </span>
              </CircularProgress>
              <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Confidence is the AI&apos;s weighted estimate of proficiency
                derived from your resume — higher means the skill shows up
                consistently and at depth.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-muted-foreground">
                Confidence by category
              </p>
              <Stagger className="space-y-3.5">
                {categories.map((category) => {
                  const skills = technicalSkills.filter(
                    (skill) => skill.category === category,
                  )
                  const average = averageOf(skills)
                  return (
                    <div key={category}>
                      <CategoryHeader
                        category={category}
                        count={skills.length}
                        average={average}
                      />
                      <ProgressBar value={average} size="sm" className="mt-2" />
                    </div>
                  )
                })}
              </Stagger>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard
          className="lg:col-span-4"
          padding="lg"
          title="Top Strengths"
          icon={Crown}
        >
          <ol className="space-y-1">
            {topStrengths.map((skill, i) => (
              <li key={skill.name} className="flex items-center gap-2.5">
                <span className="w-4 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <SkillRow skill={skill} />
                </div>
              </li>
            ))}
          </ol>
        </WidgetCard>
      </div>

      {/* Technical detail + soft skills */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          className="lg:col-span-8"
          padding="lg"
          title="Technical Skills"
          icon={Sparkles}
        >
          <Stagger className="space-y-8">
            {categories.map((category) => {
              const skills = technicalSkills.filter(
                (skill) => skill.category === category,
              )
              const average = averageOf(skills)
              return (
                <section key={category}>
                  <CategoryHeader
                    category={category}
                    count={skills.length}
                    average={average}
                  />
                  <ProgressBar value={average} className="mt-2" />
                  <div className="mt-1 divide-y divide-border">
                    {skills.map((skill) => (
                      <SkillRow key={skill.name} skill={skill} />
                    ))}
                  </div>
                </section>
              )
            })}
          </Stagger>
        </WidgetCard>

        <WidgetCard
          variant="muted"
          className="lg:col-span-4"
          padding="lg"
          title="Soft Skills"
          icon={Users}
        >
          <Stagger className="grid grid-cols-1 gap-2.5">
            {softSkills.map((skill) => (
              <SoftSkillChip
                key={skill.name}
                name={skill.name}
                confidence={skill.confidence}
              />
            ))}
          </Stagger>
        </WidgetCard>
      </div>

      {/* Distribution + insights */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <WidgetCard
          variant="feature"
          className="lg:col-span-8"
          padding="lg"
          title="Skill Distribution"
          icon={BarChart3}
          action={
            <Badge variant="muted" size="xs">
              {distribution.length} areas
            </Badge>
          }
        >
          <div>
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label="Composition of your skills by category"
            >
              {distribution.map((item, i) => (
                <div
                  key={item.label}
                  className="h-full bg-foreground transition-opacity"
                  style={{
                    width: `${item.value}%`,
                    opacity: SEGMENT_OPACITY[i % SEGMENT_OPACITY.length],
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {distribution.map((item, i) => (
                <li
                  key={item.label}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span
                    className="size-2 rounded-full bg-foreground"
                    style={{
                      opacity: SEGMENT_OPACITY[i % SEGMENT_OPACITY.length],
                    }}
                  />
                  {item.label}
                  <span className="font-medium text-foreground">
                    {item.value}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </WidgetCard>

        <WidgetCard
          className="lg:col-span-4"
          padding="lg"
          title="AI Insights"
          icon={Lightbulb}
        >
          <ul className="space-y-3">
            {insights.map((text, index) => (
              <li key={index} className="flex gap-2.5">
                <Lightbulb
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span className="text-sm text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard
          className="lg:col-span-12"
          padding="lg"
          title="Recommended Actions"
          icon={Target}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InsightRow
              icon={TrendingUp}
              label="Top Strength"
              value={action.strength}
            />
            <InsightRow
              icon={AlertTriangle}
              label="Top Weakness"
              value={action.weakness}
            />
            <InsightRow
              icon={Target}
              label="Recommended Next Skill"
              value={action.nextSkill}
            />
            <InsightRow
              icon={ArrowUp}
              label="Estimated Improvement"
              value={action.improvement}
            />
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
