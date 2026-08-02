// Immutable — every field `readonly`. `facts` is a flat, deterministic
// passthrough of `ProviderRequest.context.facts` (Sprint 31) — no
// transformation, just re-typed for this feature's own self-containment.
export type ProviderExecutionContext = {
  readonly learnerId: string
  readonly profileId: string
  readonly facts: readonly string[]
}
