import { describe, expect, it } from 'vitest'
import { createAdaptationOrchestrationService } from './DefaultAdaptationOrchestrationService'
import { makeAdaptationEvaluatorInputs, makeFixedClock, makePersonalizationProfile, makeSequentialIdGenerator } from '../testFixtures'

const NOW = '2026-06-01T00:00:00.000Z'

describe('DefaultAdaptationOrchestrationService', () => {
  it('generate() produces an adaptation, a valid validation result, and diagnostics together', () => {
    const service = createAdaptationOrchestrationService({ clock: makeFixedClock(NOW), idGenerator: makeSequentialIdGenerator('adaptation') })
    const inputs = makeAdaptationEvaluatorInputs({ profile: makePersonalizationProfile({ id: 'profile-1' }) })

    const result = service.generate(inputs)

    expect(result.adaptation.id).toBe('adaptation-1')
    expect(result.adaptation.profileId).toBe('profile-1')
    expect(result.adaptation.metadata.generatedAt).toBe(NOW)
    expect(result.validationResult).toEqual({ valid: true, issues: [] })
    expect(result.diagnostics.validationStatus).toBe('valid')
    expect(result.diagnostics.evaluatedRules).toBe(5)
    expect(result.diagnostics.appliedAdaptations + result.diagnostics.rejectedAdaptations).toBe(5)
  })

  it('uses default dependencies when no overrides are given', () => {
    const service = createAdaptationOrchestrationService()
    const result = service.generate(makeAdaptationEvaluatorInputs())
    expect(result.adaptation.id).toBeTruthy()
    expect(result.adaptation.metadata.generatedAt).toBeTruthy()
  })
})
