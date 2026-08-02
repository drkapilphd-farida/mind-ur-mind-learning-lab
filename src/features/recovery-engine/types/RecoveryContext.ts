import type { RetryBudget } from './RetryBudget'

// Immutable — every field `readonly`. `RecoveryEngine.planRecovery()`'s
// own second input — every candidate/budget fact the resolver needs to
// pick a `RecoveryStrategy`.
export type RecoveryContext = {
  readonly providerId: string
  readonly modelId: string
  readonly attemptCount: number
  readonly alternateModelIds: readonly string[]
  readonly alternateProviderIds: readonly string[]
  readonly fallbackProviderId: string | null
  readonly retryBudget: RetryBudget
}
