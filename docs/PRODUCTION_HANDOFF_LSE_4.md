# Production Handoff — LSE-4: Learning Mode Runtime Integration™

## Status: COMPLETE

## What Already Existed Before This Sprint

LSE-1 (`types/LearningModeExtension.ts`) reserved `LearningModeType` (the 9 named modes) and
`LearningModeAdapter` (5 optional lifecycle hooks) — type-only, "no session action actually calls into a
`LearningModeAdapter` yet." LSE-2 (`types/RuntimeExtension.ts`) reserved the richer, runtime-layer sibling
`RuntimeModeAdapter` (8 optional hooks — the 5 LSE-1 named plus `onChunkSkipped`/`onChunkRepeated`/
`onChunkMarkedForRevisit`) — again type-only, "no runtime decision actually calls into a `RuntimeModeAdapter`
yet, and no concrete adapter is implemented for any named mode." Grep-confirmed at the start of this sprint:
nothing anywhere in LSE-1's actions or LSE-2's decisions ever invokes either adapter. Both were pure,
correctly-disclosed reservations with zero wiring.

**This sprint does not define a third, competing hook interface.** `LearningMode.adapter`
(`types/LearningMode.ts`) reuses LSE-2's own `RuntimeModeAdapter` verbatim — this sprint's real
contribution is the registry, the dispatcher that actually calls those already-reserved hooks from real
`RuntimeEvent`s, capability declaration/validation, and progress synchronization built around that already-
reserved shape.

## Runtime Architecture

`src/core/learning-mode-integration/` is placed as a **sibling** of the four completed core layers under
`src/core/` — the layer the brief's own "Future Learning Modes™" node in the locked architecture diagram
now names concretely:

```
Universal Learning Object™ → Learning Session Engine™ (LSE-1) → Adaptive Learning Runtime™ (LSE-2) →
Learning Session Runtime™ (LSE-3) → Learning Mode Runtime Integration™ (LSE-4) → Future Learning Modes™
```

**Consumes ONLY the Universal Learning Object™, LSE-2's public barrel, and LSE-3's public barrel.**
Grep-verified: every production file imports exactly three `@/core/...` targets —
`@/core/universal-learning-engine/universal-learning-object`, `@/core/adaptive-learning-runtime`,
`@/core/learning-session-runtime` — never a lower engine, never LSE-1 directly (LSE-3 already wraps
everything this layer needs from it), never another layer's internals. The one disclosed exception is
`testFixtures.ts`, chaining the lower engines' real builders the same way every prior layer's own
`testFixtures.ts` does.

```
src/core/learning-mode-integration/
  types/          LearningModeCapabilities, LearningModeConfig, LearningMode, LearningModeRegistry,
                  ModeIntegrationError(+Code), ModeConfigValidationResult, ModeIntegrationResult,
                  SynchronizedModeProgress, index.ts (barrel)
  (top level)     createLearningModeRegistry, validateModeConfig, dispatchRuntimeEvents,
                  dispatchAfterDecision, synchronizeModeProgress, startModeRuntime
                  (each: pure or a real, minimal, non-mock implementation, +test)
  testFixtures.ts  shared real ULO + a real, minimal registrable LearningMode fixture
  index.ts         top-level public barrel — the one import path for consumers
```

**Why no `internal/` folder**, continuing the precedent LSE-3 established: every function here is itself
the deliverable a future Learning Mode's Server Action calls directly — none of it is plumbing consumed
only by a decision inside this same layer.

## Capability Registration and Mode Configuration Contracts

