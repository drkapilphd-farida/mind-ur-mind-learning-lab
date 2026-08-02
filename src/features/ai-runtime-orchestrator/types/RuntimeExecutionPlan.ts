import type { RuntimeState } from './RuntimeState'

// Immutable — every field `readonly`. One of the brief's own 10 named
// responsibilities — fully self-contained: the deterministic, planned
// sequence of `RuntimeState`s this run will attempt, plus the
// selection hints driving Provider/Model Selection. Built once by
// `../planning/buildRuntimeExecutionPlan.ts` — satisfies "Runtime
// initialization" (§ brief).
export type RuntimeExecutionPlan = {
  readonly plannedStages: readonly RuntimeState[]
  readonly preferredProviderId: string | null
  readonly preferredModelId: string | null
  readonly requestedCapability: string | null
  readonly minimumContextSize: number | null
}
