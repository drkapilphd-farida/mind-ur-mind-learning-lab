import type { DailyStreak } from '@/lib/exercises/practiceHistory'
import type { ReadingProgressSnapshot, ReadingXp } from '@/features/reading-intelligence'
import type { ReadingExerciseQueue } from './ReadingExerciseQueue'

// The unified "one premium learning flow" view — every field here is either
// a direct read of an already-computed Sprint 46 value or the new Exercise
// Queue this sprint adds. Nothing here recomputes scoring, streaks, XP, or
// journey progress.
export type ReadingIntelligenceJourney = {
  readonly welcomeTitle: string
  readonly missionLabel: string
  readonly continueHref: string
  readonly continueLabel: string
  readonly queue: ReadingExerciseQueue
  readonly progress: ReadingProgressSnapshot
  readonly streak: DailyStreak
  readonly mindScore: number
  readonly mindScoreLabel: string
  readonly xp: ReadingXp
  readonly nextRecommendationLabel: string
  readonly nextRecommendationHref: string
}
