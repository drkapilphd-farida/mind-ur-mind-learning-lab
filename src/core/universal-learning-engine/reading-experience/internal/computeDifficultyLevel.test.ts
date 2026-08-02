import { describe, expect, it } from 'vitest'
import type { LearningAssetObject } from '@/core/universal-learning-engine/learning-assets'
import { computeDifficultyLevel, computeSessionDifficultyLevel } from './computeDifficultyLevel'

function makeObject(overrides: Partial<LearningAssetObject> = {}): LearningAssetObject {
  return {
    objectId: 'obj-1',
    title: 'Thing',
    type: 'concept',
    importance: 0.5,
    difficulty: 'beginner',
    estimatedLearningTime: 10,
    definition: null,
    explanation: null,
    examples: [],
    misconceptions: [],
    keywords: [],
    keyPhrases: [],
    keySentences: [],
    keyParagraphIds: [],
    relatedObjects: [],
    prerequisiteObjects: [],
    dependentObjects: [],
    ...overrides,
  }
}

describe('computeDifficultyLevel', () => {
  it('maps low-importance beginner difficulty to easy', () => {
    expect(computeDifficultyLevel(makeObject({ difficulty: 'beginner', importance: 0.2 }))).toBe('easy')
  })

  it('boosts a high-importance beginner concept to moderate — real material to master, not fabricated', () => {
    expect(computeDifficultyLevel(makeObject({ difficulty: 'beginner', importance: 0.9 }))).toBe('moderate')
  })

  it('maps high-importance advanced difficulty to mastery, the hardest real tier', () => {
    expect(computeDifficultyLevel(makeObject({ difficulty: 'advanced', importance: 0.9 }))).toBe('mastery')
  })

  it('treats an honestly unknown difficulty as the middle tier, never the easiest', () => {
    expect(computeDifficultyLevel(makeObject({ difficulty: null, importance: 0.2 }))).toBe('moderate')
  })
})

describe('computeSessionDifficultyLevel', () => {
  it('is honestly easy for an empty chapter', () => {
    expect(computeSessionDifficultyLevel([])).toBe('easy')
  })

  it('picks the most common real level among the chapter own objects, harder wins ties', () => {
    const objects = [
      makeObject({ objectId: 'a', difficulty: 'beginner', importance: 0.2 }), // easy
      makeObject({ objectId: 'b', difficulty: 'beginner', importance: 0.2 }), // easy
      makeObject({ objectId: 'c', difficulty: 'advanced', importance: 0.9 }), // mastery
    ]
    expect(computeSessionDifficultyLevel(objects)).toBe('easy')
  })
})
