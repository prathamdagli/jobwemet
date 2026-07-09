import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from './variants'
import { staggerContainer } from './variants'
import { useInViewReveal } from './hooks'

/**
 * `Reveal` — wrap any block so it fades up once when it scrolls into view.
 * The default entrance for section headers and standalone blocks. Built on the
 * shared `fadeUp` variant + `useInViewReveal`, so it respects reduced motion and
 * never repeats on re-scroll.
 */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode
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

/**
 * `Stagger` — wrap a grid/list of `motion` children (each using `staggerChildren`
 * / `cardReveal` / `statReveal` / `timelineReveal` / `listReveal`, with NO own
 * initial/animate) so they cascade in once when scrolled into view. The container
 * carries no visual change of its own; it only orchestrates child timing.
 */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
