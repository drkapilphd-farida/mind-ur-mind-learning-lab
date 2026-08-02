'use client'

import { motion } from 'framer-motion'
import { LivingBrainLogo } from '@/components/brand/LivingBrainLogo'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

// AI Presence™ (UX Micro Sprint) — wraps the existing, unmodified
// LivingBrainLogo (src/components/brand/LivingBrainLogo.tsx, already used
// in 4 other live screens under discover-learning-potential/) with a new
// breathing/glow/float treatment, entirely OUTSIDE that shared component.
// Zero changes to LivingBrainLogo.tsx — its own `animated` prop is simply
// set to false here, and this wrapper drives its own separate animation on
// top, so the 4 existing usages (which don't render this wrapper) are
// completely unaffected. The goal is presence, not decoration: "the AI is
// waiting for me," not "this logo is animated" — one continuous loop, never
// stopping, jumping, or pulsing aggressively.

type AIPresenceMode = 'idle' | 'thinking'

type AIPresenceLogoProps = {
  size?: number
  className?: string
  // Briefly true right after the user presses "Let's Begin" — triggers a
  // small (~300ms) acknowledgment glow, separate from the idle breathing.
  acknowledging?: boolean
  // Sprint LW-1D — 'thinking' is a new, opt-in "active intelligence" mode
  // for the AI Processing Experience™: faster breath, brighter glow, and a
  // ring of small orbiting light dots (suggesting "connection lines"
  // abstractly). Defaults to 'idle', so every existing call site (Arrival
  // Experience™, Choose Learning Method™, Record & Learn™) is byte-
  // identical unless it opts in. Deliberately built entirely in this
  // wrapper, not inside LivingBrainLogo.tsx — that component is shared
  // with 5 Discovery-flow screens this arc has never touched.
  mode?: AIPresenceMode
}

// 6-8s range from the brief; 7s is the midpoint. One continuous, seamless
// loop — scale and float share the exact same transition so they can never
// drift out of sync with each other.
const IDLE_BREATH_TRANSITION = { duration: 7, ease: 'easeInOut', repeat: Infinity } as const
// 'thinking' mode breathes noticeably faster — "the breathing animation
// should gradually transform into an active intelligence animation."
const THINKING_BREATH_TRANSITION = { duration: 3.5, ease: 'easeInOut', repeat: Infinity } as const
const ORBIT_TRANSITION = { duration: 6, ease: 'linear', repeat: Infinity } as const

// Matches LivingBrainLogo's own internal full-color glow hex
// (COLOR_STOPS['full-color'].glow) — reused here so the ambient presence
// glow reads as one coherent brand colour, not a second, invented blue.
const PRESENCE_GLOW_COLOR = '#4FE0FF'

// Sprint LW-1C.1 — a one-time premium entrance, independent of the
// continuous breathing loop below: plays once on mount, then the symbol
// settles into its permanent idle breath. Reduced motion keeps a plain
// opacity fade only — no scale/translate.
const ENTRANCE_TRANSITION = { duration: 0.8, ease: 'easeOut' } as const

const ORBIT_DOTS = [0, 120, 240] as const

export function AIPresenceLogo({ size = 112, className, acknowledging = false, mode = 'idle' }: AIPresenceLogoProps): React.JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isThinking = mode === 'thinking'
  const breathTransition = isThinking ? THINKING_BREATH_TRANSITION : IDLE_BREATH_TRANSITION
  const glowOpacityRange = isThinking ? [0.22, 0.45, 0.22] : [0.14, 0.32, 0.14]
  const glowScaleRange = isThinking ? [0.95, 1.18, 0.95] : [0.92, 1.12, 0.92]

  return (
    <motion.div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={ENTRANCE_TRANSITION}
    >
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full blur-3xl"
          style={{ backgroundColor: PRESENCE_GLOW_COLOR }}
          animate={{ opacity: glowOpacityRange, scale: glowScaleRange }}
          transition={breathTransition}
          aria-hidden="true"
        />
      )}

      {!prefersReducedMotion && acknowledging && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: PRESENCE_GLOW_COLOR }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.5, 0] }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}

      {/* 'thinking' mode only — a slow ring of small orbiting light dots,
          suggesting active connections without touching LivingBrainLogo's
          own internal node-network paths. */}
      {!prefersReducedMotion && isThinking && (
        <motion.div className="pointer-events-none absolute inset-0" animate={{ rotate: 360 }} transition={ORBIT_TRANSITION} aria-hidden="true">
          {ORBIT_DOTS.map((angle) => (
            <span
              key={angle}
              className="absolute top-1/2 left-1/2 size-1.5 rounded-full"
              style={{
                backgroundColor: PRESENCE_GLOW_COLOR,
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${size * 0.58}px)`,
              }}
            />
          ))}
        </motion.div>
      )}

      <motion.div
        className="relative"
        animate={!prefersReducedMotion ? { scale: [0.96, 1, 0.96], y: [0, -2.5, 0] } : {}}
        transition={!prefersReducedMotion ? breathTransition : {}}
      >
        <LivingBrainLogo size={size} animated={false} />
      </motion.div>
    </motion.div>
  )
}
