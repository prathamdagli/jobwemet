import type { LucideIcon } from 'lucide-react'
import { ProgressBar } from '@/components/dashboard/ProgressBar'

export interface TechnicalSkill {
  name: string
  category: string
  confidence: number
}

export interface DistributionItem {
  label: string
  value: number
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
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon className="size-4" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export function SkillConfidenceRow({
  name,
  confidence,
}: {
  name: string
  confidence: number
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {confidence}%
        </span>
      </div>
      <ProgressBar value={confidence} />
    </div>
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
        <span className="text-xs font-medium text-muted-foreground">
          {value}%
        </span>
      </div>
      <ProgressBar value={value} />
    </div>
  )
}
