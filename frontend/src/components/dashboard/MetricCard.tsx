import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { GESTURE_LIMITS, springSnappy, statReveal, useCountUp } from '@/motion'

const metricVariants = cva(
  'group relative flex rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,border-color] duration-300 hover:border-foreground/15 hover:shadow-md',
  {
    variants: {
      variant: {
        sm: 'flex-col gap-2 p-4',
        md: 'flex-col gap-3 p-5',
        lg: 'flex-col gap-3 p-6',
        wide: 'flex-row items-center justify-between gap-4 p-5',
      },
      tone: {
        default: 'bg-card',
        muted: 'bg-muted/40',
      },
    },
    defaultVariants: { variant: 'md', tone: 'default' },
  },
)

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

export interface MetricCardProps extends VariantProps<typeof metricVariants> {
  label: string
  value: string
  sub?: string
  icon?: LucideIcon
  trend?: { value: string; positive?: boolean }
  accent?: boolean
  className?: string
  children?: ReactNode
}

/**
 * KPI tile with small / medium / large / wide variants. `accent` (pair with
 * `variant="lg"`) produces the "feature" treatment — the single dominant
 * metric on a page. Numbers count up via the shared motion system.
 */
export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  accent,
  variant,
  tone,
  className,
  children,
}: MetricCardProps) {
  const isWide = variant === 'wide'
  const valueSize =
    variant === 'lg' ? 'text-4xl' : variant === 'sm' ? 'text-2xl' : 'text-3xl'

  return (
    <motion.div
      variants={statReveal}
      whileHover={{ y: GESTURE_LIMITS.maxTranslateY }}
      transition={springSnappy}
      className={cn(
        metricVariants({ variant, tone }),
        accent && 'border-foreground/15 bg-foreground/[0.03]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          !isWide && 'mb-0.5',
        )}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          <span>{label}</span>
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div className={cn(isWide && 'text-right')}>
        <p
          className={cn(
            'font-semibold tracking-tight text-foreground',
            valueSize,
          )}
        >
          <CountValue value={value} />
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </motion.div>
  )
}
