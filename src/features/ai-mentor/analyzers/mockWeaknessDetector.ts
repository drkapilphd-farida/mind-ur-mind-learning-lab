import type { WeaknessDetector } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'
import { ACTIVE_RECALL_MODES } from './activeRecallModes'

// Implements WeaknessDetector. No real per-concept accuracy data
// exists yet (no scored session history), so this never claims a
// learner is weak in a *specific* concept — that would be inventing a
// fact. Instead it flags one honest, structural signal derivable from
// real data: whether any active-recall study mode has been used at
// all. Returns an empty array (never a fabricated weakness) when there
// isn't enough signal yet or when active recall has been used.
export class MockWeaknessDetector implements WeaknessDetector {
  async detect(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]> {
    if (snapshot.sessionCount === 0) return []

    const usedActiveRecall = snapshot.studyModesUsed.some((mode) => ACTIVE_RECALL_MODES.has(mode))
    if (usedActiveRecall) return []

    return [
      {
        id: `weakness-${snapshot.learningProjectId}-active-recall`,
        type: 'weakness',
        summary: 'Limited active recall practice',
        detail: 'Sessions so far have leaned on review rather than active recall (quizzes, flashcards, or practice questions) — active recall tends to build stronger retention.',
      },
    ]
  }
}

export function createWeaknessDetector(): WeaknessDetector {
  return new MockWeaknessDetector()
}
