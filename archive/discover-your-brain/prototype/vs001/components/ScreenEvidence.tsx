'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnalysingBrain } from './AnalysingBrain'

const ANALYSING_DURATION_MS = 2000

type EvidencePhase = 'analysing' | 'comparing'

type ScreenEvidenceProps = {
  onReveal: () => void
}

// Simulated only — no real analysis happens on this screen. The delay and
// copy exist purely to communicate that something is being considered.
export function ScreenEvidence({ onReveal }: ScreenEvidenceProps): React.JSX.Element {
  const [phase, setPhase] = useState<EvidencePhase>('analysing')

  useEffect(() => {
    const timer = setTimeout(() => setPhase('comparing'), ANALYSING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <AnalysingBrain />

      <AnimatePresence mode="wait">
        {phase === 'analysing' ? (
          <motion.p
            key="analysing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="text-lg leading-8 text-muted-foreground"
          >
            Analysing your response...
          </motion.p>
        ) : (
          <motion.div
            key="comparing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-8"
          >
            <p className="max-w-md text-lg leading-8 text-muted-foreground">
              Looking beyond your answer...
              <br />
              We&apos;re comparing what you expected with what actually happened.
            </p>
            <Button size="lg" onClick={onReveal} className="min-w-[220px] rounded-full text-base shadow-sm">
              Reveal
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
