// "## Execution Decisions" (§ brief), verbatim.
export type ExecutionDecisionType = 'execute' | 'retry' | 'cancel' | 'reject' | 'fallback'

// Immutable — every field `readonly`. `ExecutionPolicyEngine.decide()`'s
// own output. `fallbackProviderId` is populated only when
// `decision === 'fallback'`; `resolvedTimeoutMs` only when
// `decision === 'execute'`.
export type ExecutionDecision = {
  readonly decision: ExecutionDecisionType
  readonly reason: string
  readonly fallbackProviderId: string | null
  readonly resolvedTimeoutMs: number | null
}
