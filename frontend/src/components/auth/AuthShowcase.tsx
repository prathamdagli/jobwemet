import { useMemo, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  Brain,
  Box,
  Code,
  Cpu,
  FileText,
  Route,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { useMouseTilt, usePrefersReducedMotion } from '@/motion'
import { cn } from '@/lib/utils'

/**
 * AuthShowcase — the left panel of the auth layout, reimagined as the entry
 * point to a futuristic operating system rather than a marketing graphic.
 *
 * The centrepiece is a single, large, floating "AI Command Core": an engineered
 * HUD of stacked glass rings around a glowing energy centre, with orbiting
 * micro-dots, a rotating scan sweep and a soft shadow — all monochrome. Around
 * it float tiny glass HUD pills connected to the core by energy lines, all
 * reacting to the pointer.
 *
 * No dashboard, no node graph, no infographic — just a targeting interface.
 */

const ANNULUS =
  'radial-gradient(circle, transparent 47%, #000 48%, #000 52%, transparent 53%)'

/* ------------------------------------------------------------------ */
/*  Outer ring — thick glass, segmented, rotating slowly              */
/* ------------------------------------------------------------------ */
function GlassRing({
  size,
  duration,
  direction,
  depth = 0,
  prefersReduced,
}: {
  size: string
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
          className="rounded-full border border-white/[0.12]"
          style={{
            width: size,
            height: size,
            borderWidth: 7,
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.04), 0 10px 30px -12px rgba(0,0,0,0.65)',
            backdropFilter: 'blur(2px)',
          }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        >
          {/* segmented tick overlay */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, rgba(255,255,255,0.6) 0deg 1.4deg, transparent 1.4deg 12deg)',
              WebkitMaskImage: ANNULUS,
              maskImage: ANNULUS,
            }}
          />
          {/* reflection on the glass */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 200deg, rgba(255,255,255,0.12), transparent 60deg)',
              WebkitMaskImage: ANNULUS,
              maskImage: ANNULUS,
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Thin dashed ring (counter-rotating)                               */
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
/*  Third ring — many tiny technical tick marks                       */
/* ------------------------------------------------------------------ */
function TickRing({
  size,
  duration,
  direction,
  depth = 0,
  prefersReduced,
}: {
  size: string
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
          className="absolute inset-0"
          style={{ width: size, height: size }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        >
          {/* fine ticks */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.45) 0deg 0.5deg, transparent 0.5deg 6deg)',
              WebkitMaskImage: ANNULUS,
              maskImage: ANNULUS,
            }}
          />
          {/* 12 major ticks */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.75) 0deg 1deg, transparent 1deg 30deg)',
              WebkitMaskImage: ANNULUS,
              maskImage: ANNULUS,
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Fourth ring — glowing energy ring (pulsing brightness)            */
/* ------------------------------------------------------------------ */
function EnergyRing({
  size,
  duration,
  direction,
  depth = 0,
  prefersReduced,
}: {
  size: string
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
        {/* solid hairline */}
        <motion.div
          className="absolute inset-0 rounded-full border border-white/25"
          style={{ width: size, height: size }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
        {/* travelling glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ width: size, height: size }}
          animate={{ rotate: prefersReduced ? 0 : 360 * direction }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.75) 45deg, transparent 95deg, rgba(255,255,255,0.55) 200deg, transparent 255deg, rgba(255,255,255,0.7) 320deg, transparent 360deg)',
              WebkitMaskImage: ANNULUS,
              maskImage: ANNULUS,
              filter: 'blur(3px)',
            }}
            animate={prefersReduced ? undefined : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Orbiting micro-dots (small / medium / bright indicators)          */
/* ------------------------------------------------------------------ */
function OrbitDots({
  radiusPct,
  count,
  duration,
  direction,
  depth = 0,
  bright = [],
  medium = [],
  prefersReduced,
}: {
  radiusPct: number
  count: number
  duration: number
  direction: 1 | -1
  depth?: number
  bright?: number[]
  medium?: number[]
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
          const med = medium.includes(i)
          const dim = on ? 4 : med ? 3 : 2.5
          return (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${lx}%`,
                top: `${ly}%`,
                width: dim,
                height: dim,
                transform: 'translate(-50%, -50%)',
                background: on
                  ? 'rgba(255,255,255,0.9)'
                  : med
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.3)',
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
/*  The AI Command Core — inner visuals (placed inside the tilt stage)*/
/* ------------------------------------------------------------------ */
function CommandCoreInner({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <>
      {/* soft radial lighting / outer bloom behind the core */}
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
              'radial-gradient(circle, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 44%, transparent 70%)',
            filter: 'blur(12px)',
          }}
          animate={
            prefersReduced
              ? undefined
              : { scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }
          }
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* stacked glass rings — depth via translateZ, alternating direction */}
      <GlassRing
        size="90%"
        duration={26}
        direction={1}
        depth={8}
        prefersReduced={prefersReduced}
      />
      <Ring
        size="76%"
        borderClass="border-white/20"
        thickness={1.5}
        dashed
        duration={16}
        direction={-1}
        depth={16}
        prefersReduced={prefersReduced}
      />
      <TickRing
        size="62%"
        duration={11}
        direction={1}
        depth={26}
        prefersReduced={prefersReduced}
      />
      <EnergyRing
        size="48%"
        duration={8}
        direction={-1}
        depth={36}
        prefersReduced={prefersReduced}
      />

      {/* orbiting micro-dots (small / medium / bright, varied speeds) */}
      <OrbitDots
        radiusPct={42}
        count={16}
        duration={20}
        direction={1}
        depth={14}
        bright={[0, 8]}
        medium={[4, 12]}
        prefersReduced={prefersReduced}
      />
      <OrbitDots
        radiusPct={68}
        count={22}
        duration={28}
        direction={-1}
        depth={40}
        bright={[3, 11]}
        medium={[7, 15]}
        prefersReduced={prefersReduced}
      />

      {/* obvious rotating scan line with a fade trail (every ~3.5s) */}
      {!prefersReduced && (
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2"
            style={{ transform: 'translate(-50%, -50%)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 2,
                height: '46%',
                transform: 'translate(-50%, -100%)',
                background:
                  'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.1))',
                filter: 'blur(0.4px)',
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '92%',
                height: '92%',
                transform: 'translate(-50%, -50%)',
                background:
                  'conic-gradient(from 0deg, rgba(255,255,255,0) 308deg, rgba(255,255,255,0.12) 352deg, rgba(255,255,255,0) 360deg)',
                borderRadius: '50%',
              }}
            />
          </motion.div>
        </div>
      )}

      {/* engineered energy centre — glass lens + concentric circles + bloom */}
      <div className="absolute inset-0">
        {/* outer bloom */}
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '40%',
            height: '40%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={
            prefersReduced
              ? undefined
              : { opacity: [0.45, 0.9, 0.45], scale: [0.92, 1.05, 0.92] }
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* glass lens */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md"
          style={{
            width: '30%',
            height: '30%',
            transform: 'translate(-50%, -50%)',
            boxShadow:
              'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -10px 20px -12px rgba(0,0,0,0.6), 0 16px 40px -16px rgba(0,0,0,0.7)',
          }}
        >
          {/* glass reflection */}
          <div
            className="absolute left-1/2 top-1/2 size-full rounded-full"
            style={{
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(60% 40% at 50% 14%, rgba(255,255,255,0.12), transparent 70%)',
            }}
          />
          {/* concentric circles */}
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-white/15"
            style={{
              width: '74%',
              height: '74%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-white/20"
            style={{
              width: '50%',
              height: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 rounded-full border border-white/25"
            style={{
              width: '28%',
              height: '28%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* faint halo around the core */}
        <div
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: '18%',
            height: '18%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.35), transparent 65%)',
            filter: 'blur(3px)',
          }}
        />

        {/* bright energy core + layered bloom */}
        <motion.div
          className="absolute left-1/2 top-1/2 rounded-full bg-white"
          style={{
            width: 11,
            height: 11,
            transform: 'translate(-50%, -50%)',
            boxShadow:
              '0 0 10px rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.6), 0 0 40px rgba(255,255,255,0.35)',
          }}
          animate={
            prefersReduced
              ? undefined
              : { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* soft shadow beneath the floating core */}
      <div
        className="absolute left-1/2 top-[90%] rounded-full"
        style={{
          width: '64%',
          height: '16%',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(ellipse, rgba(0,0,0,0.55), transparent 70%)',
          filter: 'blur(8px)',
        }}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Connector energy lines (pulse travels core -> HUD, brighter nodes) */
/* ------------------------------------------------------------------ */
function Connectors({
  items,
  active,
  prefersReduced,
}: {
  items: { cx: number; cy: number }[]
  active: number | null
  prefersReduced: boolean
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 size-full"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      {items.map((it, i) => (
        <g key={i}>
          {/* thin technical base line */}
          <line
            x1={50}
            y1={50}
            x2={it.cx}
            y2={it.cy}
            stroke="white"
            strokeOpacity={0.1}
            strokeWidth={0.25}
          />
          {/* moving energy pulse */}
          <motion.line
            x1={50}
            y1={50}
            x2={it.cx}
            y2={it.cy}
            stroke="white"
            strokeWidth={0.5}
            strokeLinecap="round"
            strokeDasharray="1.5 39"
            strokeOpacity={active === i ? 0.95 : 0.35}
            animate={
              prefersReduced ? undefined : { strokeDashoffset: [0, -40.5] }
            }
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          />
          {/* elegant anchor node at the HUD end */}
          <circle
            cx={it.cx}
            cy={it.cy}
            r={active === i ? 1.1 : 0.7}
            fill="white"
            fillOpacity={active === i ? 1 : 0.6}
          />
          {/* core node */}
          <circle cx={50} cy={50} r={0.6} fill="white" fillOpacity={0.45} />
        </g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Tiny floating glass HUD pills (icon + title + secondary text)     */
/* ------------------------------------------------------------------ */
function HudPill({
  icon: Icon,
  label,
  sub,
  cx,
  cy,
  index,
  active,
  onHover,
  prefersReduced,
}: {
  icon: LucideIcon
  label: string
  sub: string
  cx: number
  cy: number
  index: number
  active: boolean
  onHover: (i: number | null) => void
  prefersReduced: boolean
}) {
  return (
    <div
      className="absolute z-20"
      style={{
        left: `${cx}%`,
        top: `${cy}%`,
        transform: 'translate(-50%, -50%) translateZ(6px)',
      }}
    >
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          className="inline-flex cursor-default items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.7)] backdrop-blur-md"
          animate={
            prefersReduced ? undefined : { y: [0, -6, 0], scale: [1, 1.03, 1] }
          }
          transition={{
            duration: 5 + index * 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{
            y: -4,
            scale: 1.05,
            boxShadow: '0 10px 28px -6px rgba(255,255,255,0.25)',
            borderColor: 'rgba(255,255,255,0.3)',
          }}
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
        >
          <span
            className="flex size-5 items-center justify-center rounded-md bg-white/10 text-white/70"
            style={{
              boxShadow: active ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
            }}
          >
            <Icon className="size-3" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-medium tracking-tight text-white/85">
              {label}
            </span>
            <span className="text-[8px] uppercase tracking-wide text-white/40">
              {sub}
            </span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background: thin technical corner brackets (futuristic frame)     */
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
/*  Background: large faint rotating circles                          */
/* ------------------------------------------------------------------ */
function BgCircles({ prefersReduced }: { prefersReduced: boolean }) {
  return (
    <div className="auth-layer" aria-hidden="true">
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-white/[0.04]"
        style={{
          width: '120%',
          height: '120%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ rotate: prefersReduced ? 0 : 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-1/2 top-[60%] rounded-full border border-dashed border-white/[0.03]"
        style={{
          width: '150%',
          height: '150%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ rotate: prefersReduced ? 0 : -360 }}
        transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Background: tiny twinkling stars                                  */
/* ------------------------------------------------------------------ */
function Stars({ prefersReduced }: { prefersReduced: boolean }) {
  const stars = useMemo(
    () => [
      { x: '18%', y: '24%', d: 2, dur: 3.5, delay: 0 },
      { x: '80%', y: '30%', d: 1.5, dur: 4.2, delay: 1.5 },
      { x: '30%', y: '82%', d: 2, dur: 3.8, delay: 0.8 },
      { x: '72%', y: '76%', d: 1.5, dur: 4.6, delay: 2.2 },
      { x: '50%', y: '14%', d: 1.5, dur: 3.2, delay: 1 },
      { x: '12%', y: '56%', d: 2, dur: 4, delay: 0.4 },
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
          className="absolute rounded-full bg-white/80"
          style={{ left: s.x, top: s.y, width: s.d, height: s.d }}
          animate={
            prefersReduced
              ? undefined
              : { opacity: [0.15, 0.75, 0.15], scale: [0.8, 1.3, 0.8] }
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
/*  Panel                                                             */
/* ------------------------------------------------------------------ */
export default function AuthShowcase() {
  const prefersReduced = usePrefersReducedMotion()
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({ maxTilt: 3 })
  const [hovered, setHovered] = useState<number | null>(null)

  // subtle background parallax (moves slower than the foreground core)
  const bgX = useMotionValue(0)
  const bgY = useMotionValue(0)
  const sbx = useSpring(bgX, { stiffness: 50, damping: 20 })
  const sby = useSpring(bgY, { stiffness: 50, damping: 20 })
  const pbx = useTransform(sbx, [-0.5, 0.5], [10, -10])
  const pby = useTransform(sby, [-0.5, 0.5], [10, -10])

  const onBgMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReduced) return
    const r = e.currentTarget.getBoundingClientRect()
    bgX.set((e.clientX - r.left) / r.width - 0.5)
    bgY.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onBgLeave = () => {
    bgX.set(0)
    bgY.set(0)
  }

  const hud: {
    label: string
    sub: string
    icon: LucideIcon
    cx: number
    cy: number
  }[] = [
    {
      label: 'Resume Uploaded',
      sub: '5 skills extracted',
      icon: FileText,
      cx: 40,
      cy: 7,
    },
    { label: 'Career Match', sub: '92%', icon: Target, cx: 70, cy: 13 },
    {
      label: 'Roadmap Ready',
      sub: '3 steps left',
      icon: Route,
      cx: 91,
      cy: 42,
    },
    { label: 'Skill Match', sub: 'High fit', icon: Sparkles, cx: 70, cy: 88 },
    { label: 'Python', sub: 'Detected skill', icon: Code, cx: 13, cy: 72 },
    { label: 'Docker', sub: 'Detected skill', icon: Box, cx: 9, cy: 33 },
    { label: 'ML Engineer', sub: 'Top role', icon: Cpu, cx: 50, cy: 93 },
  ]

  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col"
      onMouseMove={onBgMove}
      onMouseLeave={onBgLeave}
    >
      {/* layered dark, minimal environment (slow parallax) */}
      <motion.div className="absolute inset-0 z-0" style={{ x: pbx, y: pby }}>
        <div className="auth-layer auth-spotlight" aria-hidden="true" />
        <div className="auth-layer auth-grid" aria-hidden="true" />
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
        <div
          className="auth-layer"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
          aria-hidden="true"
        />
        <BgCircles prefersReduced={prefersReduced} />
        <Stars prefersReduced={prefersReduced} />
        <div className="auth-layer auth-vignette" aria-hidden="true" />
      </motion.div>

      {/* moving noise */}
      <motion.svg
        className="auth-layer auth-noise"
        aria-hidden="true"
        animate={
          prefersReduced
            ? undefined
            : { opacity: [0.025, 0.05, 0.025], x: [0, 6, 0] }
        }
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
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
      </motion.svg>

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

        {/* middle: the Command Core (hero) with HUD + connectors + frame */}
        <div className="relative flex flex-1 items-center justify-center">
          <TechBrackets />
          <div
            style={{ perspective: 1200 }}
            className="relative aspect-square w-[98%] max-w-[40rem]"
          >
            <div
              ref={ref}
              style={style}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className="relative size-full"
            >
              <CommandCoreInner prefersReduced={prefersReduced} />
              <Connectors
                items={hud}
                active={hovered}
                prefersReduced={prefersReduced}
              />
              {hud.map((h, i) => (
                <HudPill
                  key={h.label}
                  icon={h.icon}
                  label={h.label}
                  sub={h.sub}
                  cx={h.cx}
                  cy={h.cy}
                  index={i}
                  active={hovered === i}
                  onHover={setHovered}
                  prefersReduced={prefersReduced}
                />
              ))}
            </div>
          </div>
        </div>

        {/* intentionally empty — no cards, no stats, no dashboard */}
        <div aria-hidden="true" className="hidden" />
      </div>
    </aside>
  )
}
