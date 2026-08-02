import type { StrengthDetector } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'
import { ACTIVE_RECALL_MODES } from './activeRecallModes'

// Implements StrengthDetector. Mirrors MockWeaknessDetector's honesty
// stance: real, structural signals only (session consistency, active
// recall usage), never a fabricated per-concept strength claim.
export class MockStrengthDetector implements StrengthDetector {
  async detect(snapshot: MentorActivitySnapshot): Promise<readonly MentorInsight[]> {
    const insights: MentorInsight[] = []

    if (snapshot.sessionCount >= 3) {
      insights.push({
        id: `strength-${snapshot.learningProjectId}-consistency`,
        type: 'strength',
        summary: 'Consistent study habit',
        detail: `${snapshot.sessionCount} sessions so far shows real consistency — keep it up.`,
      })
    }

    const usedActiveRecall = snapshot.studyModesUsed.some((mode) => ACTIVE_RECALL_MODES.has(mode))
    if (usedActiveRecall) {
      insights.push({
        id: `strength-${snapshot.learningProjectId}-active-recall`,
        type: 'strength',
        summary: 'Practicing active recall',
        detail: 'Using quizzes, flashcards, or practice questions — this is one of the most effective ways to build lasting memory.',
      })
    }

    return insights
  }
}

export function createStrengthDetector(): StrengthDetector {
  return new MockStrengthDetector()
}
