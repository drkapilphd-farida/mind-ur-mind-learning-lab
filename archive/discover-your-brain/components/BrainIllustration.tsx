'use client'

import { motion } from 'framer-motion'

// Abstract node-network brain glyph — never a literal anatomical brain
// (avoids the "clinical/school" register this module must avoid). Six
// satellite nodes connected to one center, arranged in a loose oval so the
// shape reads as "brain" at a glance without being a stock icon.
const NODES = [
  { id: 'center', cx: 100, cy: 100, r: 7 },
  { id: 'n1', cx: 60, cy: 60, r: 4 },
  { id: 'n2', cx: 140, cy: 55, r: 4 },
  { id: 'n3', cx: 45, cy: 110, r: 4 },
  { id: 'n4', cx: 155, cy: 115, r: 4 },
  { id: 'n5', cx: 75, cy: 150, r: 4 },
  { id: 'n6', cx: 125, cy: 150, r: 4 },
] as const

const PATHS = [
  'M100,100 L60,60',
  'M100,100 L140,55',
  'M100,100 L45,110',
  'M100,100 L155,115',
  'M100,100 L75,150',
  'M100,100 L125,150',
  'M60,60 Q100,30 140,55',
  'M45,110 Q30,130 75,150',
  'M155,115 Q170,130 125,150',
] as const

// "The illustration should feel intelligent, elegant and premium" — a
// slow, one-time draw-in (paths tracing themselves, nodes lighting up in
// sequence) reads as "becoming active," then settles into a calm,
// continuous breathing glow on the center node only. Nothing loops fast or
// competes with the headline for attention.
export function BrainIllustration(): React.JSX.Element {
  return (
    <div className="relative mx-auto flex size-48 items-center justify-center sm:size-56" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200/60 via-sky-200/40 to-emerald-100/30 blur-2xl dark:from-violet-900/30 dark:via-sky-900/20 dark:to-emerald-900/20" />

      <svg viewBox="0 0 200 200" className="relative size-full" fill="none">
        {PATHS.map((d, index) => (
          <motion.path
            key={d}
            d={d}
            stroke="var(--color-primary)"
            strokeWidth={1}
            strokeLinecap="round"
            strokeOpacity={0.35}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
          />
        ))}

        {NODES.map((node, index) => (
          <motion.circle
            key={node.id}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="var(--color-primary)"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
          />
        ))}

        {/* Calm continuous breathing glow — the one loop on this screen, slow and subtle. */}
        <motion.circle
          cx={100}
          cy={100}
          r={7}
          fill="var(--color-primary)"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3.2, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}
