// Immutable — every field `readonly`. Covers both "Learning Progress"
// and "Personalization State" (Sprint 28 §4) — the brief names exactly
// 5 domain models, so both bullets are necessarily represented by this
// one type, not split further. Reduced from the Personalization
// Profile's own lifecycle, the Execution Plan's own difficulty
// sequence, and the Adaptation's own applied-result count — real
// reduction happens in `../integration/buildMentorLearningState.ts`.
export type MentorLearningState = {
  readonly profileLifecycle: string
  readonly difficultyLevel: string | null
  readonly appliedAdaptationCount: number
}
