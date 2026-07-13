import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { pageTransition } from '@/motion'
import { cn } from '@/lib/utils'
import { Brain } from 'lucide-react'
import AuthShowcase from '@/components/auth/AuthShowcase'

function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="JobWeMet — home"
      className={cn(
        'cursor-pointer rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        className,
      )}
    >
      <span className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <Brain className="size-5 text-white" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">
          JobWeMet
        </span>
      </span>
    </Link>
  )
}

export default function AuthLayout() {
  const location = useLocation()
  return (
    <div className="grid min-h-screen overflow-hidden md:grid-cols-2">
      {/* Left: premium monochrome "enter the workspace" showcase (desktop/tablet) */}
      <AuthShowcase />

      {/* Right: the auth form — unchanged */}
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center md:hidden">
            <BrandLogo />
            <p className="mt-3 text-sm text-muted-foreground">
              One intelligent workspace that maps your skills to the career
              you&rsquo;re meant for.
            </p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
