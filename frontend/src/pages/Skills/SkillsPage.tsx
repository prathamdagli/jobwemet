import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Briefcase,
  Clock,
  Gauge,
  Layers,
  Lightbulb,
  Loader2,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetCard } from '@/components/dashboard/WidgetCard'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { InsightRow } from '@/components/careers/careers'
import {
  CategoryHeader,
  DistributionBar,
  MetricTile,
  SkillRow,
  SoftSkillChip,
  type DistributionItem,
  type TechnicalSkill,
} from '@/components/skills/skills'

const TECHNICAL_SKILLS: TechnicalSkill[] = [
  { name: 'Python', category: 'Programming', confidence: 95 },
  { name: 'Java', category: 'Programming', confidence: 82 },
  { name: 'C++', category: 'Programming', confidence: 78 },
  { name: 'SQL', category: 'Programming', confidence: 88 },
  { name: 'React', category: 'Frameworks', confidence: 91 },
  { name: 'TensorFlow', category: 'Frameworks', confidence: 84 },
  { name: 'FastAPI', category: 'Frameworks', confidence: 79 },
  { name: 'MySQL', category: 'Databases', confidence: 86 },
  { name: 'Firebase', category: 'Databases', confidence: 80 },
  { name: 'AWS', category: 'Cloud', confidence: 62 },
  { name: 'Git', category: 'Tools', confidence: 90 },
  { name: 'Docker', category: 'Tools', confidence: 62 },
  { name: 'VS Code', category: 'Tools', confidence: 94 },
]
const CATEGORIES = ['Programming', 'Frameworks', 'Databases', 'Cloud', 'Tools']
const SOFT_SKILLS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Critical Thinking',
]
const SOFT_CONFIDENCE: Record<string, number> = {
  Leadership: 92,
  Communication: 88,
  'Problem Solving': 95,
  Teamwork: 90,
  'Critical Thinking': 87,
}
const DISTRIBUTION: DistributionItem[] = [
  { label: 'Programming', value: 40 },
  { label: 'Frameworks', value: 25 },
  { label: 'Databases', value: 15 },
  { label: 'Cloud', value: 10 },
  { label: 'Tools', value: 10 },
]
const INSIGHTS = [
  'Strong backend development foundation.',
  'Needs more cloud experience.',
  'Excellent Python ecosystem knowledge.',
  'Docker proficiency can be improved.',
]
const ACTION = {
  strength: 'Python',
  weakness: 'Docker',
  nextSkill: 'Kubernetes',
  improvement: '+12%',
}

function averageOf(skills: TechnicalSkill[]): number {
  if (skills.length === 0) return 0
  const total = skills.reduce((sum, skill) => sum + skill.confidence, 0)
  return Math.round(total / skills.length)
}

export default function SkillsPage() {
  const [analyzing, setAnalyzing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            AI Skill Analysis
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A breakdown of the skills extracted from your resume.
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Last analyzed Jul 8, 2026
          </p>
        </div>
        <Button
          onClick={handleReanalyze}
          disabled={analyzing}
          size="lg"
          className="gap-1.5"
        >
          {analyzing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {analyzing ? 'Analyzing…' : 'Re-analyze Resume'}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Overall Skills"
          value="84%"
          sub="Strong Skill Alignment"
          icon={Gauge}
        />
        <MetricTile
          label="Technical Skills"
          value="13"
          sub="Across 5 Categories"
          icon={Layers}
        />
        <MetricTile
          label="Soft Skills"
          value="5"
          sub="Key Skills Identified"
          icon={Users}
        />
        <MetricTile
          label="Experience Level"
          value="Intermediate"
          sub="2–4 Years Experience"
          icon={Briefcase}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <WidgetCard
          title="Technical Skills"
          icon={Sparkles}
          className="lg:col-span-2"
        >
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              const skills = TECHNICAL_SKILLS.filter(
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
          </div>
        </WidgetCard>

        <WidgetCard title="Soft Skills" icon={Users}>
          <div className="grid grid-cols-1 gap-2">
            {SOFT_SKILLS.map((skill) => (
              <SoftSkillChip
                key={skill}
                name={skill}
                confidence={SOFT_CONFIDENCE[skill] ?? 0}
              />
            ))}
          </div>
          <div className="my-4 border-t border-border" />
          <ul className="space-y-2.5">
            <InsightRow icon={TrendingUp} label="Top Strength" value="Python" />
            <InsightRow icon={Activity} label="Most Used Skill" value="SQL" />
            <InsightRow icon={Rocket} label="Fastest Growing" value="Docker" />
            <InsightRow icon={Sparkles} label="AI Confidence" value="84%" />
          </ul>
        </WidgetCard>

        <WidgetCard title="AI Insights" icon={Lightbulb}>
          <ul className="space-y-3">
            {INSIGHTS.map((text, index) => (
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

        <WidgetCard title="Skill Distribution" icon={BarChart3}>
          <div className="space-y-4">
            {DISTRIBUTION.map((item) => (
              <DistributionBar
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Recommended Actions" icon={Target}>
          <ul className="space-y-3">
            <InsightRow
              icon={TrendingUp}
              label="Top Strength"
              value={ACTION.strength}
            />
            <InsightRow
              icon={AlertTriangle}
              label="Top Weakness"
              value={ACTION.weakness}
            />
            <InsightRow
              icon={Target}
              label="Recommended Next Skill"
              value={ACTION.nextSkill}
            />
            <InsightRow
              icon={ArrowUp}
              label="Estimated Improvement"
              value={ACTION.improvement}
            />
          </ul>
        </WidgetCard>
      </div>
    </div>
  )
}
