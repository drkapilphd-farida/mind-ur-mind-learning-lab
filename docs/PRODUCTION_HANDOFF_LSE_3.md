# Production Handoff — LSE-3: Learning Session Runtime™

## Status: COMPLETE

## Scope Correction Before This Sprint Began

The sprint brief listed 15 capabilities (`LearningSession`, Session State Machine, Session Lifecycle,
Progress Tracking, Resume Support, Checkpoints, Session Persistence, Runtime Events, Runtime Context,
Runtime Metrics, Time Tracking, Completion Detection, Error Recovery, Pause/Resume, Session History,
Runtime Interfaces) and required "Zero duplication" and "Reuse existing architecture." Nine of those
fifteen already exist as complete, tested, locked production code in `learning-session-engine/` (LSE-1)
and `adaptive-learning-runtime/` (LSE-2) — `LearningSession`, the session state machine
(`validateTransition`), session lifecycle (LSE-1's 7 actions + LSE-2's 9 decisions), progress tracking
(`SessionProgress`/`RuntimeProgress`), resume support, checkpoints, runtime events (`SessionEvent`/
`RuntimeEvent`), completion detection, and pause/resume. Building those again under a new "LSE-3" name
would have directly violated the sprint's own explicit requirements. This was flagged and confirmed with
the founder before any code was written; **this sprint implements only the six capabilities genuinely
missing from the arc**: Session Persistence, Session History, Runtime Context, Runtime Metrics, Time
Tracking, and Error Recovery. "Runtime Interfaces" is satisfied by this layer's own public barrel plus the
reserved `SessionPersistenceAdapter` — not a seventh new capability.

## Runtime Architecture

`src/core/learning-session-runtime/` is placed as a **sibling** of `universal-learning-engine/`,
`learning-session-engine/`, and `adaptive-learning-runtime/` under `src/core/` — the next real layer in
the locked architecture:

```
Universal Learning Object™ → Learning Session Engine™ → Adaptive Learning Runtime™ →
Learning Session Runtime™ (LSE-3) → Future Learning Modes™
```

**Consumes ONLY the Universal Learning Object™, LSE-1's public barrel, and LSE-2's public barrel.**
Grep-verified: every production file under `types/`, the top-level pure functions, and `recovery/` imports
exactly three `@/core/...` targets — `@/core/universal-learning-engine/universal-learning-object`,
`@/core/learning-session-engine`, `@/core/adaptive-learning-runtime` — never a lower engine directly, never
another layer's `internal/`/`actions/`/`decisions/` (not part of those layers' public APIs). The one
disclosed exception is `testFixtures.ts`, which — like LSE-1's and LSE-2's own — legitimately chains the
lower engines' real builders plus LSE-2's public `startRuntime` to construct a realistic
`AdaptiveRuntimeState` fixture, the same pattern this arc has now established three times.

```
src/core/learning-session-runtime/
  types/            RuntimeContext, RuntimeMetrics, ChunkTimeRecord, TimeTrackingSummary,
                     RuntimeHealthIssueCode/Issue/Check, SessionSnapshot, SessionHistoryEntry/History,
                     SessionPersistenceAdapter (reserved), index.ts (barrel)
  (top level)       deriveRuntimeContext, computeRuntimeMetrics, computeTimeTracking,
                     diagnoseRuntimeHealth, buildSessionSnapshot, buildSessionHistory
                     (each: pure, single shared implementation, +test)
  recovery/         restoreFromSnapshot, recoverRuntime (each: reuses LSE-2's own
                     RuntimeActionResult/RuntimeActionOptions verbatim, +test)
  testFixtures.ts    shared real ULO/runtime fixtures (chained real builders + LSE-2's public startRuntime)
  index.ts           top-level public barrel — the one import path for consumers
```

**Why no `internal/` folder.** LSE-1 and LSE-2 both have an `internal/` folder holding pure functions
consumed only by their own actions/decisions, never exported. LSE-3 has no equivalent — all six of its
pure functions are themselves the deliverable (a future Learning Mode's Server Action calls
`buildSessionSnapshot`/`computeRuntimeMetrics`/etc. directly), the same reasoning that already moved LSE-2's
`evaluateLearningState` out of its own `internal/` to the top level. Keeping six genuinely public functions
inside a folder named "internal" would have been actively misleading.

## Session Persistence — Design

`SessionSnapshot` (`types/SessionSnapshot.ts`) is a real, **bounded, derived** projection of
`AdaptiveRuntimeState` — `completedChunkIds`/`skippedChunkIds`/`revisitChunkIds`/`repeatCounts`/`status`/
`completionPercentage` read or reused verbatim, plus a computed `metrics` (via the one shared
`computeRuntimeMetrics`). **The raw `eventLog` is deliberately never included** — an unbounded, ever-
growing field is the wrong thing to persist, and the QSR Final Lock's own `ReadingSessionSummary` design
(`docs/ARCHITECTURE_QSR_FINAL_LOCK.md` §5) already anticipated exactly this shape existing at this layer,
for every future Learning Mode to build its own summary on top of rather than duplicate.

**No concrete storage adapter is implemented.** `SessionPersistenceAdapter` (`save`/`load`/
`listByLearner`) is a reserved, type-only interface — `src/core/` has been framework/infrastructure-
agnostic throughout this entire arc (zero Supabase imports anywhere in UCE-1…6, LSE-1, or LSE-2), and this
layer doesn't start now. A concrete adapter (a Server Action backed by Supabase, per the Engineering
Constitution) is a future Learning Mode's own implementation detail, satisfying this interface rather than
this layer reaching for a database client itself. Same "type-only, no implementation" discipline LSE-1's
`LearningModeAdapter` and LSE-2's `RuntimeModeAdapter` already established.

