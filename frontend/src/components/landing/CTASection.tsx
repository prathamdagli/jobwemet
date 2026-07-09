import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Section from './Section'

const TRUST = [
  'Free to start',
  'AI Powered',
  'Personalized',
  'Career Intelligence',
] as const

export default function CTASection() {
  return (
    <Section id="cta" className="bg-white">
      <div className="mx-auto max-w-4xl rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-12 sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight text-background sm:text-4xl lg:text-5xl">
          Ready To Map Your Career With AI?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
          Start free &mdash; upload a resume and see your personalized career
          roadmap in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 bg-background px-7 text-foreground shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md"
          >
            Get Started
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
    </Section>
  )
}
