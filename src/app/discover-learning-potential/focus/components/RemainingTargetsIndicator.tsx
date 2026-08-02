'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { pickRemainingTargetsCopy } from '@/features/focus-discovery/pickRemainingTargetsCopy'

type RemainingTargetsIndicatorProps = {
  remaining: number
  total: number
}

// FIX-03 Remaining Targets Counter™ — "users should always know how much
// work remains... keep it subtle, never dominate the screen." Updates
// the instant a real tap is recorded (parent state change), never
// waiting for any animation to finish first. FIX-12 AI Interaction
// Awareness™ — the one short, real reactive line underneath, computed
// from this same real count.
export function RemainingTargetsIndicator({ remaining, total }: RemainingTargetsIndicatorProps): React.JSX.Element {
  const encouragement = pickRemainingTargetsCopy(remaining, total)

  return (
    <div className="mb-4 flex flex-col items-center gap-1.5">
      <motion.div
        key={remaining}
        initial={{ opacity: 0, y: -3, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground"
      >
        <span aria-hidden="true">🎯</span>
        {remaining} remaining
      </motion.div>
      <AnimatePresence mode="wait">
        {encouragement !== null && (
          <motion.p
            key={encouragement}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-muted-foreground/80"
          >
            {encouragement}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
