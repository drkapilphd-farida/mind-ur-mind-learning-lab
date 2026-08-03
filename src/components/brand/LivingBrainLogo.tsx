'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Living Brain™ Logo — official mark. Structure kept deliberately
// granular (separate brain-fill group, gyri-line group, node-network
// group, book group, core group) so any of those can be animated
// independently later without touching this file's geometry.

type ColorMode = 'full-color' | 'dark' | 'light'

type LivingBrainLogoProps = {
  size?: number
  className?: string
  animated?: boolean
  colorMode?: ColorMode
  // Decorative (default): aria-hidden, used alongside text that already
  // conveys the meaning (e.g. next to the "Discover Your Learning
  // Potential™" headline). Set false for standalone/accessible usage
  // (e.g. a bare header mark with no adjacent heading).
  decorative?: boolean
}

const CENTER_X = 100

// Mirrors every "x,y" coordinate pair in a path's x value around
// CENTER_X. Geometry is pre-mirrored (rather than mirrored via an SVG
// `transform`) because a userSpaceOnUse gradient is resolved in the
// coordinate system at the point of reference — an ancestor
// `scale(-1,1)` would flip the gradient along with the shape, undoing
// the left-to-right blue-to-green brand gradient on the right hemisphere.
function mirrorPathX(d: string): string {
  return d.replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_match, x: string, y: string) => {
    const mirroredX = CENTER_X * 2 - parseFloat(x)
    return `${mirroredX},${y}`
  })
}

// Filled brain silhouette — three rounded lobes narrowing toward the
// base, closed by a straight inner edge (the Z) that forms the center
// spine shared with the mirrored hemisphere.
const LEFT_HEMISPHERE_FILL =
  'M100,14 C84,-4 52,-6 38,14 C28,28 32,40 46,46 C28,42 6,54 6,76 C6,94 20,102 36,98 C18,102 2,118 8,138 C13,156 30,164 48,158 C62,154 82,148 100,132 Z'
const RIGHT_HEMISPHERE_FILL = mirrorPathX(LEFT_HEMISPHERE_FILL)

// Gyri accent lines — short white strokes suggesting brain folds,
// echoing the reference mark without tracing every fold literally.
const LEFT_GYRI_LINES = ['M80,20 C68,28 60,36 58,44', 'M52,64 C42,70 34,78 30,88'] as const
const RIGHT_GYRI_LINES = LEFT_GYRI_LINES.map(mirrorPathX)

// Node network — a small branching circuit (core → mid-node →
// outer-node) per hemisphere, white on top of the brain fill.
const LEFT_NODES = [
  { id: 'n1', cx: 78, cy: 55, r: 3.2 },
  { id: 'n2', cx: 58, cy: 40, r: 3.6 },
  { id: 'n3', cx: 60, cy: 82, r: 3.2 },
  { id: 'n4', cx: 36, cy: 96, r: 3.6 },
] as const
const RIGHT_NODES = LEFT_NODES.map((n) => ({ ...n, id: `${n.id}-r`, cx: CENTER_X * 2 - n.cx }))

const CORE_CENTER = { x: 100, y: 126 }

type NodeId = (typeof LEFT_NODES)[number]['id']
const LEFT_NODE_MAP = new Map<NodeId, (typeof LEFT_NODES)[number]>(LEFT_NODES.map((n) => [n.id, n]))
const RIGHT_NODE_MAP = new Map<NodeId, (typeof RIGHT_NODES)[number]>(RIGHT_NODES.map((n, i) => [LEFT_NODES[i]!.id, n]))

const CONNECTIONS: readonly [NodeId, NodeId][] = [
  ['n1', 'n2'],
  ['n3', 'n4'],
]

// Book — one solid page-wedge per side (wide, like a real open page,
// not a thin ribbon) plus two white page-fold accent lines.
const LEFT_BOOK_FLAP = 'M100,130 C70,148 35,156 4,168 C34,186 72,192 100,166 Z'
const RIGHT_BOOK_FLAP = mirrorPathX(LEFT_BOOK_FLAP)

const LEFT_BOOK_FOLDS = ['M96,140 C72,156 40,164 14,172', 'M98,152 C78,168 50,178 24,184'] as const
const RIGHT_BOOK_FOLDS = LEFT_BOOK_FOLDS.map(mirrorPathX)

const COLOR_STOPS: Record<ColorMode, { from: string; to: string; ring: string; glow: string; dot: string }> = {
  'full-color': { from: '#2B4CE8', to: '#0FD9A0', ring: '#FFFFFF', glow: '#4FE0FF', dot: '#132A6B' },
  dark: { from: '#FFFFFF', to: '#FFFFFF', ring: '#FFFFFF', glow: '#FFFFFF', dot: '#FFFFFF' },
  light: { from: '#B8BEC9', to: '#B8BEC9', ring: '#E7ECEF', glow: '#B8E8F2', dot: '#8B96A3' },
}

