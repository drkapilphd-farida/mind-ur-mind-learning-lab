import type { ExecutionDecision, ExecutionPolicyDiagnostics, ExecutionPolicyRequest, ExecutionPolicyValidation } from '../types'

// Pure — one of the brief's own 10 named responsibilities
// ("ExecutionPolicyDiagnostics"). Assembles a full record of one
// policy decision from its already-computed pieces — same "pure
// generator takes pre-computed pieces" pattern as every prior
// sprint's diagnostics module. Kept separate from `ExecutionDecision`
// itself — `decide()` returns just the decision; a caller composes
// diagnostics afterward.
export function generateExecutionPolicyDiagnostics(request: ExecutionPolicyRequest, decision: ExecutionDecision, validationResult: ExecutionPolicyValidation): ExecutionPolicyDiagnostics {
  return {
    providerId: request.providerId,
    attemptCount: request.attemptCount,
    decision: decision.decision,
    reason: decision.reason,
    fallbackProviderId: decision.fallbackProviderId,
    resolvedTimeoutMs: decision.resolvedTimeoutMs,
    validationResult,
  }
}
