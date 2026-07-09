import { motion } from 'motion/react'
import { Brain, Compass, GraduationCap, Target } from 'lucide-react'
import Section from './Section'
import { staggerChildren, staggerContainer, useCountUp } from '@/motion'

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

/** Animated stat value: counts the leading number up, keeps any prefix/suffix. */
function StatNumber({ value }: { value: string }) {
  const match = value.match(/^(\D*)(\d+)(.*)$/)
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

function StatCard({
  value,
  label,
  description,
  icon: Icon,
}: (typeof STATS)[number]) {
  return (
    <motion.div
      variants={staggerChildren}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          <StatNumber value={value} />
        </p>
        <h3 className="mt-1 text-sm font-medium text-foreground">{label}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}

export default function StatsSection() {
  return (
    <Section id="stats" className="bg-white">
      <div className="mx-auto max-w-2xl text-center">
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
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.div>
    </Section>
  )
}
