import type { ProviderSelectionDiagnostics, ProviderSelectionOutcome, ProviderSelectionRequest, ProviderSelectionValidation, SelectionProviderId } from '../types'

// Pure — one of the brief's own 9 named responsibilities
// ("ProviderSelectionDiagnostics"). Assembles a full record of one
// selection decision from its already-computed pieces — same "pure
// generator takes pre-computed pieces" pattern as every prior sprint's
// diagnostics module.
export function generateProviderSelectionDiagnostics(
  request: ProviderSelectionRequest,
  candidateCount: number,
  priorityOrder: readonly SelectionProviderId[],
  outcome: ProviderSelectionOutcome,
  validationResult: ProviderSelectionValidation,
): ProviderSelectionDiagnostics {
  return {
    requestedCapability: request.requestedCapability,
    preferredProviderId: request.preferredProviderId,
    candidateCount,
    priorityOrder,
    resolutionPath: outcome.resolutionPath,
    selectedProviderId: outcome.selectedProviderId,
    validationResult,
  }
}
