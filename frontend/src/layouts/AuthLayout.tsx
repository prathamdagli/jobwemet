import { Outlet } from 'react-router-dom'
import { Brain, Check } from 'lucide-react'

const HIGHLIGHTS = [
  'AI-powered skill analysis from your resume',
  'Personalized career roadmaps & course picks',
  'Smart job matching with 96% accuracy',
]

function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <Brain className="size-5 text-white" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">
          JobWeMet
        </span>
      </span>
    </div>
  )
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branded panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 size-80 rounded-full bg-secondary-400/20 blur-3xl"
        />

        <BrandLogo />

        <div className="relative">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white">
            AI Career Intelligence, built around you.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Turn your resume into a clear career path — discover the skills you
            have, the gaps to close, and the roles you're ready for.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <Check className="size-3 text-white" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          © {new Date().getFullYear()} JobWeMet. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <BrandLogo className="mb-8 lg:hidden" />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
