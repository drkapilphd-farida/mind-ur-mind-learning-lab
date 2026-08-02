// AI Provider Layer™ Execution Policy Engine (Sprint 43) — a new
// top-level sibling feature: determines how an AI execution should be
// performed before any provider call is attempted — timeout
// resolution, retry/cancellation/fallback eligibility, provider/
// execution/safety constraints — producing one of 5 decisions
// (Execute/Retry/Cancel/Reject/Fallback). No SDKs, no real network
// calls, no streaming, no billing, no persistence, no embeddings, no
// vector database, no UI, no background workers — "Do NOT implement"
// list honored in full.
//
// Two real naming collisions, both closely related in concept, not
// just name:
// - `ExecutionPolicy` — `provider-execution-engine/types/ExecutionPolicy.ts`
//   (Sprint 35's own plain data bundle, no decision logic of its own —
//   a genuinely different concept from this sprint's own *behavioral*
//   interface, paired with a literal "DefaultExecutionPolicy"
//   implementation). Renamed to `ExecutionPolicyEngine` /
//   `DefaultExecutionPolicyEngine`, echoing this sprint's own brief
//   title.
// - `RetryPolicy` — `ai-provider/types/RetryPolicy.ts` (Sprint 5's real
//   provider-retry shape) — the same collision Sprint 35 already hit
//   and resolved via `ExecutionRetryPolicy`, which is now *also*
//   taken. This sprint's own retry/timeout/cancellation/fallback
//   sub-policies are renamed with a different disambiguator pulled
//   from the brief's own "Responsibilities" language:
//   `RetryEligibilityPolicy`, `TimeoutResolutionPolicy`,
//   `CancellationEligibilityPolicy`, `FallbackEligibilityPolicy` — all
//   four renamed together for family consistency, same precedent as
//   Sprint 35. `ExecutionConstraints`, `ExecutionDecision`,
//   `ExecutionPolicyDiagnostics`, `ExecutionPolicyResolver` had zero
//   exact matches anywhere and are used brief-exact.
//
// Fully self-contained — zero cross-feature imports. "Provider
// eligibility," "execution limits," and "safety constraints" fold
// into `ExecutionConstraints` rather than 3 more named components — a
// plain data bundle the engine checks directly.
//
// `ExecutionPolicyResolver` validates a raw `ExecutionPolicyConfig`
// (6 of the brief's 8 validation concerns) and, if valid, constructs
// the engine; the remaining two concerns
// (`invalid-execution-state`/`missing-diagnostics`) apply at the
// per-request/per-decision layer instead.
// `DefaultExecutionPolicyEngine.decide()` composes 4 small, pure
// deciders (mirrors `provider-execution-engine`'s own `retry/`/
// `timeout/`/`cancellation/` folders) and never throws.

export * from './types'
export * from './retryEligibility'
export * from './timeoutResolution'
export * from './cancellationEligibility'
export * from './fallbackEligibility'
export * from './validation'
export * from './diagnostics'
export * from './engine'
export * from './resolver'
