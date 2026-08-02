'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type QuickLookFlashCardProps = {
  word: string
  onDone: () => void
  headerSlot?: React.ReactNode
}

// A brief primer (long enough to read two short lines), then the target
// word appears and holds. The outer scene-to-scene crossfade (shared by
// every screen in this flow) supplies the "fade out, then the options
// appear" beat when this scene unmounts — no bespoke blank-gap timer needed.
const INSTRUCTION_MS = 1300
const WORD_VISIBLE_MS = 800

// Experiment 1 — Quick Look™ (Recognition). Entirely timer-driven, no
// interaction: the word simply appears, holds, and this scene ends.
export function QuickLookFlashCard({ word, onDone, headerSlot }: QuickLookFlashCardProps): React.JSX.Element {
  const [phase, setPhase] = useState<'intro' | 'word'>('intro')

  useEffect(() => {
    const toWord = window.setTimeout(() => setPhase('word'), INSTRUCTION_MS)
    return () => window.clearTimeout(toWord)
  }, [])

  useEffect(() => {
    if (phase !== 'word') return
    const toDone = window.setTimeout(onDone, WORD_VISIBLE_MS)
    return () => window.clearTimeout(toDone)
  }, [phase, onDone])

  return (
    <ReadingExperimentLayout headerSlot={headerSlot}>
      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Quick Look</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              A word will appear briefly.
              <br />
              Simply notice it.
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="word"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="font-heading text-5xl font-bold text-foreground sm:text-6xl"
          >
            {word}
          </motion.p>
        )}
      </AnimatePresence>
    </ReadingExperimentLayout>
  )
}
