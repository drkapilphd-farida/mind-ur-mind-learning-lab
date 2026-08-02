'use client'

import { useEffect } from 'react'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type ReadNaturallyCardProps = {
  sentence: string
  onDone: () => void
  headerSlot?: React.ReactNode
}

const MIN_DISPLAY_MS = 2200
const MAX_DISPLAY_MS = 4500
const MS_PER_WORD = 280

function displayDurationFor(sentence: string): number {
  const wordCount = sentence.trim().split(/\s+/).length
  return Math.max(MIN_DISPLAY_MS, Math.min(MAX_DISPLAY_MS, wordCount * MS_PER_WORD))
}

// Experiment 3, phase A — Read Naturally™ (Sentence Flow). The sentence
// holds for a reading-time-scaled duration, then this scene ends on its
// own — no Continue button — flowing straight into the meaning question.
export function ReadNaturallyCard({ sentence, onDone, headerSlot }: ReadNaturallyCardProps): React.JSX.Element {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, displayDurationFor(sentence))
    return () => window.clearTimeout(timeout)
  }, [sentence, onDone])

  return (
    <ReadingExperimentLayout headerSlot={headerSlot}>
      <p className="font-heading text-2xl leading-snug font-semibold text-foreground sm:text-3xl">{sentence}</p>
    </ReadingExperimentLayout>
  )
}
