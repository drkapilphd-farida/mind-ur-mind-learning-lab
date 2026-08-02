import type { UserContext } from '../types'
import type { UserContextEngine } from '../contracts'

const DEFAULT_USER_PROFILE: UserContext['userProfile'] = { id: 'unknown-user', displayName: 'Learner' }

// Implements UserContextEngine. Pure defaulting — no field is ever
// left `undefined`; unknown identity/journey/lab/goal fields become
// `null` (an honest "not known"), never a guessed value.
export class DefaultUserContextEngine implements UserContextEngine {
  buildContext(input: Partial<UserContext>): UserContext {
    return {
      userProfile: input.userProfile ?? DEFAULT_USER_PROFILE,
      ageGroup: input.ageGroup ?? 'adult',
      preferredLanguage: input.preferredLanguage ?? 'en',
      currentJourney: input.currentJourney ?? null,
      currentLab: input.currentLab ?? null,
      activeExercise: input.activeExercise ?? null,
      learningGoal: input.learningGoal ?? null,
      difficultyLevel: input.difficultyLevel ?? 'beginner',
    }
  }
}

export function createUserContextEngine(): UserContextEngine {
  return new DefaultUserContextEngine()
}
