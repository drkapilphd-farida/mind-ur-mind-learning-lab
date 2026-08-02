'use client'

import { useEffect } from 'react'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type ParagraphCardProps = {
  paragraph: string
  onDone: () => void
  headerSlot?: React.ReactNode
}

const MIN_DISPLAY_MS = 6000
const MAX_DISPLAY_MS = 11000
const MS_PER_WORD = 120

function displayDurationFor(paragraph: string): number {
  const wordCount = paragraph.trim().split(/\s+/).length
  return Math.max(MIN_DISPLAY_MS, Math.min(MAX_DISPLAY_MS, wordCount * MS_PER_WORD))
}

// Experiment 4, phase A — Understand™ (Meaning Extraction). The paragraph
// holds for a reading-time-scaled duration (70–90 words → ~8–11s), sized
// to avoid scrolling, then this scene ends on its own — no Continue
// button — flowing straight into its linked comprehension question.
export function ParagraphCard({ paragraph, onDone, headerSlot }: ParagraphCardProps): React.JSX.Element {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, displayDurationFor(paragraph))
    return () => window.clearTimeout(timeout)
  }, [paragraph, onDone])

  return (
    <ReadingExperimentLayout maxWidthClassName="max-w-md" headerSlot={headerSlot}>
      <p className="text-lg leading-8 text-foreground sm:text-xl sm:leading-9">{paragraph}</p>
    </ReadingExperimentLayout>
  )
}
