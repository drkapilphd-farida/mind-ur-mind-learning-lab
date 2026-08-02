# Production Handoff — LSE-1: Universal Learning Session Engine™

## Status: COMPLETE

## Runtime Architecture

`src/core/learning-session-engine/` is placed as a **sibling** of `universal-learning-engine` under
`src/core/` — the same precedent `ai-foundation` already established. It is not nested inside the
UCE pipeline because it is architecturally different: the UCE-1…UCE-6 arc is a knowledge-*pipeline*
(stateless transforms producing one immutable artifact), while LSE-1 is the first **stateful runtime**
in the system — it creates and evolves per-learner `LearningSession` state over time.

**Consumes ONLY the Universal Learning Object™.** Every production file under `types/`, `internal/`, and
`actions/` imports exclusively from `@/core/universal-learning-engine/universal-learning-object` (the ULO
barrel) — never `learning-chunk`, `knowledge-graph`, `learning-analysis`, `extraction`, or `ai-foundation`
directly. The one disclosed exception is `testFixtures.ts`, which is test infrastructure (not engine logic)
and legitimately chains the real lower-engine builders (`buildLearningKnowledgeGraph` →
`buildLearningAnalysis` → `buildUniversalLearningObject`) to construct a realistic ULO fixture, the same
pattern UCE-6's own `testFixtures.ts` established.

The Universal Learning Object™ itself is never mutated. `LearningSession` is a fully separate, versioned
runtime object that references its source ULO by `uloId` + `uloVersion` for traceability.

```
src/core/learning-session-engine/
  types/         SessionStatus, SessionPosition, LearningQueue, SessionEvent, SessionProgress,
                 LearningSession (+ SessionVersion), LearningModeExtension (reserved),
                 SessionActionError, SessionActionResult, index.ts (barrel)
  internal/      buildLearningQueue, computeSessionProgress, validateTransition, buildPositionEvents
                 (each: pure, single shared implementation, +test)
  actions/       startSession, continueSession, pauseSession, resumeSession, completeSession,
                 cancelSession, restartSession (each: Result-type, +test)
  testFixtures.ts  shared real ULO fixtures (chained real builders)
  index.ts         top-level public barrel — the one import path for consumers
```

## Session Lifecycle

One shared transition table (`internal/validateTransition.ts`) is the single source of truth every action
consults — no action hardcodes its own precondition:

| Transition | Allowed from |
|---|---|
| `start` | `not-started` |
| `continue` | `active` |
| `pause` | `active` |
| `resume` | `paused` |
| `complete` | `active` |
| `cancel` | `not-started`, `active`, `paused` |
| `restart` | any status |

`startSession` itself doesn't call `validateTransition` (there is no prior session object to transition
from — a fresh session is a construction, not a transition). Every other action validates first and returns
a Result-type `{ success: false, error: { code: 'invalid-transition', message } }` on an illegal call —
never a thrown exception, consistent with the Result-type convention used throughout the whole ULIE arc
(consciously chosen over the throw-based pattern found in `ai-mentor-orchestrator`).

`continueSession` and `completeSession` additionally guard against a `session.uloId !== ulo.id` mismatch,
returning `{ code: 'ulo-mismatch' }` — since progress computation depends on the exact ULO the session was
built against.

## State Model

`LearningSession` = `{ id, learnerId, documentId, uloId, uloVersion, sessionType, version, status, queue,
position, progress, eventLog, startedAt, completedAt, cancelledAt, createdAt, lastModifiedAt }`.

- `sessionType` reuses the ULO's own `SessionType` verbatim — no duplicate enum.
- `queue` (`LearningQueue`) is built once, in real document reading order (`location.order`, not the
  concept-level `analysis.recommendedLearningOrder`), with checkpoints resolved from real `'introduces'`
  GraphEdges cross-referenced against `ulo.experience.learningJourney.steps` — never a guessed ordering.
- Every action returns a **new** `LearningSession` (never mutates in place), with `version.revision`
  incremented — the same "new object per update, versioned" discipline as every prior UCE layer.

## Event Model

Seven real event kinds (`types/SessionEvent.ts`), each carrying only the fields it genuinely needs:
`chunk-started`, `chunk-completed`, `checkpoint-reached`, `session-paused`, `session-resumed`,
`session-completed`, `progress-updated`. There is deliberately **no** `session-cancelled` event — the
brief's own event list doesn't name one, so `cancelSession` signals via the status change + `cancelledAt`
alone rather than inventing an eighth event type.

`internal/buildPositionEvents.ts` is the one shared implementation of "entering a queue position"
(`chunk-started` + optional `checkpoint-reached`), reused identically by `startSession` and
`continueSession` — avoiding duplicate emission logic.

## Progress Model

`internal/computeSessionProgress.ts` is the one shared implementation every progress-affecting action calls.
`estimatedTimeLeftSeconds` sums the ULO's own real `analysis.chunkAnalyses[].estimatedLearningTimeSeconds`
(UCE-5) over the remaining queue items — never a re-derived estimate. A zero-item queue honestly yields
`completionPercentage: 1` (a real, complete session with nothing to do), not a division-by-zero crash.

## Extension Strategy (reserved, not implemented)

- **Learning Modes** — `types/LearningModeExtension.ts` reserves `LearningModeType` (9 values: quantum-
  speed-reading, memory, smart-notes, mind-map, flashcards, mcqs, revision, research, ai-mentor) and a
  `LearningModeAdapter` interface (all-optional callback hooks: `onSessionStarted`, `onChunkStarted`,
  `onChunkCompleted`, `onCheckpointReached`, `onSessionCompleted`). Type-only — no registry, no mode
  implementation this sprint.
- **Personalization** — no new type added. `PersonalizationContext` (already real, already re-exported
  through the ULO barrel from UCE-5) is the documented future hook point: a later adaptive layer would read
  it alongside `LearningSession` to adjust pacing/queue order, without any field added to `LearningSession`
  and no adaptive logic implemented here.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx vitest run` (whole repo) — **551 test files, 3643 tests passed** (41 new tests across 11 new test
  files in `learning-session-engine/`), zero regressions.
- `npx eslint` on all new files — clean.
- `npm run build` — compiled successfully.
- Scope check — zero diff under `universal-learning-engine/`; all new code isolated to
  `learning-session-engine/`.
- Circular-dependency check — confirmed nothing under `universal-learning-engine/` imports from
  `learning-session-engine/`.
- No duplicate session logic — `validateTransition`, `computeSessionProgress`, and `buildPositionEvents`
  are each the single real implementation every relevant action calls.

## Remaining Roadmap

LSE-1 is the reusable runtime every future Learning Mode™ will drive. No Learning Mode, Dashboard, or UI
work has begun. Per the brief's STOP instruction, the next sprint (whichever Learning Mode™ is authorized
first — Quantum Speed Reading™, Memory Mode™, or another) awaits architectural review before starting.