**Rehydration (`restoreFromSnapshot`) is the one genuinely non-obvious piece of logic in this sprint,
documented in detail because it isn't a simple field copy.** It reconstructs a live `AdaptiveRuntimeState`
entirely through LSE-2's own public decisions (`startRuntime`, then a replay loop of `continueRuntime`/
`skipChunk`) — never by hand-constructing `scheduledQueue`/`position`/`progress`, which stay LSE-2's
exclusive derivation:

- `repeatCounts` and `revisitChunkIds` are safe to overlay directly onto the freshly-started state, because
  neither is incrementally mutated by `continueRuntime` or `skipChunk`.
- `completedChunkIds`/`skippedChunkIds` are **not** overlaid directly — overlaying `skippedChunkIds` up
  front and then calling the real `skipChunk` (which itself appends to it) would double-count entries. They
  are instead re-derived by literally replaying the real decision that produced each one.
- The replay loop walks the **current, real** scheduled position at each step — never a pre-assumed order
  — and classifies it as "completed" or "skipped" purely by real set membership against the snapshot. This
  is order-independent and correct regardless of how completions and skips were originally interleaved,
  because Chunk Scheduling is re-applied fresh by LSE-2 on every real decision call regardless of what
  triggered it.
- The restored runtime's own `eventLog` is an honest, freshly-generated replay log, not a byte-for-byte
  historical record — the persisted `SessionSnapshot`, not the live `eventLog`, is this layer's durable
  Session History source of truth.

Tested explicitly with an interleaved repeat → revisit-mark → continue → skip sequence, confirming the
restored position, progress, and skip/revisit/repeat state match the original exactly.

## Error Recovery — Design

`diagnoseRuntimeHealth` checks four real, checkable inconsistencies between a runtime and the ULO it
claims to be built against: `ulo-mismatch` (wrong document entirely), `ulo-version-stale` (same document,
re-aggregated since), `position-corrupted` (queue index out of bounds, or position's `chunkNodeId` doesn't
match the real scheduled item at that index), and `empty-queue-while-active` (should have auto-completed).
`recoverRuntime` returns a healthy runtime completely unchanged — an honest no-op — and recovers an
unhealthy one via a fresh, real call to LSE-2's own public `startRuntime` against the current ULO, never by
patching fields in place. A runtime that failed its own health check is not trusted to be safely patchable.

## Runtime Context and Runtime Metrics — Design

`RuntimeContext` gathers the real, already-scattered ambient identifiers (`learnerId`, `documentId`,
`uloId`, `uloVersion`, `sessionId`, `runtimeId`, `sessionType`) off a real runtime into one shared shape —
no new data, only one shared name for data every persistence/metrics function otherwise threads
independently. `RuntimeMetrics` is deliberately **mode-agnostic**: `totalChunks`/`completedChunks`/
`skippedChunks`/`revisitedChunks`/`totalRepeats`/`pauseCount`/`checkpointCount`, every field reused or
summed from real `AdaptiveRuntimeState` fields — no reading-specific concept (WPM, exposure duration, ...)
belongs here; that stays each Learning Mode's own concern, per the QSR Final Lock's own explicit boundary.

## Time Tracking — Design

`computeTimeTracking` is a single pass over a real `eventLog`, pairing each real `chunk-started` with its
real `chunk-completed`/`chunk-skipped` (each chunk gets exactly one `chunk-started` — LSE-2's own
`repeatChunk` re-emits `chunk-repeated`, never a second `chunk-started`, so no chunk can appear twice) and
each real `runtime-paused` with its real `runtime-resumed`. A still-open chunk or an open pause interval is
left honestly unresolved (`null`, or simply excluded from the paused-time sum) rather than estimated
against an assumed "now" — no new clock, no fabricated estimate.

## Session History — Design

`buildSessionHistory` is a pure function over a real list of already-persisted `SessionSnapshot`s (fetched
by a concrete `SessionPersistenceAdapter.listByLearner` in a future sprint) — every field is a direct read
of a real snapshot field.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` on all new files — clean.
- `npx vitest run` (whole repo) — **580 test files, 3716 tests passed** (8 new test files, 20 new tests in
  `learning-session-runtime/`), zero regressions against the pre-existing 572/3696 baseline.
- `npm run build` — compiled successfully.
- Scope check — zero diff under `universal-learning-engine/`, `learning-session-engine/`, or
  `adaptive-learning-runtime/`; all new code isolated to `learning-session-runtime/`. Grep-verified:
  production files import exactly three `@/core/...` targets, never a lower engine or another layer's
  internals directly.
- Circular-dependency check — confirmed nothing outside `learning-session-runtime/` imports from it yet (no
  consumer exists this sprint).
- No duplicate runtime logic — `deriveRuntimeContext`, `computeRuntimeMetrics`, `computeTimeTracking`,
  `diagnoseRuntimeHealth`, `buildSessionSnapshot`, and `buildSessionHistory` are each the single real
  implementation; `restoreFromSnapshot`/`recoverRuntime` reuse LSE-2's own `RuntimeActionResult`/
  `RuntimeActionOptions`/`RuntimeActionError` types verbatim rather than defining parallel ones.
- Zero re-implementation of LSE-1/LSE-2 — confirmed: no new `LearningSession`, state machine, lifecycle
  action, progress computation, checkpoint logic, or event type exists anywhere in this sprint's diff.

## Remaining Roadmap

LSE-3 is the last generic layer every future Learning Mode™ builds on. No Learning Mode, Dashboard, or UI
work has begun — per the brief's STOP instruction, Quantum Speed Reading™ implementation does not begin
here. A concrete `SessionPersistenceAdapter` (Supabase-backed Server Action) is the next real dependency
for any Learning Mode's own persistence — reserved by this sprint, not built by it.
