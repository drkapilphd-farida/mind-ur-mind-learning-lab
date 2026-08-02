import type { ModelSelectionDiagnostics, ModelSelectionOutcome, ModelSelectionRequest, ModelSelectionValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("ModelSelectionDiagnostics"). Assembles a full record of one
// selection decision from its already-computed pieces — same "pure
// generator takes pre-computed pieces" pattern as every prior sprint's
// diagnostics module.
export function generateModelSelectionDiagnostics(
  request: ModelSelectionRequest,
  candidateCount: number,
  priorityOrder: readonly string[],
  outcome: ModelSelectionOutcome,
  validationResult: ModelSelectionValidation,
): ModelSelectionDiagnostics {
  return {
    providerId: request.providerId,
    requestedCapability: request.requestedCapability,
    preferredModelId: request.preferredModelId,
    candidateCount,
    priorityOrder,
    resolutionPath: outcome.resolutionPath,
    selectedModelId: outcome.selectedModelId,
    validationResult,
  }
}
