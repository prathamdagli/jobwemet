import { motion } from 'motion/react'
import {
  BookOpen,
  FileText,
  LineChart,
  Route,
  ScanSearch,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Section from './Section'
import { staggerChildren, staggerContainer } from '@/motion'

type PreviewKind =
  'resume' | 'match' | 'gap' | 'roadmap' | 'courses' | 'progress'

const FEATURES: {
  title: string
  description: string
  detail: string
  icon: LucideIcon
  preview: PreviewKind
}[] = [
  {
    title: 'Resume & Skill Analysis',
    description:
      'Upload your resume and instantly extract technical and professional skills using AI-powered analysis.',
    detail: 'PDF, DOCX & LinkedIn',
    icon: FileText,
    preview: 'resume',
  },
  {
    title: 'AI Career Prediction',
    description:
      'Discover the careers that best match your skills with confidence-based recommendations.',
    detail: 'Confidence-scored matches',
    icon: Sparkles,
    preview: 'match',
  },
  {
    title: 'Skill Gap Detection',
    description:
      'Identify missing technologies, tools and concepts required for your dream role.',
    detail: 'Role-specific gaps',
    icon: ScanSearch,
    preview: 'gap',
  },
  {
    title: 'Personalized Learning Roadmap',
    description:
      'Receive a structured learning roadmap designed specifically for your career goal.',
    detail: 'Step-by-step path',
    icon: Route,
    preview: 'roadmap',
  },
  {
    title: 'Course Recommendations',
    description:
      'Explore curated courses, certifications and learning resources that close your skill gaps.',
    detail: 'Curated by relevance',
    icon: BookOpen,
    preview: 'courses',
  },
  {
    title: 'Progress Tracking',
    description:
      'Track your learning journey and measure your readiness for your target career.',
    detail: 'Live readiness score',
    icon: LineChart,
    preview: 'progress',
  },
]

/** Tiny in-card "product module" previews — each feature gets its own UI. */
function Preview({ kind }: { kind: PreviewKind }) {
  if (kind === 'resume') {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-foreground">
            <FileText className="size-3.5" aria-hidden="true" /> resume.pdf
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Parsed
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {['Python', 'React', 'SQL'].map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (kind === 'match') {
    return (
      <div className="space-y-2.5">
        {[
          { r: 'AI Engineer', p: 92 },
          { r: 'ML Engineer', p: 84 },
        ].map((m) => (
          <div key={m.r}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{m.r}</span>
              <span className="text-muted-foreground">{m.p}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: `${m.p}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (kind === 'gap') {
    return (
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {['TensorFlow', 'Docker', 'Kubernetes'].map((g) => (
          <li key={g} className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" />
            {g}
            <span className="ml-auto rounded-full border border-border px-1.5 py-0.5 text-[10px]">
              gap
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (kind === 'roadmap') {
    return (
      <ol className="space-y-0">
        {['Machine Learning', 'Deep Learning', 'MLOps'].map((t, i, a) => (
          <li key={t} className="flex gap-2.5">
            <span className="flex flex-col items-center">
              <span
                className={
                  i === a.length - 1
                    ? 'size-3 rounded-full border border-border'
                    : 'size-3 rounded-full bg-foreground'
                }
              />
              {i < a.length - 1 && (
                <span className="my-1 w-px flex-1 bg-border" />
              )}
            </span>
            <span className="pb-3 text-xs text-foreground">{t}</span>
          </li>
        ))}
      </ol>
    )
  }

  if (kind === 'courses') {
    return (
      <div className="space-y-1.5">
        {['Deep Learning Spec.', 'Docker Fundamentals', 'Advanced React'].map(
          (c) => (
            <div
              key={c}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs"
            >
              <span className="truncate text-foreground">{c}</span>
              <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                curated
              </span>
            </div>
          ),
        )}
      </div>
    )
  }

  // progress
  const pts = [10, 14, 11, 18, 15, 24, 22, 30]
  const w = 120
  const h = 36
  const step = w / (pts.length - 1)
  const path = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - p}`)
    .join(' ')
  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-9 w-full text-foreground/25"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={path}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Readiness</span>
        <span className="font-semibold text-foreground">68%</span>
      </div>
    </div>
  )
}

function FeatureCard({
  title,
  description,
  detail,
  icon: Icon,
  preview,
  featured = false,
}: (typeof FEATURES)[number] & { featured?: boolean }) {
  return (
    <motion.div
      variants={staggerChildren}
      className={cn(
        // Shared surface: every card is identical in bg, radius, padding and
        // shadow family + hover behaviour. Only emphasis differs.
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-card p-7 transition-all duration-300 hover:-translate-y-1',
        featured
          ? 'border-2 border-foreground/20 shadow-md hover:border-foreground/35 hover:shadow-lg'
          : 'border border-border shadow-sm hover:border-foreground/25 hover:shadow-md',
      )}
    >
      {/* animated top accent line — always on for the core feature, reveals on
          hover for the rest. Monochrome, GPU transform only. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left bg-gradient-to-r from-foreground/60 to-foreground/10 transition-transform duration-500 ease-out',
          featured ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />

      {/* soft spotlight — only on the core feature, very subtle */}
      {featured && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 45% at 50% 0%, color-mix(in oklch, var(--foreground) 5%, transparent), transparent 70%)',
          }}
        />
      )}

      {/* Core Feature badge */}
      {featured && (
        <span className="absolute right-5 top-5 inline-flex items-center rounded-full border border-foreground/20 bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground">
          Core Feature
        </span>
      )}

      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:rotate-3',
          featured ? 'size-14' : 'size-12',
        )}
      >
        <Icon className={featured ? 'size-7' : 'size-6'} aria-hidden="true" />
      </span>

      <div className="relative">
        <h3
          className={cn(
            'font-semibold text-foreground',
            featured ? 'text-xl' : 'text-lg',
          )}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="relative">
        <Preview kind={preview} />
      </div>

      <p className="relative mt-1 text-xs font-medium text-muted-foreground/70">
        {detail}
      </p>
    </motion.div>
  )
}

export default function FeaturesSection() {
  return (
    <Section id="features">
      <div className="relative mx-auto max-w-2xl text-center">
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
          <FeatureCard key={feature.title} {...feature} featured={i === 0} />
        ))}
      </motion.div>
    </Section>
  )
}
