'use client'

import { motion } from 'framer-motion'

const RING_DELAYS = [0, 0.4, 0.8] as const

// A lightweight "processing" glyph — three concentric, gently pulsing
// rings around a still center. Deliberately not a spinner: nothing
// rotates, everything breathes, matching the platform's calm motion
// language rather than a generic loading indicator.
export function AnalysingBrain(): React.JSX.Element {
  return (
    <div className="relative flex size-24 items-center justify-center" aria-hidden="true">
      {RING_DELAYS.map((delay) => (
        <motion.div
          key={delay}
          className="border-primary/40 absolute size-full rounded-full border"
          initial={{ scale: 0.4, opacity: 0.6 }}
          animate={{ scale: [0.4, 1], opacity: [0.6, 0] }}
          transition={{ duration: 2, delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
      <div className="bg-primary size-4 rounded-full" />
    </div>
  )
}
