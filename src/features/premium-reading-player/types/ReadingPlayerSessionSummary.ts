import type { ReadingXp } from '@/features/reading-intelligence'

// Composes Sprint 46's reading-intelligence output with this exercise's own
// caller-reported outcome — no new scoring, streak, or journey logic.
// `readingScore` is a pass-through of ReadingPlayerExerciseOutcome.accuracyPercent;
// `mindScore`/`mindScoreLabel`/`xp` are ReadingIntelligenceExperienceResult's own
// fields, unchanged.
export type ReadingPlayerSessionSummary = {
  readonly readingScore: number | null
  readonly mindScore: number
  readonly mindScoreLabel: string
  readonly xp: ReadingXp
  readonly continueHref: string
  readonly continueLabel: string
}
