import HeroBadge from './HeroBadge'
import HeroButtons from './HeroButtons'
import HeroVisual from './HeroVisual'

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 lg:pt-24">
      <div className="mx-auto grid max-w-[1280px] items-start gap-16 lg:gap-20 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-7">
          <HeroBadge />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            AI Maps Your Skills To The{' '}
            <span className="text-primary">Career You&rsquo;re Meant For</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            JobWeMet&rsquo;s AI understands the skills you already have and
            predicts the careers you&rsquo;re genuinely suited for &mdash; in
            seconds, not guesswork.
          </p>
          <p className="max-w-xl text-lg text-muted-foreground">
            It pinpoints the exact skills you&rsquo;re missing, then builds a
            personalized learning path that takes you from where you are to
            fully job-ready.
          </p>
          <HeroButtons />
        </div>
        <div className="relative">
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
