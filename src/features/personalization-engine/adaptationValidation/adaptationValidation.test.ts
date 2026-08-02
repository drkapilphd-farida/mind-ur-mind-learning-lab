import { describe, expect, it } from 'vitest'
import { validateAdaptation } from './validateAdaptation'
import { makeAdaptationResult, makePersonalizationAdaptation } from '../testFixtures'

describe('validateAdaptation', () => {
  it('reports valid: true for a well-formed adaptation', () => {
    const adaptation = makePersonalizationAdaptation({ profileId: 'profile-1' })
    expect(validateAdaptation(adaptation, 'profile-1', {})).toEqual({ valid: true, issues: [] })
  })

  it('detects an empty-adaptation-set when there are no results', () => {
    const adaptation = makePersonalizationAdaptation({ results: [] })
    const result = validateAdaptation(adaptation, 'profile-1', {})
    expect(result.valid).toBe(false)
    expect(result.issues.some((issue) => issue.type === 'empty-adaptation-set')).toBe(true)
  })

  it('detects an invalid-profile-reference', () => {
    const adaptation = makePersonalizationAdaptation({ profileId: 'profile-1' })
    const result = validateAdaptation(adaptation, 'profile-2', {})
    expect(result.issues.some((issue) => issue.type === 'invalid-profile-reference')).toBe(true)
  })

  it('detects a duplicate-adaptation', () => {
    const adaptation = makePersonalizationAdaptation({
      profileId: 'profile-1',
      results: [makeAdaptationResult({ ruleId: 'difficulty-adjustment' }), makeAdaptationResult({ ruleId: 'difficulty-adjustment' })],
    })
    const result = validateAdaptation(adaptation, 'profile-1', {})
    expect(result.issues.some((issue) => issue.type === 'duplicate-adaptation')).toBe(true)
  })

  it('detects a rule-conflict when two applied results share the same type', () => {
    const adaptation = makePersonalizationAdaptation({
      profileId: 'profile-1',
      results: [
        makeAdaptationResult({ ruleId: 'a', type: 'difficulty', applied: true }),
        makeAdaptationResult({ ruleId: 'b', type: 'difficulty', applied: true }),
      ],
    })
    const result = validateAdaptation(adaptation, 'profile-1', {})
    expect(result.issues.some((issue) => issue.type === 'rule-conflict')).toBe(true)
  })

  it('does not flag a rule-conflict when only one of two same-type results is applied', () => {
    const adaptation = makePersonalizationAdaptation({
      profileId: 'profile-1',
      results: [
        makeAdaptationResult({ ruleId: 'a', type: 'difficulty', applied: true }),
        makeAdaptationResult({ ruleId: 'b', type: 'difficulty', applied: false }),
      ],
    })
    expect(validateAdaptation(adaptation, 'profile-1', {}).valid).toBe(true)
  })

  it('detects a configuration-violation when applied adaptations exceed maxAppliedAdaptations', () => {
    const adaptation = makePersonalizationAdaptation({
      profileId: 'profile-1',
      results: [
        makeAdaptationResult({ ruleId: 'a', type: 'difficulty', applied: true }),
        makeAdaptationResult({ ruleId: 'b', type: 'review-frequency', applied: true }),
      ],
    })
    const result = validateAdaptation(adaptation, 'profile-1', { maxAppliedAdaptations: 1 })
    expect(result.issues.some((issue) => issue.type === 'configuration-violation')).toBe(true)
  })

  it('does not flag configuration compliance when no maxAppliedAdaptations fact is configured', () => {
    const adaptation = makePersonalizationAdaptation({
      profileId: 'profile-1',
      results: [
        makeAdaptationResult({ ruleId: 'a', type: 'difficulty', applied: true }),
        makeAdaptationResult({ ruleId: 'b', type: 'review-frequency', applied: true }),
      ],
    })
    expect(validateAdaptation(adaptation, 'profile-1', {}).valid).toBe(true)
  })
})