export function LivingBrainLogo({
  size,
  className,
  animated = true,
  colorMode = 'full-color',
  decorative = true,
}: LivingBrainLogoProps): React.JSX.Element {
  const [clickPulse, setClickPulse] = useState(0)
  const gradientId = `living-brain-gradient-${colorMode}`
  const glowId = `living-brain-core-glow-${colorMode}`
  const colors = COLOR_STOPS[colorMode]

  const accessibilityProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': 'Quantum Mind Living Brain Logo' }

  const sizeStyle = size !== undefined ? { width: size, height: size } : {}

  return (
    <motion.div
      className={cn('relative inline-block', className)}
      style={sizeStyle}
      animate={animated ? { scale: [1, 1.02, 1] } : {}}
      transition={animated ? { duration: 4, ease: 'easeInOut', repeat: Infinity } : {}}
      whileHover="hover"
      onClick={() => setClickPulse((p) => p + 1)}
    >
      <motion.div
        key={clickPulse}
        initial={{ scale: 1 }}
        animate={clickPulse > 0 ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="size-full"
      >
        <svg viewBox="0 0 200 200" className="size-full" fill="none" {...accessibilityProps}>
          <defs>
            {/* userSpaceOnUse + absolute coordinates, applied only to
                elements whose geometry is itself pre-mirrored (never
                wrapped in a transform) — see mirrorPathX above. */}
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            <filter id={glowId} x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="6" result="blur" />
            </filter>
          </defs>

          {/* Brain — filled silhouette, both hemispheres */}
          <g fill={`url(#${gradientId})`} stroke={`url(#${gradientId})`} strokeWidth={0.75} strokeLinejoin="round">
            <path d={LEFT_HEMISPHERE_FILL} />
            <path d={RIGHT_HEMISPHERE_FILL} />
          </g>

          {/* Gyri accent lines */}
          <g stroke="white" strokeOpacity={0.85} strokeWidth={2} strokeLinecap="round" fill="none">
            {LEFT_GYRI_LINES.map((d) => (
              <path key={d} d={d} />
            ))}
            {RIGHT_GYRI_LINES.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>

          {/* Node network */}
          <g stroke="white" strokeOpacity={0.9} strokeWidth={1.4}>
            {CONNECTIONS.map(([a, b]) => {
              const leftFrom = LEFT_NODE_MAP.get(a)!
              const leftTo = LEFT_NODE_MAP.get(b)!
              const rightFrom = RIGHT_NODE_MAP.get(a)!
              const rightTo = RIGHT_NODE_MAP.get(b)!
              return (
                <g key={a}>
                  <line x1={CORE_CENTER.x} y1={CORE_CENTER.y} x2={leftFrom.cx} y2={leftFrom.cy} />
                  <line x1={leftFrom.cx} y1={leftFrom.cy} x2={leftTo.cx} y2={leftTo.cy} />
                  <line x1={CORE_CENTER.x} y1={CORE_CENTER.y} x2={rightFrom.cx} y2={rightFrom.cy} />
                  <line x1={rightFrom.cx} y1={rightFrom.cy} x2={rightTo.cx} y2={rightTo.cy} />
                </g>
              )
            })}
          </g>
          <g fill="white">
            {LEFT_NODES.map((node) => (
              <circle key={node.id} cx={node.cx} cy={node.cy} r={node.r} />
            ))}
            {RIGHT_NODES.map((node) => (
              <circle key={node.id} cx={node.cx} cy={node.cy} r={node.r} />
            ))}
          </g>

          {/* Book — filled flaps beneath the brain */}
          <g fill={`url(#${gradientId})`}>
            <path d={LEFT_BOOK_FLAP} />
            <path d={RIGHT_BOOK_FLAP} />
          </g>
          <g stroke="white" strokeOpacity={0.85} strokeWidth={1.6} strokeLinecap="round" fill="none">
            {LEFT_BOOK_FOLDS.map((d) => (
              <path key={d} d={d} />
            ))}
            {RIGHT_BOOK_FOLDS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>

          {/* Spine — connects the brain base through the core to the book */}
          <line x1="100" y1="118" x2="100" y2="168" stroke={`url(#${gradientId})`} strokeWidth={3} />

          {/* Center core — Learning Potential™. The ring and dot always
              read clearly; only the surrounding glow softly intensifies
              on hover, per "very soft glow around the center core." */}
          <motion.circle
            cx={CORE_CENTER.x}
            cy={CORE_CENTER.y}
            r="18"
            fill={colors.glow}
            filter={`url(#${glowId})`}
            variants={{ hover: { opacity: 0.75 } }}
            initial={{ opacity: 0.45 }}
          />
          <circle cx={CORE_CENTER.x} cy={CORE_CENTER.y} r="11" fill="none" stroke={colors.ring} strokeWidth={3} />
          <circle cx={CORE_CENTER.x} cy={CORE_CENTER.y} r="4.5" fill={colors.dot} />
        </svg>
      </motion.div>
    </motion.div>
  )
}
