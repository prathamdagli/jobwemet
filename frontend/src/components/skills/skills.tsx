import type { LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import {
  Blocks,
  Brain,
  Cloud,
  Code,
  Crown,
  Database,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/dashboard/ProgressBar'
import { cn } from '@/lib/utils'
import {
  GESTURE_LIMITS,
  springSnappy,
  statReveal,
  listReveal,
  useCountUp,
} from '@/motion'

export interface TechnicalSkill {
  name: string
  category: string
  confidence: number
}

export interface DistributionItem {
  label: string
  value: number
}

/** Count a numeric metric up once on mount; non-numeric values render as-is. */
function CountValue({ value }: { value: string }) {
  const match = value.match(/^(\D*?)(\d+)(.*)$/)
  const target = match ? Number(match[2]) : 0
  const counted = useCountUp(target)
  if (!match) return <>{value}</>
  const [, prefix, , suffix] = match
  return (
    <>
      {prefix}
      {Math.round(counted)}
      {suffix}
    </>
  )
}

export function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  icon?: LucideIcon
}) {
  return (
    <motion.div
      variants={statReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="size-4" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        <CountValue value={value} />
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  )
}

function levelFor(value: number) {
  if (value >= 90) return { label: 'Expert', variant: 'secondary' as const }
  if (value >= 80) return { label: 'Advanced', variant: 'outline' as const }
  if (value >= 65) return { label: 'Intermediate', variant: 'muted' as const }
  return { label: 'Beginner', variant: 'muted' as const }
}

function microDetail(value: number): string {
  if (value >= 88) return 'Last used recently'
  if (value >= 75) return 'Frequently detected'
  return 'Needs improvement'
}

function ProficiencyDots({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(5, Math.round((value / 100) * 5)))
  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Proficiency ${value} out of 100`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'size-1.5 rounded-full',
            i < filled ? 'bg-foreground' : 'bg-border',
          )}
        />
      ))}
    </span>
  )
}

export function SkillRow({ skill }: { skill: TechnicalSkill }) {
  const level = levelFor(skill.confidence)
  return (
    <motion.div
      variants={listReveal}
      className="-mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {skill.name}
          </span>
          <Badge variant={level.variant} size="xs">
            {level.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {microDetail(skill.confidence)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ProficiencyDots value={skill.confidence} />
        <span className="w-10 text-right text-sm font-medium tabular-nums text-foreground">
          {skill.confidence}%
        </span>
      </div>
    </motion.div>
  )
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Programming: Code,
  Frameworks: Blocks,
  Databases: Database,
  Cloud: Cloud,
  Tools: Wrench,
}

export function CategoryHeader({
  category,
  count,
  average,
}: {
  category: string
  count: number
  average: number
}) {
  const Icon = CATEGORY_ICONS[category] ?? Code
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-lg bg-foreground/10">
          <Icon className="size-3.5 text-foreground" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {category}
        </h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count} skills
        </span>
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {average}% avg
      </span>
    </div>
  )
}

const SOFT_ICONS: Record<string, LucideIcon> = {
  Leadership: Crown,
  Communication: MessageCircle,
  'Problem Solving': Lightbulb,
  Teamwork: Users,
  'Critical Thinking': Brain,
}

export function SoftSkillChip({
  name,
  confidence,
}: {
  name: string
  confidence: number
}) {
  const Icon = SOFT_ICONS[name] ?? Sparkles
  return (
    <motion.div
      variants={listReveal}
      className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10">
        <Icon className="size-4 text-foreground" aria-hidden="true" />
      </span>
      <span className="truncate text-sm font-medium text-foreground">
        {name}
      </span>
      <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">
        {confidence}%
      </span>
    </motion.div>
  )
}

export function DistributionBar({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <Badge variant="muted" size="xs">
          {value}%
        </Badge>
      </div>
      <ProgressBar value={value} />
    </div>
  )
}
