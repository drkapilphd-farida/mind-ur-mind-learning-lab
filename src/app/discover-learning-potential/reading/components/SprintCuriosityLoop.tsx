'use client'

import { CuriosityBridge } from '@/features/discover-learning-potential/components/CuriosityBridge'
import { READING_SPRINT_CURIOSITY_COPY, type ReadingSprintId } from '@/features/reading-discovery/readingSprints'

type SprintCuriosityLoopProps = {
  nextSprint: ReadingSprintId
  onDone: () => void
}

// Reading Discovery Engine™ (Sprint-2 Part-1) — Curiosity Loop™. Reuses
// `CuriosityBridge` verbatim (built in the Foundation sprint, previously
// with exactly one real caller — the AI Profile reveal) rather than a
// new transition primitive, with this Sprint's own real copy.
export function SprintCuriosityLoop({ nextSprint, onDone }: SprintCuriosityLoopProps): React.JSX.Element {
  const headline = READING_SPRINT_CURIOSITY_COPY[nextSprint] ?? 'Great! Ready for the next challenge?'
  return (
    <main className="bg-background">
      <CuriosityBridge moment={{ headline, tone: 'progress' }} onDone={onDone} />
    </main>
  )
}
