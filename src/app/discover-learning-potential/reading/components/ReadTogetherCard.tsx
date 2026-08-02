'use client'

import { useEffect } from 'react'
import { ReadingExperimentLayout } from './ReadingExperimentLayout'

type ReadTogetherCardProps = {
  wordGroups: readonly string[]
  onDone: () => void
  headerSlot?: React.ReactNode
}

// Long enough to skim 5 short phrases, short enough to keep this a glance,
// not a study session.
const DISPLAY_MS = 4000

// Experiment 2, phase A — Read Together™ (Chunk Reading). The word groups
// hold on screen, then this scene ends on its own — no Continue button —
// flowing straight into the recognition question that reuses these same
// phrases as its options.
export function ReadTogetherCard({ wordGroups, onDone, headerSlot }: ReadTogetherCardProps): React.JSX.Element {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, DISPLAY_MS)
    return () => window.clearTimeout(timeout)
  }, [onDone])

  return (
    <ReadingExperimentLayout maxWidthClassName="max-w-lg" headerSlot={headerSlot}>
      <div className="flex flex-col gap-5">
        {wordGroups.map((group) => (
          <p key={group} className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {group}
          </p>
        ))}
      </div>
    </ReadingExperimentLayout>
  )
}