`LearningModeCapabilities` — `sessionType` (reused from the ULO's own `SessionType`, never a duplicate
enum), `supportedChunkStrategies` (reused from LSE-2's own 5 real `ChunkStrategy` values — this layer
never invents a 6th), `supportsCheckpoints`. `LearningModeConfig` — `learnerId`, `chunkStrategy`, and an
intentionally opaque `modeOptions` bag this layer never reads (reading it would be exactly the "mode-
specific business logic" this sprint must not contain). `sessionType` is deliberately absent from the
config: it is derived from the mode's own declared capability inside `startModeRuntime`, so a mismatched
session type is structurally impossible rather than a validation case this layer has to check for.

## The LearningMode Registry

`createLearningModeRegistry()` returns a real, in-memory `register`/`get`/`has`/`list` implementation
backed by a `Map<LearningModeType, LearningMode>` — a real, legitimate, non-mock production data structure,
not a stub. Registering a second mode under the same type replaces the first (the `Map`'s own honest "last
write wins," never a silent merge of two modes' capabilities/adapters). Adding a future Learning Mode™
(Memory Mode™, Flashcards™, ...) is calling `register()` with a new real `LearningMode` value — zero
changes to any file in this layer required. This is this sprint's literal "Extension points for future
Learning Modes" requirement.

## Runtime ↔ LearningMode Adapter, Session Event Forwarding, Runtime Callback Contracts

One shared dispatcher, `dispatchRuntimeEvents`, maps each real `RuntimeEvent` to its real matching
`RuntimeModeAdapter` hook, resolving the real chunk a chunk-scoped event refers to from the ULO already in
hand (`ulo.knowledge.chunks.find(...)`) — never a re-fetch, never re-parsing.

**A disclosed, real asymmetry between `RuntimeEventType` and `RuntimeModeAdapter`'s own hooks, worked out
carefully rather than papered over:**

| RuntimeEvent | Matching hook | Notes |
|---|---|---|
| `chunk-started` | `onChunkStarted` | |
| `chunk-completed` | `onChunkCompleted` | |
| `chunk-skipped` | `onChunkSkipped` | |
| `chunk-repeated` | `onChunkRepeated` | carries the real `repeatCount` |
| `chunk-marked-for-revisit` | `onChunkMarkedForRevisit` | |
| `checkpoint-reached` | `onCheckpointReached` | passed the whole real event |
| `runtime-completed` | `onRuntimeCompleted` | |
| `progress-updated` | *(none)* | LSE-2 never reserved a matching hook — silently skipped, never forced onto an unrelated one |
| `runtime-paused` | *(none)* | same |
| `runtime-resumed` | *(none)* | same |
| *(no event)* | `onRuntimeStarted` | LSE-2 emits no `'runtime-started'` event at all — called once, directly, by `startModeRuntime`, not from the per-event dispatcher |

`dispatchAfterDecision` is the generic, composable wrapper every one of LSE-2's 9 decisions can be wrapped
with — `dispatchAfterDecision(mode, ulo, continueRuntime(state, ulo, options))` — one shared implementation
for all 9, never a hand-written per-decision wrapper (which would itself have been the "duplicate runtime
logic" this sprint must not produce). It forwards events only on a real success; a real failure (e.g. an
illegal transition) never reaches a mode's callbacks as if it had happened.

## Progress Synchronization

`synchronizeModeProgress(mode, runtime)` combines LSE-2's own real `runtime.progress` with LSE-3's own real
`computeRuntimeMetrics(runtime)` under the mode's real identity — neither value recomputed, only assembled
into one on-demand view a mode's own Server Action can pull whenever it needs a synchronized snapshot.

## The Integration Entrypoint

`startModeRuntime(registry, modeType, ulo, config, options)` is the one real, composed entrypoint: look up
the real registered mode, validate the real config against its real declared capabilities, delegate
entirely to LSE-2's own public `startRuntime` for actual construction (never reimplemented here), call the
real `onRuntimeStarted` hook once, then forward the real initial events through the same shared dispatcher
every other decision uses. Returns `ModeIntegrationResult` — LSE-2's own `AdaptiveRuntimeState`/
`RuntimeEvent`/`RuntimeActionError` reused verbatim, with exactly one new member (`ModeIntegrationError`,
`'mode-not-registered' | 'unsupported-chunk-strategy'`) for the two real failures only this integration
layer can produce.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` on all new files — clean.
- `npx vitest run` (whole repo) — **586 test files, 3732 tests passed** (6 new test files, 16 new tests in
  `learning-mode-integration/`), zero regressions against the pre-existing 580/3716 baseline.
- `npm run build` — compiled successfully.
- Scope check — zero diff under `universal-learning-engine/`, `learning-session-engine/`,
  `adaptive-learning-runtime/`, or `learning-session-runtime/`; all new code isolated to
  `learning-mode-integration/`. Grep-verified production files import exactly three `@/core/...` targets.
- Circular-dependency check — confirmed nothing outside `learning-mode-integration/` imports from it yet
  (no consumer exists this sprint).
- No duplicate runtime logic — `createLearningModeRegistry`, `validateModeConfig`, `dispatchRuntimeEvents`,
  `dispatchAfterDecision`, and `synchronizeModeProgress` are each the single real implementation;
  `startModeRuntime` composes them rather than reimplementing any of their logic inline.
- Zero re-implementation of LSE-1/LSE-2/LSE-3 — confirmed: no new `LearningSession`, session state
  machine, session lifecycle action, progress/metrics computation, or event type exists anywhere in this
  sprint's diff; `LearningMode.adapter` reuses `RuntimeModeAdapter` verbatim rather than defining a
  competing hook shape.
- Zero AI calls, zero document parsing — confirmed: this layer's only content-facing operation is a single
  `Array.find()` lookup on an already-built ULO's already-real `knowledge.chunks`.

## Remaining Roadmap

LSE-4 is the last generic layer every future Learning Mode™ plugs into via `register()`. No Learning Mode,
Dashboard, or UI work has begun — per the brief's STOP instruction, Quantum Speed Reading™ implementation
does not begin here. The next real dependency for any concrete Learning Mode is (a) a concrete
`LearningMode` value (type, capabilities, and — optionally — a real `RuntimeModeAdapter`) and (b) a concrete
`SessionPersistenceAdapter` (LSE-3, reserved, still unimplemented) for that mode's own persistence, both
explicitly out of this sprint's scope.
