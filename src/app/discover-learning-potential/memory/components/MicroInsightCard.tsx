'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MICRO_FEEDBACK_DISPLAY_MS } from '@/features/memory-discovery/memoryTimingConfig'
import { MemoryExperimentLayout } from './MemoryExperimentLayout'

type MicroInsightCardProps = {
  eyebrow?: string
  lines: readonly string[]
  onDone: () => void
}

// Micro Brain Insight™ — a calm, momentary reward beat between
// experiments, never a report or a score. Purely timer-driven: fades in
// with every other scene's shared transition, holds, then this scene ends
// on its own — no interaction, no CTA. Sprint-1.6 FIX-08 — each real line
// already carries its own real emoji (`microInsights.ts`), so the old
// static 🧠 header was dropped as redundant clutter; the line itself is
// now the whole, punchy, immediate reward. Sprint-2.1 FIX-12 — the real
// display duration now lives in the one centralized timing config.
export function MicroInsightCard({ eyebrow, lines, onDone }: MicroInsightCardProps): React.JSX.Element {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, MICRO_FEEDBACK_DISPLAY_MS)
    return () => window.clearTimeout(timeout)
  }, [onDone])

  return (
    <MemoryExperimentLayout maxWidthClassName="max-w-sm">
      {eyebrow !== undefined ? <p className="font-heading text-lg font-semibold text-foreground sm:text-xl">{eyebrow}</p> : null}
      <div className={eyebrow !== undefined ? 'mt-3' : ''}>
        {lines.map((line) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="font-heading text-xl font-semibold text-foreground sm:text-2xl"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </MemoryExperimentLayout>
  )
}
