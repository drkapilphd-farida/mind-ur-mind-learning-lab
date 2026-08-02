export type QuantumJourneyChapterStatus = 'locked' | 'ready' | 'current' | 'completed'

export type QuantumJourneyChapterCard = {
  chapterOrder: number
  title: string
  estimatedMinutes: number
  status: QuantumJourneyChapterStatus
  assessmentScore: { correct: number; total: number } | null
}

export type DeriveChapterInput = {
  chapterOrder: number
  title: string | null
  estimatedMinutes: number | null
  isCompleted: boolean
  isStarted: boolean
  assessmentScore: { correct: number; total: number } | null
}

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2.5: Reading Journey
// UX & Navigation™. Deliberately its own file, outside loadQuantumJourneyOverview.ts
// — a `'use server'` file may only export async Server Actions (Next.js
// build-enforced), and this is a plain, pure function. Exported so it has
// direct unit test coverage without a Supabase mock — the same "extract
// the real logic, test that in isolation" discipline this codebase
// already applies (computeLongestCombo, resolveSessionForContext). At
// most one chapter is ever 'current' (started, not finished) or 'ready'
// (unlocked, never started) — whichever comes first in order; everything
// after it is 'locked'; everything at or before the last completed
// chapter is 'completed'.
export function deriveQuantumJourneyChapters(inputs: readonly DeriveChapterInput[]): { chapters: readonly QuantumJourneyChapterCard[]; currentChapterOrder: number; chaptersCompleted: number } {
  let chaptersCompleted = 0
  let currentChapterOrder = 0
  let frontierAssigned = false
  const chapters: QuantumJourneyChapterCard[] = []

  for (const input of inputs) {
    if (input.isCompleted) chaptersCompleted += 1

    let status: QuantumJourneyChapterStatus
    if (input.isCompleted) {
      status = 'completed'
    } else if (frontierAssigned) {
      status = 'locked'
    } else {
      status = input.isStarted ? 'current' : 'ready'
      currentChapterOrder = input.chapterOrder
      frontierAssigned = true
    }

    chapters.push({
      chapterOrder: input.chapterOrder,
      title: input.title ?? `Chapter ${input.chapterOrder + 1}`,
      estimatedMinutes: input.estimatedMinutes ?? 3,
      status,
      assessmentScore: input.assessmentScore,
    })
  }
  // Every chapter completed — the "current" chapter is honestly the last one, for display only (no further chapter to unlock).
  if (!frontierAssigned && inputs.length > 0) currentChapterOrder = inputs.length - 1

  return { chapters, currentChapterOrder, chaptersCompleted }
}
