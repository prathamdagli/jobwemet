import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { slow, useInViewReveal, usePrefersReducedMotion } from '@/motion'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
  children?: ReactNode
}

/**
 * Monochrome radial progress adapted from the 21st.dev "Animated Radial
 * Chart" / "Circle Progress" pattern: an SVG track plus a rounded,
 * stroke-dashoffset-driven arc. Kept grayscale to match the design system.
 */
export function CircularProgress({
  value,
  size = 132,
  strokeWidth = 12,
  label,
  className,
  children,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  const { ref, inView } = useInViewReveal<SVGSVGElement>()
  const prefersReduced = usePrefersReducedMotion()

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `${clamped}%`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Arc "draws" once on first reveal by animating strokeDashoffset from
            empty (circumference) to the target offset. */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{
            strokeDashoffset: prefersReduced ? offset : circumference,
          }}
          animate={{ strokeDashoffset: inView ? offset : circumference }}
          transition={slow}
          className="stroke-foreground"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  )
}
