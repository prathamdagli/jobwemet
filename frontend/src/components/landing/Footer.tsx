import { motion } from 'motion/react'
import { Code, Send, Sparkles, Users } from 'lucide-react'
import { fadeUp, useInViewReveal } from '@/motion'

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Statistics', href: '#stats' },
  { label: 'About', href: '#about' },
]

const RESOURCE_LINKS = [
  { label: 'Courses', href: '#' },
  { label: 'Learning Roadmaps', href: '#' },
  { label: 'Blog', href: '#' },
  { label: 'Help Center', href: '#' },
]

const LEGAL_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Contact', href: '#' },
]

const SOCIALS = [
  { label: 'GitHub', href: '#', icon: Code },
  { label: 'LinkedIn', href: '#', icon: Users },
  { label: 'Twitter', href: '#', icon: Send },
] as const

export default function Footer() {
  const { ref, inView } = useInViewReveal<HTMLDivElement>()
  return (
    <footer
      id="footer"
      className="scroll-mt-20 border-t border-border bg-[#FCFCFC] px-6 py-20 md:py-24"
    >
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="mx-auto max-w-[1280px]"
      >
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-foreground text-background">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                Job<span className="text-primary">WeMet</span>
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI Career Intelligence that maps your skills to the career
              you&rsquo;re meant for.
            </p>
            <div className="mt-5 flex gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <social.icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
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

          <nav aria-label="Legal">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-5 space-y-3.5">
              {LEGAL_LINKS.map((link) => (
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
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
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
