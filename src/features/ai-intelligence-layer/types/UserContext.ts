import type { AgeGroup } from './AgeGroup'
import type { DifficultyLevel } from './DifficultyLevel'
import type { UserProfile } from './UserProfile'

// The User Context Engine's™ output — every field the AI needs to know
// "who is this learner, right now" — normalized and fully defaulted, no
// field ever `undefined`. `currentJourney`/`currentLab`/`activeExercise`/
// `learningGoal` are `null` (not omitted) when genuinely unknown — an
// honest absence, not an invented value.
export type UserContext = {
  userProfile: UserProfile
  ageGroup: AgeGroup
  preferredLanguage: string
  currentJourney: string | null
  currentLab: string | null
  activeExercise: string | null
  learningGoal: string | null
  difficultyLevel: DifficultyLevel
}
