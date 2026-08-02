'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MysteryLayout } from './MysteryLayout'

const LINE_INTERVAL_MS = 1100
const HOLD_AFTER_LAST_MS = 1600

// The first two lines complete one continuing sentence across a pause;
// the third is a separate closing thought — matching the accumulating
// build-up already used in SceneHook/SceneNextMystery.
const LINES = ["We're looking for patterns...", '...not individual answers.', 'Your brain leaves subtle clues.'] as const

type EvidenceCardProps = {
  onComplete: () => void
}

// Scene 6 — Evidence. Not a real analysis step (no scoring, no AI) — a
// calm moment that makes the software feel like it's genuinely
// considering what just happened, before anything is revealed.
export function EvidenceCard({ onComplete }: EvidenceCardProps): React.JSX.Element {
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    if (visibleCount < LINES.length) {
      const timer = setTimeout(() => setVisibleCount((c) => c + 1), LINE_INTERVAL_MS)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(onComplete, HOLD_AFTER_LAST_MS)
    return () => clearTimeout(timer)
  }, [visibleCount, onComplete])

  return (
    <MysteryLayout>
      <div className="relative flex size-20 items-center justify-center" aria-hidden="true">
        {[0, 0.4, 0.8].map((delay) => (
          <motion.div
            key={delay}
            className="border-primary/40 absolute size-full rounded-full border"
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: [0.4, 1], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="bg-primary size-3.5 rounded-full" />
      </div>

      <div className="max-w-md space-y-2" aria-live="polite">
        {LINES.slice(0, visibleCount).map((line) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-lg leading-8 text-muted-foreground"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </MysteryLayout>
  )
}
