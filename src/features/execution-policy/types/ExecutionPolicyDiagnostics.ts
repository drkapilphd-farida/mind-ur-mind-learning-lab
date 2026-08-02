import type { ExecutionDecisionType } from './ExecutionDecision'
import type { ExecutionPolicyValidation } from './ExecutionPolicyValidation'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — no naming collision found, used brief-exact.
export type ExecutionPolicyDiagnostics = {
  readonly providerId: string
  readonly attemptCount: number
  readonly decision: ExecutionDecisionType
  readonly reason: string
  readonly fallbackProviderId: string | null
  readonly resolvedTimeoutMs: number | null
  readonly validationResult: ExecutionPolicyValidation
}
