import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { pageTransition } from '@/motion'
import Sidebar from '@/components/dashboard/Sidebar'
import Topbar from '@/components/dashboard/Topbar'
import { useAppState } from '@/hooks/useAppState'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024,
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { isRegenerating, data } = useAppState()

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
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

          <AnimatePresence>
            {isRegenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
                  <Loader2
                    className="size-10 animate-spin text-primary"
                    aria-hidden="true"
                  />
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Rebuilding your path
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      Processing your new goal ({data.profile.targetCareer}).
                      Please wait while we generate your missing skills,
                      roadmap, and recommended courses...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
