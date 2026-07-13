import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Section from './Section'
import { Link } from 'react-router-dom'
import { scaleIn, useInViewReveal } from '@/motion'
import { useAuth } from '@/hooks/useAuth'

const TRUST = [
  'Free to start',
  'AI Powered',
  'Personalized',
  'Career Intelligence',
] as const

const FLOW = ['Resume', 'Skills', 'Career', 'Roadmap'] as const

function FloatingIndicator({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={`absolute z-10 hidden items-center gap-1.5 rounded-full border border-background/15 bg-background/10 px-3 py-1.5 text-xs font-medium text-background/80 backdrop-blur-sm sm:inline-flex ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

export default function CTASection() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  const { user } = useAuth()
  return (
    <Section id="cta" className="overflow-hidden">
      <motion.div
        ref={ref}
        variants={scaleIn}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-20 text-center text-background sm:px-12 sm:py-24"
      >
        {/* depth layers */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 28%, rgba(255,255,255,0.10), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(40% 40% at 84% 18%, rgba(255,255,255,0.06), transparent 70%), radial-gradient(38% 38% at 14% 88%, rgba(255,255,255,0.05), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* floating indicators */}
        <FloatingIndicator className="left-8 top-10 sm:left-14">
          AI Engineer · 92%
        </FloatingIndicator>
        <FloatingIndicator className="right-8 top-16 sm:right-20">
          5 skills matched
        </FloatingIndicator>
        <FloatingIndicator className="bottom-16 left-10 sm:left-20">
          Free to start
        </FloatingIndicator>
        <FloatingIndicator className="bottom-12 right-8 sm:right-16">
          Roadmap ready
        </FloatingIndicator>

        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
            Ready To Map Your Career With AI?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
            Start free &mdash; upload a resume and see your personalized career
            roadmap in minutes.
          </p>

          {/* small product preview — the flow you're about to start */}
          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2 text-background/80">
            {FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-background/15 bg-background/10 px-3 py-1 text-xs font-medium">
                  {step}
                </span>
                {i < FLOW.length - 1 && (
                  <ArrowRight
                    className="size-3.5 text-background/50"
                    aria-hidden="true"
                  />
                )}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link to={user ? '/dashboard' : '/register'} />}
              className="gap-2 bg-background px-7 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-background/30 bg-transparent px-7 text-background transition-all duration-300 hover:-translate-y-px hover:bg-background/10"
            >
              Explore Platform
            </Button>
          </div>

          <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-background/60">
            {TRUST.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Section>
  )
}
