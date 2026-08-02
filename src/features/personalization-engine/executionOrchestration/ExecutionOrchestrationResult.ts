import type { PersonalizationExecutionPlan } from '../executionDomain'
import type { ExecutionValidationResult } from '../executionValidation'
import type { ExecutionDiagnostics } from '../executionDiagnostics'

// Immutable — every field `readonly`. What one orchestration run
// produces: the generated plan, its validation outcome, and its
// diagnostics, always returned together — same "diagnostics alongside
// output" convention as `StrategyOrchestrationResult`.
export type ExecutionOrchestrationResult = {
  readonly plan: PersonalizationExecutionPlan
  readonly validationResult: ExecutionValidationResult
  readonly diagnostics: ExecutionDiagnostics
}
