import { motion } from 'motion/react'
import { fadeUp, useInViewReveal } from '@/motion'
import {
  CareerReadinessWidget,
  DashboardHeader,
  LearningProgressWidget,
  MissingSkillsWidget,
  RecentActivityWidget,
  RecommendedNextStepWidget,
  ResumeWidget,
  TopCareerMatchWidget,
  TopCareerMatchesWidget,
} from '@/components/dashboard/widgets'

function Reveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
      <DashboardHeader />

      {/* Metrics row */}
      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CareerReadinessWidget />
        <TopCareerMatchWidget />
        <MissingSkillsWidget />
        <LearningProgressWidget />
      </Reveal>

      {/* Detail row */}
      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResumeWidget />
        <RecentActivityWidget />
        <TopCareerMatchesWidget className="md:col-span-2 lg:col-span-2" />
      </Reveal>

      {/* Recommended next step */}
      <Reveal>
        <RecommendedNextStepWidget />
      </Reveal>
    </div>
  )
}
