// AI Provider Layer™ Provider Execution Engine (Sprint 35) — a new
// top-level sibling feature sitting directly downstream of
// `@/features/provider-translation-engine` per the brief's own
// Execution Flow diagram: "... → Provider Translation → Execution
// Engine → Execution Result. Execution stops here." This is a generic
// execution-*runtime* state machine (session lifecycle, retry/timeout/
// cancellation decision logic) that would wrap a real provider call in
// a future sprint — it makes zero network calls, uses no SDKs, no API
// keys, no timers, and no real timestamps itself. Attempt/timeout/
// cancellation outcomes are deterministic, caller-supplied signals
// (`ExecutionAttemptOutcome`) — "No timers. No waiting. Only decision
// logic" — this engine only ever reacts to a given outcome, never
// produces one.
//
// Two real naming collisions found via repo-wide grep, both resolved
// with an `Execution`-family disambiguating prefix:
// - `RetryPolicy` already exists at `ai-provider/types/RetryPolicy.ts`
//   (a different shape tied to real provider retry) — renamed to
//   `ExecutionRetryPolicy`, with siblings `ExecutionTimeoutPolicy` and
//   `ExecutionCancellationPolicy` renamed to match for family
//   consistency (`ExecutionPolicy` itself had no collision).
// - `ExecutionDiagnostics` already exists at
//   `personalization-engine/executionDiagnostics/ExecutionDiagnostics.ts`
//   (an unrelated execution-*plan* concept); the natural fallback
//   `ProviderExecutionDiagnostics` is also already taken (Sprint 32) —
//   renamed to `ExecutionRuntimeDiagnostics` instead.
//
// Cross-feature imports are confined to `integration/` and
// `testFixtures.ts` — the *only* places that import
// `@/features/provider-translation-engine`. No import anywhere of
// `provider-request-pipeline`, `provider-response-pipeline`, or
// `ai-provider` — all three are either regression-protected by this
// brief or a different concern (real provider retry) this sprint
// deliberately doesn't couple to. `types/`, `lifecycle/`, `retry/`,
// `timeout/`, `cancellation/`, `validation/`, and `diagnostics/`
// internals are all fully self-contained. No API calls, no HTTP
// clients, no streaming, no token counting, no embeddings, no caching,
// no usage tracking, no billing, no UI — "Do NOT implement" list
// honored in full.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './lifecycle'
export * from './retry'
export * from './timeout'
export * from './cancellation'
export * from './validation'
export * from './diagnostics'
export * from './integration'
export * from './orchestration'
