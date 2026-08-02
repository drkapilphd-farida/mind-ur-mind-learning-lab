# Production Handoff — LSE-2: Adaptive Learning Runtime™

## Status: COMPLETE

## Amendment — Quantum Speed Reading™ Production Sprint-1

One real decision, `previousChunk` (`decisions/previousChunk.ts`), was added to this locked layer during
QSR Sprint-1. This is not a reversal of "LSE-2 is complete" — it is the exact, named, evidence-driven
exception both `docs/ARCHITECTURE_QUANTUM_SPEED_READING.md` §8 and `docs/ARCHITECTURE_QSR_FINAL_LOCK.md` §13
anticipated and deliberately deferred: backward navigation was withheld from the original 9 decisions
specifically until a real production sprint demonstrated it was needed, rather than added speculatively.
`RuntimeDecisionType` gained `'previous-chunk'`, `RuntimeActionErrorCode` gained `'no-previous-chunk'`, and
`validateRuntimeTransition`'s table gained one row (`'previous-chunk': ['active']`) — no existing type,
decision, or test was changed or removed. See `docs/PRODUCTION_HANDOFF_QSR_SPRINT_1.md` for the full
rationale and the re-verification this amendment required.

## Runtime Architecture

`src/core/adaptive-learning-runtime/` is placed as a **sibling** of `learning-session-engine` and
`universal-learning-engine` under `src/core/` — the next layer in the locked architecture:

```
Universal Learning Object™ → Learning Session Engine™ → Adaptive Learning Runtime™ → Future Learning Modes™
```

**Consumes ONLY the Universal Learning Object™ and LSE-1's own public barrel.** Every production file
under `types/`, `internal/`, `decisions/`, and `evaluateLearningState.ts` imports exclusively from
`@/core/universal-learning-engine/universal-learning-object` and `@/core/learning-session-engine` — never
raw documents, chunks, the knowledge graph, or learning analysis directly, and never LSE-1's own
`internal/`/`actions/`/`types/` (not part of LSE-1's public API — only its barrel is). Verified by grep: the
only two `@/core/...` import targets across production files are exactly those two barrels. The one
disclosed exception is `testFixtures.ts`, which — like LSE-1's own and UCE-6's own — legitimately chains
the lower engines' real builders to construct a realistic ULO fixture; it also calls LSE-1's public
`startSession` (never its internal `buildLearningQueue`) to derive a real natural-order queue for
chunk-scheduling-strategy tests.

```
src/core/adaptive-learning-runtime/
  types/         ChunkStrategy, RuntimeDecisionType, RuntimeEvent(+Type), RuntimeProgress,
                 LearningStateEvaluation, RuntimeActionError(+Code), RuntimeActionOptions/Result,
                 RuntimeVersion, RuntimePosition, AdaptiveRuntimeState, RuntimeExtension
                 (LearningModeType re-export + RuntimeModeAdapter), index.ts (barrel)
  internal/      applyChunkStrategy (+ strategies/: sequential, priority-first, dependency-first,
                 review-first, adaptive-queue), computeRuntimeProgress, navigateQueue,
                 getNextRemainingItem, buildAdvanceEvents, advanceRuntime, validateRuntimeTransition
                 (each: pure, single shared implementation, +test)
  decisions/     startRuntime, continueRuntime, pauseRuntime, resumeRuntime, repeatChunk, skipChunk,
                 revisitLater, checkpointRuntime, completeRuntime (each: Result-type, +test)
  evaluateLearningState.ts  the one public, read-only Learning State Evaluation query (+test) — sits at
                 the top level, not under internal/, because it's a real, disclosed public capability, not
                 plumbing consumed only by decisions/
  testFixtures.ts  shared real ULO/queue fixtures (chained real builders + LSE-1's public startSession)
  index.ts         top-level public barrel — the one import path for consumers
```

## Why the Runtime Owns a Second Queue

LSE-1's own `session.queue`/`session.position`/`session.progress` are fixed to real natural document order
by design and are never reordered (`docs/PRODUCTION_HANDOFF_LSE_1.md`). Chunk Scheduling's whole purpose is
to produce *alternative* orderings (priority-first, dependency-first, review-first, adaptive-queue), so the
runtime cannot walk LSE-1's own queue for anything but the `'sequential'` strategy. `AdaptiveRuntimeState`
therefore wraps a real, unmutated `LearningSession` (`state.session`) purely for LSE-1's own lifecycle
status/timestamps/audit `eventLog`, and separately owns `scheduledQueue`/`position`/`progress`/`eventLog`
computed against the chunk-strategy-ordered queue. The two are kept honestly independent — this runtime
never fakes a call into an LSE-1 action that didn't really happen. Concretely:

- `startRuntime` **delegates to** LSE-1's public `startSession` for `state.session`, then computes
  `scheduledQueue` from that same real natural-order queue via the chosen strategy.
- `pauseRuntime`/`resumeRuntime` **delegate to** LSE-1's public `pauseSession`/`resumeSession` verbatim for
  `state.session` — pausing doesn't depend on queue order, so no reimplementation was needed.
- `continueRuntime`/`skipChunk` **never call** LSE-1's `continueSession` (it advances the wrong, natural-
  order queue) — they own their own advancement via the shared `internal/advanceRuntime.ts`, and only call
  LSE-1's public `completeSession` once the *adaptive* queue is genuinely exhausted, reusing that action's
  own documented "safe to call regardless of remaining queue items" semantics for exactly this cross-cutting
  case.
