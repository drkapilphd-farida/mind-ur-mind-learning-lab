import type { ProviderRequest } from '@/features/provider-translation-engine'
import type { CancellationRequest } from '../cancellation'
import type { ExecutionAttemptOutcome, ExecutionPolicy } from '../types'

// The raw inputs a caller supplies for one execution-engine run.
// `attemptOutcomes` is the deterministic, caller-supplied signal
// sequence this engine reacts to — "No timers. No waiting. Only
// decision logic" — this engine never produces an outcome itself.
export type ExecutionOrchestrationInputs = {
  readonly learnerId: string
  readonly profileId: string
  readonly providerRequest: ProviderRequest
  readonly policy: ExecutionPolicy
  readonly attemptOutcomes: readonly ExecutionAttemptOutcome[]
  readonly cancellationRequest: CancellationRequest
}
