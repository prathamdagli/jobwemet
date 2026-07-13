import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  dashboardNav,
  logoutNavItem,
  type NavItem,
} from '@/config/dashboardNav'
import { drawerTransition, iconHover } from '@/motion'
import { useAuth } from '@/hooks/useAuth'

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      aria-label="JobWeMet — home"
      className="flex h-16 cursor-pointer items-center gap-2 px-4 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
          <path
            d="M7 23 L13 17 L19 20 L25 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!collapsed && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Job<span className="text-primary">WeMet</span>
        </span>
      )}
    </Link>
  )
}

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[colors,transform] duration-200 hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          collapsed && 'justify-center px-0',
          isActive
            ? 'text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 -z-10 rounded-lg bg-accent"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <motion.span
            {...iconHover}
            className="flex size-5 shrink-0 items-center justify-center"
          >
            <item.icon className="size-5" aria-hidden="true" />
          </motion.span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      title={collapsed ? logoutNavItem.label : undefined}
      aria-label={logoutNavItem.label}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
        collapsed && 'justify-center px-0',
      )}
    >
      <motion.span
        {...iconHover}
        className="flex size-5 shrink-0 items-center justify-center"
      >
        <logoutNavItem.icon className="size-5" aria-hidden="true" />
      </motion.span>
      {!collapsed && <span>{logoutNavItem.label}</span>}
    </button>
  )
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <BrandMark collapsed={collapsed} />
      <nav
        aria-label="Dashboard"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {dashboardNav.map((item) => (
          <NavItemLink
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  )
}

export interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Static sidebar — tablet & desktop */}
      <aside
        className={cn(
          'hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-300 md:flex',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile slide-over drawer — left-anchored */}
      <div
        className={cn('md:hidden', mobileOpen ? '' : 'pointer-events-none')}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onCloseMobile}
          className={cn(
            'fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
        />
        <motion.aside
          aria-label="Sidebar"
          inert={!mobileOpen}
          variants={drawerTransition}
          initial="hidden"
          animate={mobileOpen ? 'visible' : 'exit'}
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-border bg-card shadow-xl',
          )}
        >
          <SidebarContent collapsed={false} onNavigate={onCloseMobile} />
        </motion.aside>
      </div>
    </>
  )
}
