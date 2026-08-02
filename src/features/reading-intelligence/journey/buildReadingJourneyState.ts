import type { JourneyProgress } from '@/lib/exercises/journeyProgress'
import type { DailyStreak } from '@/lib/exercises/practiceHistory'
import type { ReadingJourneyState } from '../types'

// Pure composition — packages already-computed real journey/streak/Mind
// Score values into one cohesive view. Recomputes nothing.
export function buildReadingJourneyState(
  journey: JourneyProgress,
  streak: DailyStreak,
  mindScore: number,
  mindScoreLabel: string,
): ReadingJourneyState {
  return { journey, streak, mindScore, mindScoreLabel }
}
