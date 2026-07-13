import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Search,
  Settings as SettingsIcon,
  Sun,
  User as UserIcon,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buttonHover, fadeIn, iconHover } from '@/motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useAppState } from '@/hooks/useAppState'
import { useNotifications } from '@/hooks/useNotifications'
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

/**
 * Generic popover: a trigger plus a panel, closed on outside-click and Escape.
 * Focus returns to the trigger on Escape for keyboard accessibility.
 */
function Dropdown({
  trigger,
  children,
  align = 'right',
  label,
}: {
  trigger: (props: {
    open: boolean
    toggle: () => void
    ref: React.Ref<HTMLButtonElement>
  }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  label: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), ref: triggerRef })}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12 }}
          role="menu"
          aria-label={label}
          className={cn(
            'absolute top-full z-50 mt-2 min-w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children(() => setOpen(false))}
        </motion.div>
      )}
    </div>
  )
}
const USER_MENU_ITEMS = [
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
] as const

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const name = user?.displayName ?? user?.email?.split('@')[0] ?? 'User'
  const email = user?.email ?? ''
  const initials = getUserInitials(user?.displayName, user?.email)

  return (
    <Dropdown
      label="User menu"
      align="right"
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
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
              <span className="block text-xs text-muted-foreground">
                {email}
              </span>
            )}
          </span>
          <ChevronDown
            className="hidden size-4 text-muted-foreground transition-transform group-hover/button:rotate-180 sm:block"
            aria-hidden="true"
          />
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center gap-3 px-2.5 py-2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {name}
              </p>
              {email && (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              )}
            </div>
          </div>
          <div className="my-1 h-px bg-border" />
          {USER_MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
            >
              <item.icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              {item.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              await logout()
              navigate('/')
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <LogOut
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Logout
          </button>
        </div>
      )}
    </Dropdown>
  )
}

function NotificationsMenu() {
  const { items, unreadCount, markAllRead } = useNotifications()
  return (
    <Dropdown
      label="Notifications"
      align="right"
      trigger={({ toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          aria-label={`Notifications${
            unreadCount ? `, ${unreadCount} unread` : ''
          }`}
          aria-haspopup="menu"
          onClick={toggle}
          {...iconHover}
          className="relative inline-flex"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-2 rounded-full bg-primary" />
          )}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllRead()
                  close()
                }}
                className="text-xs font-medium text-foreground/70 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="my-1 h-px bg-border" />
          {items.length === 0 ? (
            <p className="px-2.5 py-6 text-center text-sm text-muted-foreground">
              You're all caught up.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item, i) => {
                const Icon = item.icon
                return (
                  <li
                    key={`${item.title}-${i}`}
                    className={cn(
                      'flex items-start gap-3 rounded-md px-2.5 py-2.5',
                      item.unread && 'bg-primary/5',
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {Icon ? (
                        <Icon className="size-4" aria-hidden="true" />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                    {item.unread && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </Dropdown>
  )
}

function ThemeToggle() {
  const { settings, putSettings } = useAppState()
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const [optimisticTheme, setOptimisticTheme] = useState<string | null>(null)
  const currentTheme = optimisticTheme || settings?.theme || 'system'
  const isDark =
    currentTheme === 'dark' || (currentTheme === 'system' && systemPrefersDark)

  function toggleTheme() {
    const next = isDark ? 'light' : 'dark'
    setOptimisticTheme(next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    void putSettings({ theme: next }).finally(() => setOptimisticTheme(null))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
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
          <Link
            to="/"
            className="cursor-pointer font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            JobWeMet
          </Link>
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
          aria-label="Search (coming soon)"
          placeholder="Search… (coming soon)"
          className="pl-9 cursor-not-allowed opacity-50"
          readOnly
          title="Search is coming soon"
        />
      </motion.div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <NotificationsMenu />
        <ThemeToggle />
        <div
          className="mx-1 hidden h-6 w-px bg-border sm:block"
          aria-hidden="true"
        />
        <UserMenu />
      </div>
    </header>
  )
}
