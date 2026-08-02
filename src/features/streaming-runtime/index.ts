// Production Sprint 45 — Streaming Runtime Engine, part of the "Real AI
// Integration™" arc (Sprints 23–44 documented in
// `docs/PRODUCTION_HANDOFF_SPRINT_35-44.md`). Deterministic streaming-chunk
// lifecycle management: stream initialization, chunk reception/ordering/
// buffering/assembly, partial response generation, completion detection,
// cancellation, and diagnostics — for a caller-supplied, fully-ordered
// `StreamChunk[]` sequence. No SDKs, no SSE, no WebSockets, no real network
// calls, no real timers or waiting anywhere, matching every prior sprint in
// this arc. The entire chunk sequence for a session is processed in one
// synchronous `run()` call; there is no "call again as more chunks arrive"
// entrypoint, because there is no real waiting in this arc to trickle chunks
// in across separate calls.
//
// Do NOT implement: real OpenAI/Anthropic/Gemini SDKs, SSE, WebSockets,
// persistence, billing, embeddings, vector database, UI.
//
// Collision research: grepped all 10 brief-named identifiers
// (StreamingRuntimeEngine, DefaultStreamingRuntimeEngine, StreamingSession,
// StreamingStateMachine, StreamChunk, StreamAssembler, StreamBuffer,
// StreamCompletionDetector, StreamingDiagnostics, StreamingLifecycleManager)
// plus every supporting type this sprint invents — zero collisions anywhere
// in `src`. One adjacent pre-existing file was found and deliberately left
// alone: `src/features/ai-provider/contracts/AIStreamingContract.ts` (Sprint
// 5) defines `AIStreamChunk`/`AIStreamingContract`, a real, unimplemented,
// AsyncIterable-based interface tied to `AIRequest` — the agreed-upon shape
// for a *future real* provider stream. Different names, different shape,
// different purpose (real transport vs. this sprint's deterministic
// caller-supplied chunk array); this feature does not import from it,
// reference it, or resemble its async-iterable shape.
//
// Self-containment: the brief contains no "using the already-approved
// production features" language and no named Execution Flow, so per this
// arc's established rule this feature is fully self-contained — zero
// cross-feature imports anywhere.
//
// No Clock/IdGenerator: every domain type here is caller-supplied (session
// id, chunk sequence numbers, buffer policy limits) — no timestamp or
// generated-id field anywhere, so `contracts/`/`adapters/` were never
// scaffolded (per this arc's Sprint 35 lesson: check before scaffolding).
//
// Design precedent — three named layers, not two: this is the first sprint
// in the arc to name three distinct orchestration layers
// (`StreamingStateMachine`, `StreamingLifecycleManager`, `StreamingRuntimeEngine`)
// where prior sprints only ever named two (Sprint 41: `RuntimeLifecycleManager`
// + `RuntimeCoordinator` + `AIRuntimeOrchestrator`; Sprint 42:
// `SessionStateMachine` + `SessionLifecycleCoordinator`, no outer engine). The
// three-layer split here maps each brief-named class to one distinct
// responsibility: pure transition legality (`StreamingStateMachine`) →
// single-session orchestration (`StreamingLifecycleManager`) → stable public
// facade + factory seam (`StreamingRuntimeEngine`, a thin wrapper mirroring
// how `AIRuntimeOrchestrator` wraps `RuntimeCoordinator`) — without inventing
// anything beyond what the brief already names.
//
// `paused` reachability: the first state in this arc's history reachable
// from and returning to a non-terminal state other than a simple
// predecessor/successor pair. Because the full chunk sequence is processed
// synchronously in one `run()` call, `paused` is not naturally reachable
// through ordinary chunk processing — its legality is instead covered
// exhaustively by direct `StreamingStateMachine.transition()` unit tests
// (see `stateMachine/stateMachine.test.ts`), the same technique this arc uses
// for every other edge case unreachable through real data alone (e.g. Sprint
// 41's `missing-provider`, Sprint 42's stub-throwing state machine).
//
// `DefaultStreamingLifecycleManager.run()` never throws for any
// caller-supplied input — the only exception it catches internally
// (`IllegalStreamingTransitionError`) is itself unreachable through real
// data and exists purely as a defensive catch, exercised via DI-override in
// `lifecycleManager/DefaultStreamingLifecycleManager.test.ts`.

export * from './types'
export * from './stateMachine'
export * from './buffering'
export * from './assembly'
export * from './completion'
export * from './validation'
export * from './diagnostics'
export * from './lifecycleManager'
export * from './engine'
