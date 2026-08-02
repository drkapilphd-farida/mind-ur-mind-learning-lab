import type { PersonalizationExecutionPlan } from '../executionDomain'
import type { ExecutionValidationResult } from '../executionValidation'
import type { ExecutionDiagnostics } from './ExecutionDiagnostics'

// Pure — "Generate diagnostics." `journeyCount`/`sessionCount` are the
// step counts of the `journey`/`session` sequences specifically (each
// plan has at most one of each), never a count of sequences.
export function generateExecutionDiagnostics(plan: PersonalizationExecutionPlan, validationResult: ExecutionValidationResult): ExecutionDiagnostics {
  const totalSteps = plan.sequences.reduce((total, sequence) => total + sequence.steps.length, 0)
  const journeyCount = plan.sequences.find((sequence) => sequence.type === 'journey')?.steps.length ?? 0
  const sessionCount = plan.sequences.find((sequence) => sequence.type === 'session')?.steps.length ?? 0

  return {
    totalSteps,
    journeyCount,
    sessionCount,
    validationStatus: validationResult.valid ? 'valid' : 'invalid',
    planVersion: plan.version,
  }
}
