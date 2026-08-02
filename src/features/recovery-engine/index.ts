// AI Provider Layer™ Recovery & Retry Engine (Sprint 44) — a new
// top-level sibling feature: classifies why an attempt failed and
// plans a specific recovery action (same provider / an alternate
// model / an alternate provider / a designated fallback / abort), with
// real backoff-delay computation. Never modifies any existing
// orchestration/provider/request/response/execution-session code. No
// SDKs, no real network calls, no streaming, no persistence, no
// billing, no embeddings, no vector database, no UI, no background
// workers — "Do NOT implement" list honored in full.
//
// Zero naming collisions found via repo-wide grep on all 10 of the
// brief's own named responsibilities (`RecoveryEngine`,
// `DefaultRecoveryEngine`, `RetryExecutor`, `RetryDecisionResolver`,
// `FailureClassifier`, `RecoveryStrategy`, `RecoveryPlan`,
// `BackoffPolicy`, `RetryBudget`, `RecoveryDiagnostics`) — every one
// used brief-exact.
//
// Fully self-contained — zero cross-feature imports. The brief's own
// "do not modify existing orchestration/provider/request/response/
// execution-session code" is a regression-safety statement, not an
// integration mandate (contrast Sprint 41's explicit "using the
// already-approved production features"). This sprint's own strategy
// vocabulary (`retry-same-provider`/`retry-alternate-model`/
// `retry-alternate-provider`/`execute-fallback`/`abort-execution`) is
// richer than, and deliberately independent of, `execution-policy`'s
// own flatter `execute`/`retry`/`cancel`/`reject`/`fallback`
// (Sprint 43) — no shared types between the two features.
//
// No real waiting, no real retries — `BackoffPolicy` computation
// returns *what delay would apply*, never actually waits;
// `RetryExecutor` never performs a real retry, it reports a
// caller-supplied `RetryOutcome` — same "the caller supplies the
// outcome, this engine only reacts" discipline as
// `provider-execution-engine`'s own `attemptOutcomes` (Sprint 35) and
// `ai-execution-session`'s own `SessionExecutionOutcome` (Sprint 42).
// `RecoveryEngine.planRecovery()` never throws — an invalid input or
// an unreachable strategy target resolves to `abort-execution` data,
// not an exception.

export * from './types'
export * from './failureClassification'
export * from './backoff'
export * from './retryBudget'
export * from './retryDecision'
export * from './validation'
export * from './diagnostics'
export * from './engine'
export * from './retryExecution'
