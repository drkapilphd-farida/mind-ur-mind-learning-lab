import type { AIRuntimeResult } from '../types'
import type { RuntimeFailureHandler } from './RuntimeFailureHandler'
import type { RuntimeFailureInputs } from './RuntimeFailureInputs'

export class DefaultRuntimeFailureHandler implements RuntimeFailureHandler {
  handle(inputs: RuntimeFailureInputs): AIRuntimeResult {
    const { context, issueType, detail, selectedProviderId, selectedModelId } = inputs

    return {
      state: context.state,
      completionStatus: 'failed',
      success: null,
      failureReason: detail,
      diagnostics: {
        learnerId: context.learnerId,
        profileId: context.profileId,
        finalState: context.state,
        completedStages: context.completedStages,
        validationResult: { valid: false, issues: [{ type: issueType, detail }] },
        selectedProviderId,
        selectedModelId,
      },
    }
  }
}

export function createRuntimeFailureHandler(): RuntimeFailureHandler {
  return new DefaultRuntimeFailureHandler()
}
