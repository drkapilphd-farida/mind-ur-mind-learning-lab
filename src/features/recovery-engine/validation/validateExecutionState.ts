import type { RecoveryContext, RecoveryValidation, RecoveryValidationIssue } from '../types'

// Pure — "Invalid execution state" (§ brief).
export function validateExecutionState(context: RecoveryContext): RecoveryValidation {
  const issues: RecoveryValidationIssue[] = []

  if (!context.providerId.trim() || !context.modelId.trim()) {
    issues.push({ type: 'invalid-execution-state', detail: 'The recovery context has an empty providerId or modelId.' })
  }

  if (!Number.isFinite(context.attemptCount) || context.attemptCount < 0) {
    issues.push({ type: 'invalid-execution-state', detail: `attemptCount ${context.attemptCount} must be a non-negative finite number.` })
  }

  return { valid: issues.length === 0, issues }
}
