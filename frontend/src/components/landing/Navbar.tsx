import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
] as const

function BrandLogo() {
  return (
    <span className="flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <rect width="32" height="32" rx="9" className="fill-primary" />
        {/* ascending node network: growth path mapped by intelligence */}
        <path
          d="M7 23 L13 17 L19 20 L25 9"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 17 L17 12"
          fill="none"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="7" cy="23" r="2.1" fill="white" />
        <circle cx="13" cy="17" r="2.1" fill="white" />
        <circle cx="19" cy="20" r="1.8" fill="white" />
        <circle cx="17" cy="12" r="1.6" fill="white" />
        <circle cx="25" cy="9" r="2.6" fill="white" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Job<span className="text-primary">WeMet</span>
      </span>
    </span>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleNavClick = () => setOpen(false)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/80 shadow-sm backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6"
      >
        <a href="#home" className="rounded-md focus-visible:outline-none">
          <BrandLogo />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="relative rounded-sm text-sm font-medium text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all after:duration-300 hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            className="px-5 transition-all duration-300 hover:bg-muted hover:shadow-sm"
          >
            Login
          </Button>
          <Button className="px-5 shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md">
            Get Started
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </nav>

      {/* Mobile drawer — always mounted, animated, inert when closed */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden="true"
          onClick={handleNavClick}
        />
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          inert={!open}
          className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80%] flex-col gap-1 border-l border-border bg-background p-6 shadow-lg transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-md focus-visible:outline-none">
              <BrandLogo />
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={handleNavClick}
            >
              <X className="size-5" />
            </Button>
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={handleNavClick}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-3">
            <Button
              variant="ghost"
              className="transition-all duration-300 hover:bg-muted hover:shadow-sm"
              onClick={handleNavClick}
            >
              Login
            </Button>
            <Button
              className="shadow-sm transition-all duration-300 hover:-translate-y-px hover:shadow-md"
              onClick={handleNavClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
