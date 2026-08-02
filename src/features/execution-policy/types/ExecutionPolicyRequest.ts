import type { CancellationRequestReason } from './CancellationRequestReason'

// Immutable — every field `readonly`. `ExecutionPolicyEngine.decide()`'s
// own input — every fact here is caller-supplied and deterministic
// (`elapsedMs` is never measured, same "the caller supplies the fact"
// posture as `provider-execution-engine`'s own `attemptOutcomes`).
export type ExecutionPolicyRequest = {
  readonly providerId: string
  readonly attemptCount: number
  readonly attemptedProviderIds: readonly string[]
  readonly elapsedMs: number
  readonly previousProviderFailed: boolean
  readonly cancellationRequested: boolean
  readonly cancellationReason: CancellationRequestReason
}
