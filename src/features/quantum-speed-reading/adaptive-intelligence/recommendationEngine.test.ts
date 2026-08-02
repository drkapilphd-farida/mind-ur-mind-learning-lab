import { describe, it, expect } from 'vitest'
import {
  generateTodaysInsight,
  generateSpeedCaution,
  generateCategoryRotationMessage,
  generateTodaysFocus,
  generateGoalRecommendation,
} from './recommendationEngine'
import { buildSession } from './testFixtures'

describe('generateTodaysInsight', () => {
  it('welcomes a first session with no prior data', () => {
    const msg = generateTodaysInsight(buildSession({ wpm: 200, accuracyPercent: 80 }), null)
    expect(msg).toContain('200 WPM')
    expect(msg).toContain('80% accuracy')
  })

  it('reports a real WPM improvement while accuracy held', () => {
    const previous = buildSession({ wpm: 200, accuracyPercent: 80 })
    const latest = buildSession({ wpm: 222, accuracyPercent: 85 })
    const msg = generateTodaysInsight(latest, previous)
    expect(msg).toContain('22 WPM')
  })

  it('reports a real WPM decrease', () => {
    const previous = buildSession({ wpm: 220 })
    const latest = buildSession({ wpm: 200 })
    const msg = generateTodaysInsight(latest, previous)
    expect(msg).toContain('20 WPM')
  })
})

describe('generateSpeedCaution', () => {
  it('cautions when WPM outpaces the passage target and comprehension lags', () => {
    // easy target is 200 WPM; well above target + low comprehension.
    const session = buildSession({ difficulty: 'easy', wpm: 400, comprehensionPercent: 60 })
    expect(generateSpeedCaution(session)).toContain('Reduce speed')
  })

  it('returns null when comprehension is healthy even at high speed', () => {
    const session = buildSession({ difficulty: 'easy', wpm: 400, comprehensionPercent: 95 })
    expect(generateSpeedCaution(session)).toBeNull()
  })
})

describe('generateCategoryRotationMessage', () => {
  it('suggests strengthening a weak category when a strong one exists', () => {
    const msg = generateCategoryRotationMessage({
      strongCategories: ['science'],
      weakCategories: ['history'],
      recentlyPracticed: [],
      needsRevision: [],
      suggestedNextCategory: null,
    })
    expect(msg).toContain('Science')
    expect(msg).toContain('History')
  })

  it('returns null when there is nothing to recommend', () => {
    const msg = generateCategoryRotationMessage({
      strongCategories: [],
      weakCategories: [],
      recentlyPracticed: [],
      needsRevision: [],
      suggestedNextCategory: null,
    })
    expect(msg).toBeNull()
  })
})

describe('generateTodaysFocus', () => {
  it('targets at least 90%, or the learner\'s own recent comprehension if higher', () => {
    expect(generateTodaysFocus(buildSession({ comprehensionPercent: 80 }))).toContain('90%')
    expect(generateTodaysFocus(buildSession({ comprehensionPercent: 96 }))).toContain('96%')
  })
})

describe('generateGoalRecommendation', () => {
  it('returns null when no goal is selected', () => {
    expect(generateGoalRecommendation(null)).toBeNull()
  })

  it('returns a goal-aware message for a real goal', () => {
    const msg = generateGoalRecommendation('book-reading-mastery')
    expect(msg).toContain('Book Reading Mastery')
    expect(msg).toContain('longer passages')
  })
})
