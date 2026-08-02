'use client'

import { motion } from 'framer-motion'
import { BrainIllustration } from '../../components/BrainIllustration'

// BrainIllustration's own outer element is a fixed size (size-48/56) we
// don't modify — visually shrinking it to "very small" is done with a
// CSS transform scale on a wrapper instead, precomputed against that
// continuous breathing so the two combine into one smooth animation.
const BASE_SCALE = 0.24
const BREATH_PEAK_SCALE = BASE_SCALE * 1.015

type PersistentBrainProps = {
  // Increments once per Brain Moment transition — each increment plays
  // one gentle glow pulse without ever touching the brain's own
  // continuous breathing or remounting it.
  pulseSignal: number
}

// Rule 4 — the Brain stays visible for the entire chapter: small, top
// center, breathing gently, never interrupted. Rule 5 — a soft glow burst
// (a separate, small overlay element) marks each transition between Brain
// Moments; the brain itself never resets or remounts.
export function PersistentBrain({ pulseSignal }: PersistentBrainProps): React.JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-10 flex justify-center" aria-hidden="true">
      <motion.div
        animate={{ scale: [BASE_SCALE, BREATH_PEAK_SCALE, BASE_SCALE] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        className="relative"
      >
        {pulseSignal > 0 && (
          <motion.div
            key={pulseSignal}
            className="bg-primary/25 absolute inset-0 -z-10 rounded-full blur-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.6, 1.6] }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}
        <BrainIllustration />
      </motion.div>
    </div>
  )
}
