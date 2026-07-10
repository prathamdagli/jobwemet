import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeft,
  Search,
  Sun,
} from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buttonHover, fadeIn, iconHover } from '@/motion'
import { useAuth } from '@/hooks/useAuth'
import { dashboardNav } from '@/config/dashboardNav'

function getUserInitials(
  displayName?: string | null,
  email?: string | null,
): string {
  const name = displayName?.trim()
  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return 'U'
}

function UserMenu() {
  const { user } = useAuth()
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? 'User'
  const email = user?.email ?? ''
  const initials = getUserInitials(user?.displayName, user?.email)

  return (
    <motion.button
      type="button"
      aria-haspopup="menu"
      aria-expanded={false}
      {...buttonHover}
      className="group/button flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          className="size-8 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
      )}
      <span className="hidden text-left leading-tight sm:block">
        <span className="block text-sm font-medium text-foreground">
          {name}
        </span>
        {email && (
          <span className="block text-xs text-muted-foreground">{email}</span>
        )}
      </span>
      <ChevronDown
        className="hidden size-4 text-muted-foreground transition-transform group-hover/button:rotate-180 sm:block"
        aria-hidden="true"
      />
    </motion.button>
  )
}

export interface TopbarProps {
  onOpenMobile: () => void
  onToggleCollapse: () => void
}

export default function Topbar({
  onOpenMobile,
  onToggleCollapse,
}: TopbarProps) {
  const { pathname } = useLocation()
  const current =
    dashboardNav.find((item) => item.to === pathname)?.label ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
          onClick={onOpenMobile}
        >
          <Menu className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label="Toggle sidebar"
          onClick={onToggleCollapse}
        >
          <PanelLeft className="size-5" />
        </Button>
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1.5 text-sm lg:flex"
        >
          <span className="font-medium text-muted-foreground">JobWeMet</span>
          <ChevronRight className="size-3.5 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{current}</span>
        </nav>
      </div>

      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative hidden max-w-md flex-1 sm:block"
      >
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search"
          placeholder="Search…"
          className="pl-9"
        />
      </motion.div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <motion.span {...iconHover} className="inline-flex">
            <Bell className="size-5" />
          </motion.span>
          <span
            className="absolute right-2 top-2 size-2 rounded-full bg-primary"
            aria-hidden="true"
          />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Sun className="size-5" />
        </Button>
        <div
          className="mx-1 hidden h-6 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <UserMenu />
      </div>
    </header>
  )
}
