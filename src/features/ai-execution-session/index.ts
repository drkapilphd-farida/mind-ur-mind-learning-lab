// AI Provider Layer™ AI Execution Session Engine (Sprint 42) — a new
// top-level sibling feature: manages the complete lifecycle of a
// single AI execution session (creation, state transitions, event
// logging, a final result) as its own entity, independent of whatever
// actually performs the execution. No SDKs, no real network calls, no
// streaming, no conversation persistence, no billing, no token
// accounting, no embeddings, no vector database, no UI rendering, no
// background jobs — "Do NOT implement" list honored in full.
//
// One real naming collision: `SessionContext` already exists at
// `memory-session-context/domain/SessionContext.ts` (an unrelated
// memory/conversation-context concept). Renamed to
// `AIExecutionSessionContext`, echoing this sprint's own feature name.
// The other 9 brief-named responsibilities (`AIExecutionSession`,
// `AIExecutionSessionManager`, `SessionLifecycleCoordinator`,
// `SessionStateMachine`, `SessionEventLog`, `SessionDiagnostics`,
// `SessionMetadata`, `SessionResult`, `SessionFailureHandler`) had
// zero exact matches anywhere.
//
// Fully self-contained — zero cross-feature imports. Unlike Sprint 41,
// this brief never says "using the already-approved production
// features," so no bridge is built here — no real execution happens
// in this feature. `SessionExecutionOutcome` is a deterministic,
// caller-supplied fact (`{succeeded, responseText, failureReason}`) —
// same "the caller supplies the outcome" determinism as
// `provider-execution-engine`'s own `attemptOutcomes` (Sprint 35). A
// future sprint that wires a real executor (plausibly
// `ai-runtime-orchestrator`) would sit in that caller's seat.
//
// `AIExecutionSessionManager` (register/update/get/list, an in-memory
// registry) and `SessionLifecycleCoordinator` (the sequencing engine,
// `run(inputs): SessionRunResult`) mirror the registry-vs-engine split
// already used by `provider-selection-engine`/`model-selection-engine`.
// `SessionFailureHandler` is reserved for genuine validation
// rejections; a legitimate business failure or cancellation the
// caller reports is built inline instead, since nothing about it is
// actually invalid. `SessionLifecycleCoordinator.run()` never throws.

export * from './types'
export * from './contracts'
export * from './adapters'
export * from './stateMachine'
export * from './eventLog'
export * from './validation'
export * from './manager'
export * from './failureHandling'
export * from './diagnostics'
export * from './coordination'
