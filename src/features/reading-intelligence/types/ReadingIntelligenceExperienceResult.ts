import type { ReadingDailyMission } from './ReadingDailyMission'
import type { ReadingIntelligenceValidation } from './ReadingIntelligenceValidation'
import type { ReadingJourneyState } from './ReadingJourneyState'
import type { ReadingProgressSnapshot } from './ReadingProgressSnapshot'
import type { ReadingXp } from './ReadingXp'

// The terminal result of `ReadingIntelligenceExperience.load()`.
export type ReadingIntelligenceExperienceResult = {
  readonly journeyState: ReadingJourneyState
  readonly dailyMission: ReadingDailyMission
  readonly progressSnapshot: ReadingProgressSnapshot
  readonly xp: ReadingXp
  readonly validation: ReadingIntelligenceValidation
}
