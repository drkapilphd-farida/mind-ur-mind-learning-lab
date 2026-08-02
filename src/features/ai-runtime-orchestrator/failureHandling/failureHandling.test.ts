import { describe, expect, it } from 'vitest'
import { createRuntimeFailureHandler } from './DefaultRuntimeFailureHandler'
import { makeRuntimeExecutionContext } from '../testFixtures'

describe('DefaultRuntimeFailureHandler (Failure propagation)', () => {
  it('produces a failed AIRuntimeResult carrying the issue as the failure reason', () => {
    const handler = createRuntimeFailureHandler()
    const context = makeRuntimeExecutionContext({ state: 'provider-selected', completedStages: ['pending', 'personalization-ready'] })

    const result = handler.handle({
      context,
      issueType: 'missing-model',
      detail: 'No model was resolved for provider "openai".',
      selectedProviderId: 'openai',
      selectedModelId: null,
    })

    expect(result).toEqual({
      state: 'provider-selected',
      completionStatus: 'failed',
      success: null,
      failureReason: 'No model was resolved for provider "openai".',
      diagnostics: {
        learnerId: 'learner-1',
        profileId: 'profile-1',
        finalState: 'provider-selected',
        completedStages: ['pending', 'personalization-ready'],
        validationResult: { valid: false, issues: [{ type: 'missing-model', detail: 'No model was resolved for provider "openai".' }] },
        selectedProviderId: 'openai',
        selectedModelId: null,
      },
    })
  })
})
