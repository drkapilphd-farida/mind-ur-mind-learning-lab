import { describe, expect, it } from 'vitest'
import { generateMentorContextDiagnostics } from './generateMentorContextDiagnostics'
import { makeMentorPersonalizationContextSnapshot } from '../testFixtures'

describe('generateMentorContextDiagnostics', () => {
  it('reports complete when all 3 presence flags are true', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot({ version: 2 })
    const diagnostics = generateMentorContextDiagnostics(
      snapshot,
      { hasPersonalization: true, hasExecutionPlan: true, hasRecommendations: true },
      { valid: true, issues: [] },
    )
    expect(diagnostics).toEqual({
      contextCompleteness: 'complete',
      recommendationCount: snapshot.context.recommendations.items.length,
      validationStatus: 'valid',
      assemblyVersion: 2,
    })
  })

  it('reports empty when all 3 presence flags are false', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot()
    const diagnostics = generateMentorContextDiagnostics(
      snapshot,
      { hasPersonalization: false, hasExecutionPlan: false, hasRecommendations: false },
      { valid: false, issues: [] },
    )
    expect(diagnostics.contextCompleteness).toBe('empty')
    expect(diagnostics.validationStatus).toBe('invalid')
  })

  it('reports partial when presence flags are mixed', () => {
    const snapshot = makeMentorPersonalizationContextSnapshot()
    const diagnostics = generateMentorContextDiagnostics(
      snapshot,
      { hasPersonalization: true, hasExecutionPlan: false, hasRecommendations: true },
      { valid: true, issues: [] },
    )
    expect(diagnostics.contextCompleteness).toBe('partial')
  })
})
