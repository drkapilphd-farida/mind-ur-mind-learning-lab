import type { FailureCategory, RecoveryContext, RecoveryDiagnostics, RecoveryPlan, RecoveryValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("RecoveryDiagnostics"). Assembles a full record of one recovery
// decision from its already-computed pieces — same "pure generator
// takes pre-computed pieces" pattern as every prior sprint's
// diagnostics module.
export function generateRecoveryDiagnostics(context: RecoveryContext, category: FailureCategory, plan: RecoveryPlan, validationResult: RecoveryValidation): RecoveryDiagnostics {
  return {
    providerId: context.providerId,
    failureCategory: category,
    strategy: plan.strategy,
    reason: plan.reason,
    attemptCount: context.attemptCount,
    backoffDelayMs: plan.backoffDelayMs,
    retryBudgetStatus: plan.retryBudgetStatus,
    validationResult,
  }
}
