import type { ReadingCompletionContract } from '../types'

// Shape matches `MicroVictoryMomentProps` exactly (src/components/exercises/MicroVictoryMoment.tsx)
// — derives the `progressLabel` content only. No reimplementation of the
// completion moment itself; a future page passes this straight through to
// the existing, unmodified component.
export function buildReadingCompletionContract(
  stageTitle: string | null,
  position: { index: number; total: number } | null,
): ReadingCompletionContract {
  if (stageTitle === null) {
    return { progressLabel: null }
  }

  if (position === null) {
    return { progressLabel: stageTitle }
  }

  return { progressLabel: `${stageTitle} — ${position.index} of ${position.total}` }
}
