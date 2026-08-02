import { describe, expect, it } from 'vitest'
import { generateRuntimeDiagnostics } from './generateRuntimeDiagnostics'
import { makeRuntimeExecutionContext, makeRuntimeValidation } from '../testFixtures'

describe('generateRuntimeDiagnostics', () => {
  it('collects the learner/profile, final state, completed stages, validation result, and selection ids', () => {
    const context = makeRuntimeExecutionContext({ state: 'completed', completedStages: ['pending', 'completed'] })
    const validationResult = makeRuntimeValidation()

    const diagnostics = generateRuntimeDiagnostics(context, validationResult, 'openai', 'gpt-4o')

    expect(diagnostics).toEqual({
      learnerId: 'learner-1',
      profileId: 'profile-1',
      finalState: 'completed',
      completedStages: ['pending', 'completed'],
      validationResult: { valid: true, issues: [] },
      selectedProviderId: 'openai',
      selectedModelId: 'gpt-4o',
    })
  })

  it('allows null selection ids when selection never completed', () => {
    const context = makeRuntimeExecutionContext({ state: 'failed' })
    const validationResult = makeRuntimeValidation({ valid: false, issues: [{ type: 'missing-provider', detail: 'none' }] })

    const diagnostics = generateRuntimeDiagnostics(context, validationResult, null, null)

    expect(diagnostics.selectedProviderId).toBeNull()
    expect(diagnostics.selectedModelId).toBeNull()
  })
})