- `completeRuntime` **delegates to** LSE-1's public `completeSession` directly for explicit early completion.
- `repeatChunk`/`revisitLater`/`checkpointRuntime` are new decisions LSE-1 has no equivalent of; none of
  them touch `state.session` at all.

## Runtime Decisions

All 9 named decisions are implemented, one file each under `decisions/`, each returning the shared
`RuntimeActionResult` (`{ success: true; state; events } | { success: false; error }`) Result-type — the
same convention as every prior UCE/LSE layer, never a thrown exception.

| Decision | Advances position? | Touches `state.session`? |
|---|---|---|
| `startRuntime` | constructs fresh state | via LSE-1 `startSession` |
| `continueRuntime` | yes | via LSE-1 `completeSession`, only on exhaustion |
| `pauseRuntime` | no | via LSE-1 `pauseSession` |
| `resumeRuntime` | no | via LSE-1 `resumeSession` |
| `repeatChunk` | no (mark-only) | no |
| `skipChunk` | yes | via LSE-1 `completeSession`, only on exhaustion |
| `revisitLater` | no (mark-only) | no |
| `checkpointRuntime` | no | no |
| `completeRuntime` | jumps to end | via LSE-1 `completeSession` |

`internal/validateRuntimeTransition.ts` is the one shared legal-transition table every decision but `start`
consults first (the same disclosed exception LSE-1's own `startSession` makes — a fresh runtime is a
construction, not a transition). `repeat-chunk`/`skip-chunk`/`revisit-later`/`checkpoint` all require
`'active'`, the same as `continue` — all four only make sense against a chunk actively in view.

## Chunk Scheduling — the 5 Strategies

`internal/applyChunkStrategy.ts` is the one shared dispatcher; every strategy is pure and reuses an
already-real upstream signal, never inventing a new one:

- **Sequential** — real identity over LSE-1's own natural `location.order`.
- **Priority First** — sorts by each chunk's real `enrichment.importance` (UCE-3B, 0-1) descending.
- **Dependency First** — sorts by the real topological position (`ConceptAnalysis.recommendedOrder`, UCE-5's
  own prerequisite/depends-on/builds-upon sort) of the concept each chunk introduces (LSE-1's own resolved
  `checkpointConceptNodeId`) — never a second, independently-derived dependency order. A chunk introducing no
  concept, or one whose concept sits in a real detected cycle, sorts after every resolvable chunk.
- **Review First** — reuses the ULO's own real `learning.memoryBlueprint` (UCE-6's own "hardest to retain
  first" ordering) verbatim as the sort key.
