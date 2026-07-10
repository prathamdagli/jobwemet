import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Brain } from 'lucide-react'
import { useMouseTilt, usePrefersReducedMotion } from '@/motion'
import { cn } from '@/lib/utils'

/**
 * AuthShowcase — the left panel of the auth layout, reimagined as the entry
 * point to a futuristic operating system rather than a marketing graphic.
 *
 * The centrepiece is a single, large, floating "AI Command Core": a glass disk
 * carrying multiple rotating concentric rings, segmented arcs, a holographic
 * centre, a rotating scan sweep, orbiting micro-dots, a soft reflection and
 * layered shadows — all monochrome and slow. Around it float only tiny glass
 * HUD pills (status labels). The whole core tilts subtly with the pointer.
 *
 * No dashboard, no node graph, no infographic — just an engineered interface.
 */

/* ------------------------------------------------------------------ */
/*  Primitive: a concentric ring (solid or dashed) on the Z-axis       */
/* ------------------------------------------------------------------ */
function Ring({
  size,
  borderClass,
  thickness = 1,
  dashed = false,
  duration,
  direction,
  depth = 0,
  prefersReduced,
}: {
  size: string
  borderClass: string
  thickness?: number
  dashed?: boolean
  duration: number
  direction: 1 | -1
  depth?: number
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
          style={{ width: size, height: size, borderWidth: thickness }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Primitive: a rotating segmented arc (one or two border sides)      */
/* ------------------------------------------------------------------ */
function Arc({
  size,
  borderClass,
  duration,
  direction,
  rotation = 0,
  depth = 0,
  prefersReduced,
}: {
  size: string
  borderClass: string
  duration: number
  direction: 1 | -1
  rotation?: number
  depth?: number
  prefersReduced: boolean
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
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
          className={cn('rounded-full border-transparent', borderClass)}
          style={{ width: size, height: size }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Orbiting micro-dots (with optional bright indicators)              */
/* ------------------------------------------------------------------ */
function OrbitDots({
  radiusPct,
  count,
  duration,
  direction,
  depth = 0,
  bright = [],
  prefersReduced,
}: {
  radiusPct: number
  count: number
  duration: number
  direction: 1 | -1
  depth?: number
  bright?: number[]
  prefersReduced: boolean
}) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2
        return {
          lx: 50 + radiusPct * Math.cos(a),
          ly: 50 + radiusPct * Math.sin(a),
          i,
        }
      }),
    [count, radiusPct],
  )
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {dots.map(({ lx, ly, i }) => {
          const on = bright.includes(i)
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${lx}%`,
                top: `${ly}%`,
                width: on ? 4 : 2.5,
                height: on ? 4 : 2.5,
                transform: 'translate(-50%, -50%)',
                background: on
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.32)',
                boxShadow: on ? '0 0 8px rgba(255,255,255,0.6)' : undefined,
              }}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The AI Command Core — the hero of the auth pages                   */
/* ------------------------------------------------------------------ */
function CommandCore() {
  const prefersReduced = usePrefersReducedMotion()
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({ maxTilt: 3 })

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <div
        ref={ref}
        style={style}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative aspect-square w-[76%] max-w-[28rem]"
      >
        {/* breathing radial glow behind the disk */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="rounded-full"
            style={{
              width: '92%',
              height: '92%',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 46%, transparent 72%)',
              filter: 'blur(10px)',
            }}
            animate={
              prefersReduced
                ? undefined
                : { scale: [1, 1.07, 1], opacity: [0.65, 1, 0.65] }
            }
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* the floating glass disk — base surface with layered shadows */}
        <div
          className="absolute left-1/2 top-1/2 rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl"
          style={{
            width: '84%',
            height: '84%',
            transform: 'translate(-50%, -50%) translateZ(0px)',
            boxShadow:
              '0 40px 80px -28px rgba(0,0,0,0.75), 0 12px 32px -16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        />

        {/* concentric rings — outer rotates CW, inner counter-rotates */}
        <Ring
          size="34%"
          borderClass="border-white/[0.10]"
          thickness={1}
          duration={70}
          direction={1}
          depth={10}
          prefersReduced={prefersReduced}
        />
        <Ring
          size="48%"
          borderClass="border-white/[0.08]"
          thickness={1}
          dashed
          duration={95}
          direction={-1}
          depth={18}
          prefersReduced={prefersReduced}
        />
        <Ring
          size="62%"
          borderClass="border-white/[0.07]"
          thickness={1}
          duration={120}
          direction={1}
          depth={26}
          prefersReduced={prefersReduced}
        />
        <Ring
          size="76%"
          borderClass="border-white/[0.06]"
          thickness={1.5}
          dashed
          duration={150}
          direction={-1}
          depth={34}
          prefersReduced={prefersReduced}
        />
        <Ring
          size="90%"
          borderClass="border-white/[0.05]"
          thickness={1}
          duration={180}
          direction={1}
          depth={42}
          prefersReduced={prefersReduced}
        />

        {/* rotating segmented arcs */}
        <Arc
          size="58%"
          borderClass="border-t border-white/30"
          duration={34}
          direction={1}
          rotation={0}
          depth={22}
          prefersReduced={prefersReduced}
        />
        <Arc
          size="70%"
          borderClass="border-l border-b border-white/20"
          duration={46}
          direction={-1}
          rotation={45}
          depth={30}
          prefersReduced={prefersReduced}
        />

        {/* orbiting micro-dots + bright indicators */}
        <OrbitDots
          radiusPct={42}
          count={10}
          duration={60}
          direction={1}
          depth={14}
          bright={[0, 5]}
          prefersReduced={prefersReduced}
        />
        <OrbitDots
          radiusPct={68}
          count={14}
          duration={90}
          direction={-1}
          depth={38}
          bright={[3]}
          prefersReduced={prefersReduced}
        />

        {/* rotating scan sweep (masked to an annulus) */}
        {!prefersReduced && (
          <div
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className="rounded-full"
              style={{
                width: '100%',
                height: '100%',
                background:
                  'conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.12) 16deg, rgba(255,255,255,0) 38deg, rgba(255,255,255,0) 360deg)',
                WebkitMaskImage:
                  'radial-gradient(circle, transparent 38%, #000 39%, #000 72%, transparent 73%)',
                maskImage:
                  'radial-gradient(circle, transparent 38%, #000 39%, #000 72%, transparent 73%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* holographic centre */}
        <div className="absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md"
            style={{
              width: '30%',
              height: '30%',
              transform: 'translate(-50%, -50%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 30px -12px rgba(0,0,0,0.6)',
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: '23%',
              height: '23%',
              transform: 'translate(-50%, -50%)',
              background:
                'conic-gradient(from 0deg, transparent, rgba(255,255,255,0.55), transparent 42%, rgba(255,255,255,0.2), transparent 80%)',
              WebkitMaskImage:
                'radial-gradient(circle, transparent 58%, #000 60%, #000 100%)',
              maskImage:
                'radial-gradient(circle, transparent 58%, #000 60%, #000 100%)',
            }}
            animate={{ rotate: prefersReduced ? 0 : 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 rounded-full bg-white"
            style={{
              width: 14,
              height: 14,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 22px rgba(255,255,255,0.6)',
            }}
            animate={
              prefersReduced
                ? undefined
                : { scale: [1, 1.18, 1], opacity: [0.8, 1, 0.8] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* soft reflection beneath the disk */}
        <div
          className="absolute left-1/2 top-[88%] rounded-full"
          style={{
            width: '70%',
            height: '22%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(ellipse, rgba(255,255,255,0.10), transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tiny floating glass HUD pills                                      */
/* ------------------------------------------------------------------ */
function HudLabel({
  label,
  pos,
  duration,
  prefersReduced,
}: {
  label: string
  pos: string
  duration: number
  prefersReduced: boolean
}) {
  return (
    <motion.div
      className={cn('absolute z-20', pos)}
      animate={
        prefersReduced ? undefined : { y: [0, -6, 0], opacity: [0.7, 1, 0.7] }
      }
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium tracking-tight text-white/80 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.6)] backdrop-blur-md">
        <span className="size-1 rounded-full bg-white/70" />
        {label}
      </span>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background: thin technical corner brackets (futuristic frame)      */
/* ------------------------------------------------------------------ */
function TechBrackets() {
  const base = 'pointer-events-none absolute size-7 border-white/10'
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      <span className={cn(base, 'left-3 top-3 border-l border-t')} />
      <span className={cn(base, 'right-3 top-3 border-r border-t')} />
      <span className={cn(base, 'bottom-3 left-3 border-b border-l')} />
      <span className={cn(base, 'bottom-3 right-3 border-b border-r')} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background: tiny drifting stars                                    */
/* ------------------------------------------------------------------ */
function Stars({ prefersReduced }: { prefersReduced: boolean }) {
  const stars = useMemo(
    () => [
      { x: '18%', y: '24%', d: 2, dur: 9, delay: 0 },
      { x: '80%', y: '30%', d: 1.5, dur: 11, delay: 1.5 },
      { x: '30%', y: '82%', d: 2, dur: 10, delay: 0.8 },
      { x: '72%', y: '76%', d: 1.5, dur: 12, delay: 2.2 },
      { x: '50%', y: '14%', d: 1.5, dur: 8, delay: 1 },
      { x: '12%', y: '56%', d: 2, dur: 10.5, delay: 0.4 },
    ],
    [],
  )
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/70"
          style={{ left: s.x, top: s.y, width: s.d, height: s.d }}
          animate={
            prefersReduced
              ? undefined
              : { y: [0, -8, 0], opacity: [0.2, 0.6, 0.2] }
          }
          transition={{
            duration: s.dur,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */
export default function AuthShowcase() {
  const prefersReduced = usePrefersReducedMotion()

  const hud = [
    { label: 'Resume Uploaded', pos: 'top-[9%] left-[2%]', duration: 7 },
    { label: '92%', pos: 'top-[19%] right-[3%]', duration: 9 },
    { label: 'Roadmap Ready', pos: 'top-[44%] right-[0%]', duration: 8 },
    { label: 'Skill Match', pos: 'bottom-[22%] right-[9%]', duration: 10 },
    { label: 'Python', pos: 'bottom-[28%] left-[5%]', duration: 6.5 },
    { label: 'Docker', pos: 'top-[54%] left-[1%]', duration: 8.5 },
    { label: 'ML Engineer', pos: 'bottom-[10%] left-[33%]', duration: 7.5 },
  ]

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col">
      {/* layered dark, minimal environment */}
      <div className="auth-layer auth-spotlight" aria-hidden="true" />
      <div className="auth-layer auth-grid" aria-hidden="true" />

      {/* large faded circles */}
      <div
        className="auth-layer"
        style={{
          background:
            'radial-gradient(40% 40% at 28% 28%, rgba(255,255,255,0.05), transparent 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="auth-layer"
        style={{
          background:
            'radial-gradient(45% 45% at 76% 72%, rgba(255,255,255,0.04), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="auth-layer auth-mesh" aria-hidden="true" />

      {/* depth fog */}
      <div
        className="auth-layer"
        style={{
          background:
            'radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      <Stars prefersReduced={prefersReduced} />

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
        {/* top-left: logo, welcome, one sentence */}
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
            Welcome back
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
            Your intelligent workspace is ready &mdash; pick up right where your
            career map left off.
          </p>
        </header>

        {/* middle: the Command Core (hero) with floating HUD + technical frame */}
        <div className="relative flex flex-1 items-center justify-center">
          <TechBrackets />
          <CommandCore />
          {hud.map((h) => (
            <HudLabel
              key={h.label}
              label={h.label}
              pos={h.pos}
              duration={h.duration}
              prefersReduced={prefersReduced}
            />
          ))}
        </div>

        {/* intentionally empty — no cards, no stats, no dashboard */}
        <div aria-hidden="true" className="hidden" />
      </div>
    </aside>
  )
}
