import { describe, expect, it } from 'vitest'
import { generateExecutionDiagnostics } from './generateExecutionDiagnostics'
import { makeExecutionSequence, makeExecutionStep, makePersonalizationExecutionPlan } from '../testFixtures'

describe('generateExecutionDiagnostics', () => {
  it('counts total steps and per-sequence counts, and reflects validation status', () => {
    const plan = makePersonalizationExecutionPlan({
      version: 2,
      sequences: [
        makeExecutionSequence({ type: 'journey', steps: [makeExecutionStep({ id: 'j1', sequenceType: 'journey', order: 0 })] }),
        makeExecutionSequence({
          type: 'session',
          steps: [makeExecutionStep({ id: 's1', sequenceType: 'session', order: 0 }), makeExecutionStep({ id: 's2', sequenceType: 'session', order: 1 })],
        }),
      ],
    })

    const diagnostics = generateExecutionDiagnostics(plan, { valid: true, issues: [] })

    expect(diagnostics).toEqual({ totalSteps: 3, journeyCount: 1, sessionCount: 2, validationStatus: 'valid', planVersion: 2 })
  })

  it('reports validationStatus: invalid when the validation result is invalid', () => {
    const plan = makePersonalizationExecutionPlan({ sequences: [] })
    const diagnostics = generateExecutionDiagnostics(plan, { valid: false, issues: [{ type: 'empty-plan', stepId: null, detail: 'empty' }] })
    expect(diagnostics.validationStatus).toBe('invalid')
    expect(diagnostics.totalSteps).toBe(0)
    expect(diagnostics.journeyCount).toBe(0)
    expect(diagnostics.sessionCount).toBe(0)
  })
})