- **Adaptive Queue** — the one strategy that is genuinely per-runtime rather than a static ULO re-sort:
  chunks marked `revisit-later` float to the front, chunks `skip`ped sink to the back, everything else sorts
  by real importance. `continueRuntime`/`skipChunk` re-apply chunk scheduling from LSE-1's own natural-order
  queue on every call (via `internal/advanceRuntime.ts`), so a mark made since the last advance is reflected
  immediately — this re-application is what makes the strategy "adaptive" rather than a one-time sort.

## Learning State Evaluation, Progress Runtime, Checkpoint Runtime

- `evaluateLearningState()` (public, top-level) returns a real per-chunk snapshot — `focusLevel` from the
  ULO's own `experience.attentionBlueprint`, `suggestedReadingStrategy`/`learningDifficulty` from
  `analysis.chunkAnalyses`, and `isRepeatedChunk`/`repeatCount`/`isMarkedForRevisit` from the runtime's own
  tracked state — reused, never re-derived, no new AI call.
- `internal/computeRuntimeProgress.ts` mirrors LSE-1's own progress model (real `estimatedLearningTimeSeconds`
  reuse, honest 100%-for-empty-queue floor) computed against `scheduledQueue`, adding real `skippedCount`/
  `revisitCount` summaries — the genuine value-add over LSE-1's `SessionProgress`.
- Checkpoint Runtime has two real, disclosed halves: automatic (`internal/buildAdvanceEvents.ts` emits
  `checkpoint-reached` on arrival, mirroring LSE-1's own `buildPositionEvents.ts`) and explicit
  (`checkpointRuntime` decision, an honest no-op when the current chunk isn't a checkpoint).

## Extension Interfaces (reserved, not implemented)

`types/RuntimeExtension.ts` re-exports LSE-1's own `LearningModeType` verbatim (never a second, duplicate
enum — all 9 named modes already have exactly one real value there) and adds `RuntimeModeAdapter`, the
runtime-layer sibling of LSE-1's `LearningModeAdapter`: reacts to the decisions LSE-1 has no concept of
(`onChunkSkipped`, `onChunkRepeated`, `onChunkMarkedForRevisit`) in addition to the shared lifecycle hooks.
Every method is optional and returns `void`; no decision calls into a `RuntimeModeAdapter` this sprint, and
no concrete adapter is implemented for any named mode.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` on all new files — clean.
- `npx vitest run` (whole repo) — **572 test files, 3696 tests passed** (21 new test files, 53 new tests in
  `adaptive-learning-runtime/`), zero regressions against the pre-existing 551/3643 baseline.
- `npm run build` — compiled successfully. One intermittent prerender failure was observed on
  `/discover-learning-potential/reading` during verification; reproduced identically with LSE-2's new files
  fully removed via `git stash`, confirming it's a pre-existing, unrelated flake in
  `src/features/reading-discovery/loadContent.ts` (a dataset-sampling error), not caused by this sprint —
  left untouched, out of LSE-2's scope.
- Scope check — zero diff under `universal-learning-engine/` or `learning-session-engine/`; all new code
  isolated to `adaptive-learning-runtime/`. Grep-verified: production files import exactly two `@/core/...`
  targets (the ULO barrel and the LSE-1 barrel), never a lower engine or LSE-1 internal directly.
- Circular-dependency check — confirmed nothing outside `adaptive-learning-runtime/` imports from it yet
  (no consumer exists this sprint).
- No duplicate runtime logic — `applyChunkStrategy`, `computeRuntimeProgress`, `buildAdvanceEvents`,
  `validateRuntimeTransition`, and `advanceRuntime` are each the single real implementation every relevant
  decision calls.

## Remaining Roadmap

LSE-2 is the reusable adaptive runtime every future Learning Mode™ will drive on top of LSE-1. No Learning
Mode, Dashboard, or UI work has begun. Per the brief's STOP instruction, the next sprint (whichever Learning
Mode™ is authorized first — Quantum Speed Reading™, Memory Mode™, or another) awaits architectural review
before starting.
