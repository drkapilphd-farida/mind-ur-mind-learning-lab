import type { CleanupCandidate } from './CleanupCandidate'

// Immutable — every field `readonly`. A complete evaluation record —
// every given memory gets exactly one `CleanupCandidate` (including
// `'skip'` outcomes), so a plan is a full audit of what would happen,
// not just a filtered action list. "No automatic execution" — a
// `CleanupPlan` on its own never touches the repository; see
// `cleanupExecution/` for the separate, explicit execution step.
export type CleanupPlan = {
  readonly id: string
  readonly policyIds: readonly string[]
  readonly candidates: readonly CleanupCandidate[]
  readonly generatedAt: string
}
