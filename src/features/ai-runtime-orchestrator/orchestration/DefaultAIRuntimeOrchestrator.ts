import { createRuntimeCoordinator } from '../coordination'
import type { RuntimeCoordinator } from '../coordination'
import { createRuntimeFailureHandler } from '../failureHandling'
import type { RuntimeFailureHandler } from '../failureHandling'
import type { RuntimeOrchestrationInputs } from '../integration'
import { validateFinalRuntimeResult, validateRuntimeOrchestrationInputs } from '../validation'
import type { AIRuntimeResult, RuntimeExecutionContext } from '../types'
import type { AIRuntimeOrchestrator } from './AIRuntimeOrchestrator'

export type AIRuntimeOrchestratorDependencies = {
  coordinator: RuntimeCoordinator
  failureHandler: RuntimeFailureHandler
}

function createDefaultDependencies(): AIRuntimeOrchestratorDependencies {
  return { coordinator: createRuntimeCoordinator(), failureHandler: createRuntimeFailureHandler() }
}

// Implements AIRuntimeOrchestrator — the outer facade: validates the
// incoming `RuntimeOrchestrationInputs` ("Missing execution context"),
// delegates the real 9-stage run to `RuntimeCoordinator`, then
// validates the final `AIRuntimeResult` shape itself ("Invalid final
// result"/"Invalid runtime state") before returning it — never throws
// regardless of how many stages failed.
export class DefaultAIRuntimeOrchestrator implements AIRuntimeOrchestrator {
  constructor(private readonly dependencies: AIRuntimeOrchestratorDependencies) {}

  run(inputs: RuntimeOrchestrationInputs): AIRuntimeResult {
    const inputsValidation = validateRuntimeOrchestrationInputs(inputs)
    if (!inputsValidation.valid) {
      const context: RuntimeExecutionContext = { learnerId: inputs.learnerId, profileId: inputs.profileId, state: 'failed', completedStages: ['pending', 'failed'] }
      return this.dependencies.failureHandler.handle({
        context,
        issueType: 'missing-execution-context',
        detail: inputsValidation.issues[0]?.detail ?? 'The runtime execution context is missing required fields.',
        selectedProviderId: null,
        selectedModelId: null,
      })
    }

    const result = this.dependencies.coordinator.coordinate(inputs)
    const resultValidation = validateFinalRuntimeResult(result)
    if (!resultValidation.valid) {
      const context: RuntimeExecutionContext = { learnerId: inputs.learnerId, profileId: inputs.profileId, state: 'failed', completedStages: result.diagnostics.completedStages }
      return this.dependencies.failureHandler.handle({
        context,
        issueType: resultValidation.issues[0]?.type ?? 'invalid-final-result',
        detail: resultValidation.issues[0]?.detail ?? 'The final runtime result is internally inconsistent.',
        selectedProviderId: result.diagnostics.selectedProviderId,
        selectedModelId: result.diagnostics.selectedModelId,
      })
    }

    return result
  }
}

export function createAIRuntimeOrchestrator(overrides: Partial<AIRuntimeOrchestratorDependencies> = {}): AIRuntimeOrchestrator {
  return new DefaultAIRuntimeOrchestrator({ ...createDefaultDependencies(), ...overrides })
}
