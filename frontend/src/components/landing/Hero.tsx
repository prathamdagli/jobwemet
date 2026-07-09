import { motion } from 'motion/react'
import {
  fadeLeft,
  heroReveal,
  staggerContainer,
  useInViewReveal,
} from '@/motion'
import HeroBadge from './HeroBadge'
import HeroButtons from './HeroButtons'
import HeroVisual from './HeroVisual'
import HeroSecondaryPreview from './HeroSecondaryPreview'

export default function Hero() {
  const { ref: visualRef, inView: visualInView } =
    useInViewReveal<HTMLDivElement>()

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#FCFCFC] px-6 pb-28 pt-20 lg:pt-24"
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 lg:gap-20 lg:grid-cols-2">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col items-start gap-7"
        >
          <motion.div variants={heroReveal}>
            <HeroBadge />
          </motion.div>
          <motion.h1
            variants={heroReveal}
            className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            AI Maps Your Skills To The{' '}
            <span className="text-primary">Career You&rsquo;re Meant For</span>
          </motion.h1>
          <motion.div variants={heroReveal} className="space-y-4">
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
          </motion.div>
          <motion.div variants={heroReveal}>
            <HeroButtons />
          </motion.div>
          <motion.div variants={heroReveal} className="w-full pt-2">
            <p className="text-sm font-medium text-primary">
              JobWeMet Intelligence
            </p>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              A real look at the workspace &mdash; your skills, matches, and
              roadmap in one view.
            </p>
            <div className="mt-6">
              <HeroSecondaryPreview />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={visualRef}
          variants={fadeLeft}
          initial="hidden"
          animate={visualInView ? 'visible' : 'hidden'}
          className="relative"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  )
}
