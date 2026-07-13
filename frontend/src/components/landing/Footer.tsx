import { motion } from 'motion/react'

import { Link } from 'react-router-dom'
import { fadeUp, useInViewReveal } from '@/motion'

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

const RESOURCE_LINKS = [
  { label: 'Courses', to: '/courses' },
  { label: 'Learning Roadmaps', to: '/roadmap' },
] as const

export default function Footer() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  return (
    <footer
      id="footer"
      className="scroll-mt-20 relative z-10 border-t border-border px-6 py-20 md:py-24"
    >
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="mx-auto max-w-[1280px]"
      >
        {/* Link columns */}
        <div className="grid grid-cols-1 gap-10 pt-12 md:grid-cols-3">
          <div className="md:col-span-1">
            <Link
              to="/"
              aria-label="JobWeMet — home"
              className="group flex w-fit cursor-pointer items-center gap-2.5 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="inline-flex size-9 items-center justify-center">
                <img
                  src="/logo.png"
                  alt="JobWeMet Logo"
                  className="size-9 object-contain"
                />
              </span>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Job<span className="text-primary">WeMet</span>
              </p>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI Career Intelligence that maps your skills to the career
              you&rsquo;re meant for.
            </p>
          </div>

          <nav aria-label="Product">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <ul className="mt-5 space-y-3.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Resources">
            <h3 className="text-sm font-semibold text-foreground">Resources</h3>
            <ul className="mt-5 space-y-3.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 JobWeMet. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for career intelligence.
          </p>
        </div>
      </motion.div>
    </footer>
  )
}
