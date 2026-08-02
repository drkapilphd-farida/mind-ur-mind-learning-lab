import type { JourneyProgress } from '@/lib/exercises/journeyProgress'
import type { DailyStreak } from '@/lib/exercises/practiceHistory'

// Composes the real, live journey + streak + Mind Score into one aggregate
// view for the Experience Layer. Wraps already-computed real data — recomputes
// nothing, duplicates no logic from journeyProgress.ts/practiceHistory.ts/mindScore.ts.
export type ReadingJourneyState = {
  readonly journey: JourneyProgress
  readonly streak: DailyStreak
  readonly mindScore: number
  readonly mindScoreLabel: string
}
