import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { progressReveal, useInViewReveal } from '@/motion'

interface ProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({
  value,
  label,
  showValue = false,
  size = 'md',
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const { ref, inView } = useInViewReveal<HTMLDivElement>()

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="font-medium tabular-nums text-foreground">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        {/* Fill is sized to the value; progressReveal grows it once via scaleX
            (GPU-friendly) from the left edge — no width animation. */}
        <motion.div
          variants={progressReveal}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{ width: `${clamped}%`, transformOrigin: 'left' }}
          className="h-full rounded-full bg-gradient-to-r from-foreground/70 to-foreground"
        />
      </div>
    </div>
  )
}
