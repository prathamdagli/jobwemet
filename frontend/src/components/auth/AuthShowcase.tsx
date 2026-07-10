import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Brain } from 'lucide-react'
import { useMouseTilt, usePrefersReducedMotion } from '@/motion'
import { cn } from '@/lib/utils'

/**
 * AuthShowcase — the left panel of the auth layout, reimagined as an onboarding
 * experience rather than another marketing hero.
 *
 * The brief: the user is *entering* the AI workspace, so the centrepiece is a
 * living "Digital AI Core": floating concentric rings, orbiting skill capsules,
 * an animated particle field, subtle neural connections, rotating data-stream
 * rings, a breathing radial glow, a scan-line sweep, and a mouse-reactive 3D
 * parallax. Around it sit only the JobWeMet logo, a welcome heading, and one
 * short sentence. Dark, monochrome, and fully reduced-motion aware.
 */

/* ------------------------------------------------------------------ */
/*  Primitive: a floating concentric ring (solid or dashed)            */
/* ------------------------------------------------------------------ */
function FloatRing({
  diameter,
  dashed = false,
  borderClass,
  duration,
  direction,
  depth = 0,
  spin = true,
  prefersReduced,
}: {
  diameter: string
  dashed?: boolean
  borderClass: string
  duration: number
  direction: 1 | -1
  depth?: number
  spin?: boolean
  prefersReduced: boolean
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: 'translate(-50%, -50%)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          transform: `translateZ(${depth}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <motion.div
          className={cn(
            'rounded-full border',
            dashed && 'border-dashed',
            borderClass,
          )}
          style={{ width: diameter, height: diameter }}
          animate={{ rotate: prefersReduced || !spin ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Orbiting skill capsules                                            */
/* ------------------------------------------------------------------ */
function Capsule({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-medium tracking-tight text-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      <span className="size-1 rounded-full bg-white/70" />
      {label}
    </span>
  )
}

function Orbit({
  radiusPct,
  duration,
  direction,
  capsules,
  prefersReduced,
}: {
  radiusPct: number
  duration: number
  direction: 1 | -1
  capsules: string[]
  prefersReduced: boolean
}) {
  return (
    <div
      style={{ transform: 'translateZ(26px)', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {capsules.map((label, i) => {
          const a = (i / capsules.length) * Math.PI * 2 - Math.PI / 2
          const lx = 50 + radiusPct * Math.cos(a)
          const ly = 50 + radiusPct * Math.sin(a)
          return (
            <div
              key={label}
              className="absolute"
              style={{
                left: `${lx}%`,
                top: `${ly}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                style={{ transformOrigin: 'center' }}
                animate={{ rotate: prefersReduced ? 0 : -360 * direction }}
                transition={{ duration, repeat: Infinity, ease: 'linear' }}
              >
                <Capsule label={label} />
              </motion.div>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Subtle neural network connections                                  */
/* ------------------------------------------------------------------ */
function NeuralWeb({ prefersReduced }: { prefersReduced: boolean }) {
  const nodes = useMemo(() => {
    const count = 7
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2
      return { x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }
    })
  }, [])

  return (
    <svg
      className="absolute inset-0 size-full"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      {nodes.map((n, i) => {
        const next = nodes[(i + 1) % nodes.length]
        return (
          <motion.line
            key={`l-${i}`}
            x1={n.x}
            y1={n.y}
            x2={next.x}
            y2={next.y}
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth={0.3}
            strokeDasharray="2 3"
            animate={
              prefersReduced ? undefined : { strokeDashoffset: [0, -10] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )
      })}
      {nodes.map((n, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={n.x}
          cy={n.y}
          r={0.9}
          fill="white"
          fillOpacity={0.5}
          animate={prefersReduced ? undefined : { opacity: [0.3, 0.7, 0.3] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated particle system                                           */
/* ------------------------------------------------------------------ */
function Particles({ prefersReduced }: { prefersReduced: boolean }) {
  const dots = useMemo(
    () => [
      { x: '14%', y: '22%', d: 3, dur: 7, delay: 0 },
      { x: '82%', y: '18%', d: 2, dur: 9, delay: 1.4 },
      { x: '24%', y: '78%', d: 2.5, dur: 8, delay: 0.6 },
      { x: '76%', y: '72%', d: 3.5, dur: 10, delay: 2 },
      { x: '50%', y: '12%', d: 2, dur: 6.5, delay: 1 },
      { x: '10%', y: '52%', d: 2.5, dur: 9.5, delay: 0.3 },
      { x: '90%', y: '50%', d: 2, dur: 7.5, delay: 1.8 },
      { x: '40%', y: '90%', d: 3, dur: 8.5, delay: 0.9 },
      { x: '64%', y: '88%', d: 2, dur: 9, delay: 2.4 },
      { x: '32%', y: '40%', d: 1.5, dur: 6, delay: 1.2 },
    ],
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {dots.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/60"
          style={{ left: p.x, top: p.y, width: p.d, height: p.d }}
          animate={
            prefersReduced
              ? undefined
              : { y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }
          }
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The Digital AI Core — the hero visualization                       */
/* ------------------------------------------------------------------ */
function AICore() {
  const prefersReduced = usePrefersReducedMotion()
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({
    maxTilt: 10,
  })

  const rings: {
    diameter: string
    dashed: boolean
    borderClass: string
    duration: number
    direction: 1 | -1
    depth: number
    spin?: boolean
  }[] = [
    {
      diameter: '30%',
      dashed: false,
      borderClass: 'border-white/[0.05]',
      duration: 1,
      direction: 1,
      depth: 0,
      spin: false,
    },
    {
      diameter: '44%',
      dashed: true,
      borderClass: 'border-white/[0.06]',
      duration: 90,
      direction: 1,
      depth: 8,
    },
    {
      diameter: '58%',
      dashed: false,
      borderClass: 'border-white/[0.04]',
      duration: 1,
      direction: 1,
      depth: 0,
      spin: false,
    },
    {
      diameter: '70%',
      dashed: true,
      borderClass: 'border-white/[0.05]',
      duration: 120,
      direction: -1,
      depth: -6,
    },
  ]

  const streams: {
    diameter: string
    duration: number
    direction: 1 | -1
  }[] = [
    { diameter: '50%', duration: 26, direction: 1 },
    { diameter: '62%', duration: 34, direction: -1 },
  ]

  const orbits: {
    radiusPct: number
    duration: number
    direction: 1 | -1
    capsules: string[]
  }[] = [
    {
      radiusPct: 22,
      duration: 38,
      direction: 1,
      capsules: ['Python', 'React', 'SQL'],
    },
    {
      radiusPct: 33,
      duration: 50,
      direction: -1,
      capsules: ['ML', 'Data', 'Cloud'],
    },
    {
      radiusPct: 45,
      duration: 62,
      direction: 1,
      capsules: ['Design', 'UX', 'AI'],
    },
  ]

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <div
        ref={ref}
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative aspect-square w-[20rem] sm:w-[24rem] lg:w-[28rem]"
      >
        {/* breathing radial glow */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: '78%',
              height: '78%',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 45%, transparent 72%)',
              filter: 'blur(8px)',
            }}
            animate={
              prefersReduced
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* neural connections behind everything */}
        <NeuralWeb prefersReduced={prefersReduced} />

        {/* concentric decorative rings */}
        {rings.map((r, i) => (
          <FloatRing key={`ring-${i}`} {...r} prefersReduced={prefersReduced} />
        ))}

        {/* rotating data-stream rings */}
        {streams.map((s, i) => (
          <FloatRing
            key={`stream-${i}`}
            diameter={s.diameter}
            dashed
            borderClass="border-white/[0.08]"
            duration={s.duration}
            direction={s.direction}
            depth={14}
            prefersReduced={prefersReduced}
          />
        ))}

        {/* orbiting skill capsules */}
        {orbits.map((o, i) => (
          <Orbit key={`orbit-${i}`} {...o} prefersReduced={prefersReduced} />
        ))}

        {/* central core */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: 70,
              height: 70,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.25) 55%, transparent 75%)',
            }}
            animate={
              prefersReduced
                ? undefined
                : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full border border-white/25"
            style={{
              width: 132,
              height: 132,
              transform: 'translate(-50%, -50%)',
            }}
            animate={
              prefersReduced
                ? undefined
                : { scale: [1, 1.18, 1], opacity: [0.4, 0, 0.4] }
            }
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-white/40"
            style={{
              width: 96,
              height: 96,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{ rotate: prefersReduced ? 0 : 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* particle field */}
        <Particles prefersReduced={prefersReduced} />

        {/* scan-line sweep */}
        {!prefersReduced && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-px"
            style={{
              top: 0,
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            }}
            animate={{ y: ['0%', '100%'], opacity: [0, 0.9, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */
export default function AuthShowcase() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col">
      {/* layered dark monochrome background */}
      <div className="auth-layer auth-spotlight" aria-hidden="true" />
      <div className="auth-layer auth-grid" aria-hidden="true" />
      <div className="auth-layer auth-mesh" aria-hidden="true" />
      <svg className="auth-layer auth-noise" aria-hidden="true">
        <filter id="auth-noise-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-noise-filter)" />
      </svg>
      <div className="auth-layer auth-vignette" aria-hidden="true" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col justify-between gap-8 px-8 py-10 md:px-10 lg:px-14">
        {/* top: logo + welcome heading + one short sentence */}
        <header>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Brain className="size-6 text-white" />
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">
              JobWeMet
            </span>
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
            Welcome to JobWeMet
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            An intelligent workspace that maps your skills to the career
            you&rsquo;re meant for.
          </p>
        </header>

        {/* middle: the Digital AI Core — the hero of the auth pages */}
        <div className="relative flex flex-1 items-center justify-center">
          <AICore />
        </div>

        {/* intentionally empty — no feature cards, no statistics */}
        <div aria-hidden="true" className="hidden" />
      </div>
    </aside>
  )
}
