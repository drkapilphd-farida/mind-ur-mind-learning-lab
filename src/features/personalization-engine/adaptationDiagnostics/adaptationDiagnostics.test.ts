import { describe, expect, it } from 'vitest'
import { generateAdaptationDiagnostics } from './generateAdaptationDiagnostics'
import { makeAdaptationResult, makePersonalizationAdaptation } from '../testFixtures'

describe('generateAdaptationDiagnostics', () => {
  it('counts applied and rejected adaptations, and reflects validation status', () => {
    const adaptation = makePersonalizationAdaptation({
      version: 3,
      results: [
        makeAdaptationResult({ ruleId: 'a', applied: true }),
        makeAdaptationResult({ ruleId: 'b', applied: false }),
        makeAdaptationResult({ ruleId: 'c', applied: true }),
      ],
    })

    const diagnostics = generateAdaptationDiagnostics(adaptation, { valid: true, issues: [] })

    expect(diagnostics).toEqual({ evaluatedRules: 5, appliedAdaptations: 2, rejectedAdaptations: 1, validationStatus: 'valid', adaptationVersion: 3 })
  })

  it('reports validationStatus: invalid when the validation result is invalid', () => {
    const adaptation = makePersonalizationAdaptation({ results: [] })
    const diagnostics = generateAdaptationDiagnostics(adaptation, { valid: false, issues: [{ type: 'empty-adaptation-set', ruleId: null, detail: 'empty' }] })
    expect(diagnostics.validationStatus).toBe('invalid')
    expect(diagnostics.appliedAdaptations).toBe(0)
    expect(diagnostics.rejectedAdaptations).toBe(0)
  })
})
