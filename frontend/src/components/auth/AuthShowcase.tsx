import { motion } from 'motion/react'
import { Brain, Route, Target, type LucideIcon } from 'lucide-react'
import {
  fadeUp,
  staggerContainer,
  useCountUp,
  usePrefersReducedMotion,
} from '@/motion'

/**
 * AuthShowcase — the left panel of the auth layout, reimagined as an onboarding
 * experience rather than another marketing hero.
 *
 * The brief: the user is *entering* the AI workspace, so the centrepiece is a
 * living network of connected skills (Python / React / SQL -> AI -> AI Engineer
 * + Roadmap) with animated connection lines and a pulsing AI core — not a
 * dashboard window and not floating card copies of the landing page. A large
 * logo and short welcome message set the tone; three feature highlights and
 * three count-up metrics sit below. Dark, monochrome, and fully reduced-motion
 * aware.
 */

/* ------------------------------------------------------------------ */
/*  Very subtle drifting particles                                    */
/* ------------------------------------------------------------------ */
function Particles() {
  const prefersReduced = usePrefersReducedMotion()
  if (prefersReduced) return null
  const dots = [
    { top: '18%', left: '14%', d: 6, delay: 0 },
    { top: '68%', left: '82%', d: 4, delay: 1.2 },
    { top: '38%', left: '86%', d: 5, delay: 0.6 },
    { top: '80%', left: '18%', d: 3, delay: 1.8 },
  ]
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {dots.map((p, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ top: p.top, left: p.left }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -14, 0] }}
          transition={{
            duration: 6,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <span
            className="block rounded-full bg-white/50"
            style={{ width: p.d, height: p.d }}
          />
        </motion.span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  The skill network — the centrepiece illustration                  */
/* ------------------------------------------------------------------ */
type NodeKind = 'skill' | 'core' | 'career' | 'roadmap'

interface NetNode {
  id: string
  x: number
  y: number
  label: string
  kind: NodeKind
}

const NODES: NetNode[] = [
  { id: 'python', x: 88, y: 255, label: 'Python', kind: 'skill' },
  { id: 'react', x: 186, y: 292, label: 'React', kind: 'skill' },
  { id: 'sql', x: 64, y: 150, label: 'SQL', kind: 'skill' },
  { id: 'ai', x: 205, y: 165, label: 'AI', kind: 'core' },
  { id: 'career', x: 322, y: 108, label: 'AI Engineer', kind: 'career' },
  { id: 'roadmap', x: 315, y: 248, label: 'Roadmap', kind: 'roadmap' },
]

const EDGES: [string, string][] = [
  ['python', 'ai'],
  ['react', 'ai'],
  ['sql', 'ai'],
  ['ai', 'career'],
  ['ai', 'roadmap'],
]

function SkillNode({
  node,
  index,
  prefersReduced,
}: {
  node: NetNode
  index: number
  prefersReduced: boolean
}) {
  const w =
    node.kind === 'skill'
      ? 78
      : node.kind === 'core'
        ? 70
        : node.kind === 'career'
          ? 108
          : 96
  const h = 34
  const { x, y } = node
  const emphasized = node.kind === 'career' || node.kind === 'core'

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {/* AI core: rotating processing ring + pulsing halo */}
      {node.kind === 'core' && (
        <>
          {!prefersReduced && (
            <motion.circle
              cx={x}
              cy={y}
              r="30"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.22"
              strokeWidth="1"
              strokeDasharray="4 6"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          )}
          {!prefersReduced && (
            <motion.circle
              cx={x}
              cy={y}
              r="22"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.6"
              strokeWidth="1.5"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          )}
        </>
      )}

      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx="17"
        fill={emphasized ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}
        stroke={emphasized ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)'}
        strokeWidth="1.25"
      />
      <text
        x={x}
        y={y}
        dominantBaseline="central"
        textAnchor="middle"
        fill="rgba(255,255,255,0.92)"
        fontSize={node.kind === 'core' ? 13 : 11}
        fontWeight={node.kind === 'core' ? 700 : 500}
      >
        {node.label}
      </text>
    </motion.g>
  )
}

function SkillNetwork() {
  const prefersReduced = usePrefersReducedMotion()
  const pos = Object.fromEntries(NODES.map((n) => [n.id, n]))
  return (
    <svg
      viewBox="0 0 400 340"
      className="w-full max-w-[16rem] text-white/70 sm:max-w-[20rem] lg:max-w-md"
      fill="none"
      aria-hidden="true"
    >
      {EDGES.map(([f, t], i) => {
        const a = pos[f]
        const b = pos[t]
        return (
          <motion.line
            key={`${f}-${t}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.4 + i * 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )
      })}
      {NODES.map((n, i) => (
        <SkillNode
          key={n.id}
          node={n}
          index={i}
          prefersReduced={prefersReduced}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Feature highlights + count-up metrics                             */
/* ------------------------------------------------------------------ */
const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Brain,
    title: 'AI Career Intelligence',
    desc: 'Predicts your strongest career matches.',
  },
  {
    icon: Route,
    title: 'Personalized Roadmaps',
    desc: 'Creates learning paths unique to you.',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Finds exactly what to learn next.',
  },
]

const METRICS = [
  { value: '18+', label: 'Skills Analysed' },
  { value: '92%', label: 'Prediction Accuracy' },
  { value: '1000+', label: 'Learning Resources' },
] as const

function Metric({ value, label }: { value: string; label: string }) {
  const match = value.match(/^(\D*)(\d+)(.*)$/)
  const target = match ? Number(match[2]) : 0
  const counted = useCountUp(target, { duration: 1.3, delay: 0.2 })
  const [, prefix, , suffix] = match ?? []
  return (
    <div className="px-4 text-center first:pl-0 last:pr-0">
      <p className="text-xl font-semibold tracking-tight text-white">
        {prefix}
        {Math.round(counted)}
        {suffix}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-neutral-500">
        {label}
      </p>
    </div>
  )
}

export default function AuthShowcase() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-neutral-950 md:flex md:flex-col">
      {/* layered dark monochrome background */}
      <div className="auth-layer auth-spotlight" aria-hidden="true" />
      <div className="auth-layer auth-grid" aria-hidden="true" />
      <div className="auth-layer auth-mesh" aria-hidden="true" />
      <Particles />
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
        {/* top: large logo + welcome message */}
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
            One intelligent workspace that analyzes your resume, maps your
            skills, predicts careers, and builds your learning roadmap.
          </p>
        </header>

        {/* middle: the living skill network */}
        <div className="relative flex flex-1 items-center justify-center">
          <SkillNetwork />
        </div>

        {/* bottom: feature highlights + metrics */}
        <footer className="space-y-7">
          <motion.ul
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {FEATURES.map((f) => {
              const Icon: LucideIcon = f.icon
              return (
                <motion.li
                  key={f.title}
                  variants={fadeUp}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-3.5 text-white" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-neutral-100">
                      {f.title}
                    </p>
                    <p className="text-[11px] leading-snug text-neutral-400">
                      {f.desc}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </motion.ul>

          <div className="flex items-center justify-center divide-x divide-white/10">
            {METRICS.map((m) => (
              <Metric key={m.label} value={m.value} label={m.label} />
            ))}
          </div>
        </footer>
      </div>
    </aside>
  )
}
