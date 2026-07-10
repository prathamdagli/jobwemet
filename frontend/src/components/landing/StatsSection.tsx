import { motion } from 'motion/react'
import { Brain, Compass, GraduationCap, Target } from 'lucide-react'
import Section from './Section'
import {
  staggerChildren,
  staggerContainer,
  useCountUp,
  useInViewReveal,
} from '@/motion'

const STATS = [
  {
    value: '100+',
    label: 'Career Paths',
    description: 'Different career recommendations available.',
    icon: Compass,
  },
  {
    value: '250+',
    label: 'Skills Recognized',
    description: 'Technical and professional skills analyzed.',
    icon: Brain,
  },
  {
    value: '1000+',
    label: 'Learning Resources',
    description: 'Courses, certifications and learning paths.',
    icon: GraduationCap,
  },
  {
    value: 'Up to 92%',
    label: 'Prediction Confidence',
    description: 'Career prediction confidence using our AI models.',
    icon: Target,
  },
] as const

/** Counts the leading integer up once mounted; keeps any prefix/suffix. */
function CountingNumber({ value }: { value: string }) {
  const match = value.match(/^(\D*)(\d+)(.*)$/)
  const target = match ? Number(match[2]) : 0
  const counted = useCountUp(target, { duration: 1.4, delay: 0.15 })
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

function StatCard({
  value,
  label,
  description,
  icon: Icon,
  active,
}: (typeof STATS)[number] & { active: boolean }) {
  return (
    <motion.div
      variants={staggerChildren}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {active ? <CountingNumber value={value} /> : value}
        </p>
        <div className="mt-1.5">
          <h3 className="inline-block text-sm font-medium text-foreground">
            {label}
          </h3>
          <motion.span
            className="mt-1.5 block h-px w-8 origin-left rounded-full bg-foreground/30"
            initial={{ scaleX: 0 }}
            animate={active ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

/** Faint area graph sitting behind the stat cards — pure decoration. */
function StatsGraph() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-1/2 -z-0 h-48 w-full -translate-y-1/2 text-foreground/[0.04]"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 150 L100 120 L200 140 L320 90 L440 110 L560 60 L700 95 L840 45 L980 80 L1100 40 L1200 70 L1200 200 L0 200 Z"
        fill="currentColor"
      />
      <path
        d="M0 150 L100 120 L200 140 L320 90 L440 110 L560 60 L700 95 L840 45 L980 80 L1100 40 L1200 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function StatsSection() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>({ amount: 0.3 })
  return (
    <Section id="stats">
      <StatsGraph />
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">
          Platform Capabilities
        </p>
        <h2
          id="stats-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Intelligence That Maps You To The Right Career
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Every recommendation is grounded in measurable capability &mdash; not
          vanity metrics. Here is what powers your career map.
        </p>
      </div>

      <motion.div
        ref={ref}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} active={inView} />
        ))}
      </motion.div>
    </Section>
  )
}
