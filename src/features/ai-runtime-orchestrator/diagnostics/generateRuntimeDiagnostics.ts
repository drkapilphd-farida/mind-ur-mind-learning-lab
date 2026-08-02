import type { RuntimeDiagnostics, RuntimeExecutionContext, RuntimeValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("RuntimeDiagnostics"). Assembles a full record of one runtime run
// from its already-computed pieces — same "pure generator takes
// pre-computed pieces" pattern as every prior sprint's diagnostics
// module.
export function generateRuntimeDiagnostics(
  context: RuntimeExecutionContext,
  validationResult: RuntimeValidation,
  selectedProviderId: string | null,
  selectedModelId: string | null,
): RuntimeDiagnostics {
  return {
    learnerId: context.learnerId,
    profileId: context.profileId,
    finalState: context.state,
    completedStages: context.completedStages,
    validationResult,
    selectedProviderId,
    selectedModelId,
  }
}
