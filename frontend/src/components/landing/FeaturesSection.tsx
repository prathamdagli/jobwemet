import { motion } from 'motion/react'
import {
  BookOpen,
  FileText,
  LineChart,
  Route,
  ScanSearch,
  Sparkles,
} from 'lucide-react'
import Section from './Section'
import { staggerChildren, staggerContainer } from '@/motion'

const FEATURES = [
  {
    title: 'Resume & Skill Analysis',
    description:
      'Upload your resume and instantly extract technical and professional skills using AI-powered analysis.',
    detail: 'PDF, DOCX & LinkedIn',
    icon: FileText,
  },
  {
    title: 'AI Career Prediction',
    description:
      'Discover the careers that best match your skills with confidence-based recommendations.',
    detail: 'Confidence-scored matches',
    icon: Sparkles,
  },
  {
    title: 'Skill Gap Detection',
    description:
      'Identify missing technologies, tools and concepts required for your dream role.',
    detail: 'Role-specific gaps',
    icon: ScanSearch,
  },
  {
    title: 'Personalized Learning Roadmap',
    description:
      'Receive a structured learning roadmap designed specifically for your career goal.',
    detail: 'Step-by-step path',
    icon: Route,
  },
  {
    title: 'Course Recommendations',
    description:
      'Explore curated courses, certifications and learning resources that close your skill gaps.',
    detail: 'Curated by relevance',
    icon: BookOpen,
  },
  {
    title: 'Progress Tracking',
    description:
      'Track your learning journey and measure your readiness for your target career.',
    detail: 'Live readiness score',
    icon: LineChart,
  },
] as const

function FeatureCard({
  title,
  description,
  detail,
  icon: Icon,
  featured = false,
}: (typeof FEATURES)[number] & { featured?: boolean }) {
  if (featured) {
    return (
      <motion.div
        variants={staggerChildren}
        className="group relative flex flex-col gap-4 rounded-2xl border border-foreground bg-foreground p-7 text-background shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/10 text-background">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-semibold text-background">{title}</h3>
        <p className="mt-1 text-sm text-background/70">{description}</p>
        <p className="mt-1 text-xs font-medium text-background/50">{detail}</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerChildren}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
    >
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground/70">
        {detail}
      </p>
    </motion.div>
  )
}

export default function FeaturesSection() {
  return (
    <Section id="features" className="bg-[#FCFCFC]">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">What You Get</p>
        <h2
          id="features-heading"
          className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          From Resume To Ready &mdash; All In One Place
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          JobWeMet analyzes your skills, predicts your best-fit careers, maps
          the gaps, and guides you through every step of learning until
          you&rsquo;re job-ready.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            {...feature}
            featured={i % 2 === 0}
          />
        ))}
      </motion.div>
    </Section>
  )
}
