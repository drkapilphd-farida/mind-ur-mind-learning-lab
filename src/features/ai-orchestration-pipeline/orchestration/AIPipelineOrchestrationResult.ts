import type { AIOrchestrationDiagnostics, AIOrchestrationResult } from '../types'
import type { PipelineValidationResult } from '../validation'

// Immutable — every field `readonly`. The service's own return
// wrapper — NOT one of item 1's 5 named domain models (those are
// `AIOrchestrationResult` and friends); this mirrors every prior
// sprint's own `<X>OrchestrationResult` wrapper (e.g.
// `provider-response-pipeline/orchestration/ResponseOrchestrationResult.ts`),
// holding the domain-model output alongside its validation outcome and
// diagnostics.
export type AIPipelineOrchestrationResult = {
  readonly result: AIOrchestrationResult
  readonly validationResult: PipelineValidationResult
  readonly diagnostics: AIOrchestrationDiagnostics
}
