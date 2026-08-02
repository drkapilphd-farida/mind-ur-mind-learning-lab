import { describe, expect, it } from 'vitest'
import { validateMentorContext } from './validateMentorContext'
import { makeMentorPersonalizationContextSnapshot } from '../testFixtures'

const FULL_PRESENCE = { hasPersonalization: true, hasExecutionPlan: true, hasRecommendations: true }

describe('validateMentorContext', () => {
  it('reports valid: true for a well-formed snapshot with full presence', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot()
    expect(validateMentorContext(snapshot, FULL_PRESENCE, {})).toEqual({ valid: true, issues: [] })
  })

  it('detects missing-personalization, missing-execution-plan, and missing-recommendations', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot()
    const result = validateMentorContext(snapshot, { hasPersonalization: false, hasExecutionPlan: false, hasRecommendations: false }, {})
    expect(result.valid).toBe(false)
    expect(result.issues.map((issue) => issue.type).sort()).toEqual(['missing-execution-plan', 'missing-personalization', 'missing-recommendations'])
  })

  it('detects a duplicate-reference among recommendation items', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot({
      context: {
        currentJourney: null,
        recommendations: {
          items: [
            { category: 'exercise', referenceId: 'ex-1', priority: 'high' },
            { category: 'review', referenceId: 'ex-1', priority: 'normal' },
          ],
        },
        learningState: { profileLifecycle: 'active', difficultyLevel: null, appliedAdaptationCount: 0 },
        memoryReferences: [],
      },
    })
    const result = validateMentorContext(snapshot, FULL_PRESENCE, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-reference')).toBe(true)
  })

  it('detects a duplicate-reference among memory references', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot({
      context: {
        currentJourney: null,
        recommendations: { items: [] },
        learningState: { profileLifecycle: 'active', difficultyLevel: null, appliedAdaptationCount: 0 },
        memoryReferences: [
          { memoryId: 'reading-0-0', summary: 'a' },
          { memoryId: 'reading-0-0', summary: 'b' },
        ],
      },
    })
    const result = validateMentorContext(snapshot, FULL_PRESENCE, {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-reference')).toBe(true)
  })

  it('detects a configuration-violation when memory references exceed maxMemoryReferences', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot({
      context: {
        currentJourney: null,
        recommendations: { items: [] },
        learningState: { profileLifecycle: 'active', difficultyLevel: null, appliedAdaptationCount: 0 },
        memoryReferences: [
          { memoryId: 'a', summary: 'x' },
          { memoryId: 'b', summary: 'y' },
        ],
      },
    })
    const result = validateMentorContext(snapshot, FULL_PRESENCE, { maxMemoryReferences: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxMemoryReferences fact is configured', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot()
    expect(validateMentorContext(snapshot, FULL_PRESENCE, {}).valid).toBe(true)
  })
})
