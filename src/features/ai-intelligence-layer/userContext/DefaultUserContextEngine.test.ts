import { describe, expect, it } from 'vitest'
import { createUserContextEngine } from './DefaultUserContextEngine'

describe('DefaultUserContextEngine', () => {
  const engine = createUserContextEngine()

  it('defaults every field for an empty input', () => {
    expect(engine.buildContext({})).toEqual({
      userProfile: { id: 'unknown-user', displayName: 'Learner' },
      ageGroup: 'adult',
      preferredLanguage: 'en',
      currentJourney: null,
      currentLab: null,
      activeExercise: null,
      learningGoal: null,
      difficultyLevel: 'beginner',
    })
  })

  it('passes through every explicitly given field', () => {
    const context = engine.buildContext({
      userProfile: { id: 'u1', displayName: 'Ada' },
      ageGroup: 'child',
      preferredLanguage: 'fr',
      currentJourney: 'quantum-speed-reading',
      currentLab: 'reading-discovery',
      activeExercise: 'eye-warm-up',
      learningGoal: 'read faster',
      difficultyLevel: 'advanced',
    })
    expect(context.userProfile.displayName).toBe('Ada')
    expect(context.ageGroup).toBe('child')
    expect(context.preferredLanguage).toBe('fr')
    expect(context.difficultyLevel).toBe('advanced')
  })

  it('never leaves a field undefined, even for a partially-filled input', () => {
    const context = engine.buildContext({ ageGroup: 'teen' })
    expect(context.currentJourney).toBeNull()
    expect(context.learningGoal).toBeNull()
    expect(context.difficultyLevel).toBe('beginner')
  })
})
