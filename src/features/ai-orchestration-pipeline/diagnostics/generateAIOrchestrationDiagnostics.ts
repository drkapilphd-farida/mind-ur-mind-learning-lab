import type { AIOrchestrationDiagnostics, AIOrchestrationResult } from '../types'
import type { PipelineValidationResult } from '../validation'

// Pure — "Generate diagnostics." `executionTimeline` is the same
// `completedStages` list the context already tracked — exposed here
// under the brief's own §7 vocabulary.
export function generateAIOrchestrationDiagnostics(result: AIOrchestrationResult, validationResult: PipelineValidationResult): AIOrchestrationDiagnostics {
  return {
    pipelineStage: result.context.stage,
    completionStatus: result.completionStatus,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    executionTimeline: result.context.completedStages,
    pipelineVersion: result.version,
  }
}
