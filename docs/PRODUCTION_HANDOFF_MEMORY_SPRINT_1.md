# Production Handoff — Memory Mode™ Sprint-1: Shared Learning Runtime + Engine

## Status: COMPLETE — Engine only. No UI. Stop point reached per brief.

## What This Sprint Was

Not a rebuild. Memory Mode™ reuses the exact same production architecture Quantum Speed
Reading™ (QSR) already proved out:

```
Learning Session Engine (LSE-2)
  ↓
Universal Learning Object (ULO)
  ↓
Shared Learning Runtime   ← new this sprint
  ↓
Shared Session Persistence ← new this sprint (inside Shared Learning Runtime)
  ↓
Shared Analytics           ← reused as-is (SessionSnapshot fields, no new metric)
  ↓
Memory Mode                ← new this sprint (engine only)
```

The only genuinely new work was extracting QSR's Sprint-1 implementation — which was already
almost entirely mode-agnostic in practice — into a real shared module, then registering Memory
Mode against it. No new runtime, session engine, persistence mechanism, analytics system, or AI
pipeline was created. No new database migration was needed.

## Part 1 — Shared Learning Runtime (`src/features/learning-mode-runtime/`)

Extracted from `quantum-speed-reading-runtime`'s own Sprint-1 files, which turned out to already
be ~95% mode-agnostic — they just happened to be the only Learning Mode that existed yet.

```
src/features/learning-mode-runtime/
  validation/schemas.ts                          SessionIdSchema, ChunkStrategySchema
  persistence/
    uloRecord.ts (+test)                          moved verbatim
    sessionSnapshotRecord.ts (+test)               moved + generalized (see below)
    loadUniversalLearningObject.ts                 moved verbatim
    saveUniversalLearningObject.ts                 moved verbatim
    createSupabaseSessionPersistenceAdapter.ts     moved + generalized (see below)
  orchestration/
    resolveCurrentChunkView.ts (+test)             moved verbatim (renamed return type)
    applyModeSessionDecision.ts (+test)            moved + renamed (already took `mode` param)
  actions/
    runModeSessionDecision.ts                      moved + renamed (parameterized on `mode`)
    findModeSessionForDocument.ts                  moved + renamed (parameterized on sessionType)
  types/
    ModeChunkView.ts                               renamed from ReadingChunkView
    ModeSessionActionResult.ts                     renamed from ReadingSessionActionResult
  testFixtures.ts                                  moved + sessionType parameterized
  index.ts                                         public barrel
```

### Two real generalizations made during the move

Both were hardcoded to `'reading'` because QSR was, until now, the only caller. Both had to be
genuinely fixed — not worked around — for Memory Mode to produce correct data, without changing
QSR's own observable behavior.

1. **`sessionSnapshotRecord.ts`** — `toSessionRecord()` hardcoded `session_type: 'reading'`
   unconditionally, and `LearningSessionRecord.session_type` was typed as the literal `'reading'`.
   Now: the type is widened to `'reading' | 'memory' | 'revision' | 'research'` (the
   `learning_sessions` table's own real CHECK constraint, ADR 0001), and the value is derived from
   `snapshot.sessionType` at write time. For every existing QSR session, `snapshot.sessionType` is
   always `'reading'` — so every existing row and every existing QSR test round-trips identically.
   `'practice'` (LSE-1's own 5th `SessionType`) is intentionally still excluded — the table's CHECK
   constraint doesn't include it; that gap predates this sprint and isn't this sprint's to fix.

2. **`createSupabaseSessionPersistenceAdapter.ts`** — `listByLearner()` hardcoded
   `.eq('session_type', 'reading')`. Now: `sessionType` is a required third constructor argument,
   used for that same filter. QSR's own thin wrapper
   (`quantum-speed-reading-runtime/persistence/createSupabaseSessionPersistenceAdapter.ts`) pins it
   to `'reading'`, producing the exact same query QSR always ran. This also fixed a latent
   correctness gap: `findReadingSessionForDocument` (now `findModeSessionForDocument`) was relying
   on the adapter to pre-filter by mode. A learner with both a reading session and a memory session
   for the same document could, before this sprint, only ever collide inside QSR's own reading-only
   query — but the fix makes the filtering explicit and mode-aware end to end, not implicit.

### One disclosed, non-functional change

`runModeSessionDecision`'s error strings are now mode-agnostic ("Session not found." instead of
"Reading session not found.", etc.) since the function now genuinely serves more than one mode. No
test in this codebase asserts on the exact string; no control flow, persisted data, or
success/failure outcome changed — only this diagnostic wording. Flagged here explicitly rather than
silently changed; a 5-minute follow-up to parameterize the strings if exact preservation is wanted.

## Part 2 — QSR converted to thin, behavior-preserving shims

Every file QSR previously owned directly now either re-exports the shared implementation under its
original name, or wraps it with the original signature. Every existing QSR caller
(`nextReadingChunk.ts`, `previousReadingChunk.ts`, `pauseReadingSession.ts`,
`resumeReadingSession.ts`, `finishReadingSession.ts`, `continueReadingSession.ts`,
`getReadingProgress.ts`, `startReadingSession.ts`, all components, `page.tsx`) needed **zero
changes** — same import paths, same names, same signatures, same behavior.

- `types/ReadingChunkView.ts`, `types/ReadingSessionActionResult.ts` — type re-exports.
- `persistence/loadUniversalLearningObject.ts`, `persistence/saveUniversalLearningObject.ts` —
  function re-exports (already fully generic, nothing to wrap).
- `persistence/createSupabaseSessionPersistenceAdapter.ts` — thin wrapper preserving the original
  2-argument signature, pinning `sessionType` to `'reading'`.
- `actions/runReadingSessionDecision.ts` — thin wrapper (both `runReadingSessionDecision` and
  `runReadingSessionDecisionWithClient`) delegating to the shared, mode-parameterized version.
- `actions/findReadingSessionForDocument.ts` — thin wrapper pinning `sessionType` to `'reading'`.
- `types/schemas.ts` — re-exports the now-shared `SessionIdSchema`/`ChunkStrategySchema`; keeps
  `StartReadingSessionInputSchema` defined locally (its `'sequential'` default is a genuinely
  QSR-specific choice, not shared behavior).

Two files that were purely internal (never imported outside QSR's own action files) were moved
wholesale rather than shimmed, since there was no external name/path to preserve:
`orchestration/resolveCurrentChunkView.ts` and `orchestration/applyReadingSessionDecision.ts`.
`startReadingSession.ts`'s one import of `resolveCurrentChunkView` was updated to the new shared
path — the only source-level edit made to a previously-passing QSR file this sprint. QSR's own
`testFixtures.ts` became fully unused once its persistence/orchestration tests moved to the shared
module's own fixtures, and was removed rather than left as dead code.

## Part 3 — Memory Mode™ (engine only)

`src/core/learning-modes/memory-mode/` — pure registration, mirroring `qsrLearningMode.ts` exactly:

```ts
export const memoryLearningMode: LearningMode = {
  type: 'memory',
  capabilities: {
    sessionType: 'memory',
    supportedChunkStrategies: ['review-first', 'adaptive-queue', 'sequential'],
    supportsCheckpoints: true,
  },
}
```

No `adapter` registered — presentation-layer hooks stay reserved, exactly as QSR's own Sprint-1 did.

`src/features/memory-mode-runtime/` — 9 thin Server Actions mirroring QSR's own action set exactly
(`startMemorySession`, `continueMemorySession`, `nextMemoryChunk`, `previousMemoryChunk`,
`pauseMemorySession`, `resumeMemorySession`, `finishMemorySession`, `getMemoryProgress`,
`findMemorySessionForDocument`), every one composing the Shared Learning Runtime directly — no
Memory-specific type aliases were introduced (`ModeChunkView`/`ModeSessionActionResult` are used
as-is), since there is no pre-existing Memory Mode UI whose import paths need preserving the way
QSR's did.

**Explicitly not built this sprint, per the brief:** no UI, no presentation layer, no flashcards, no
spaced repetition, no quizzes, no notes, no AI Mentor.

## Verification Results

- `npx tsc --noEmit` — clean, zero errors.
- `npx eslint` scoped to every directory touched (`src/features/learning-mode-runtime`,
  `src/features/memory-mode-runtime`, `src/features/quantum-speed-reading-runtime`,
  `src/core/learning-modes/memory-mode`) — clean, zero errors or warnings.
- `npx vitest run` (whole repo) — **596 test files, 3768 tests passed**, zero regressions and zero
  failures. New coverage: `uloRecord`/`sessionSnapshotRecord`/`resolveCurrentChunkView`/
  `applyModeSessionDecision` in the shared module (including cross-mode assertions proving the
  extraction genuinely works for `'memory'`, not just `'reading'`), plus `memoryLearningMode`'s own
  registration test.
- `npm run build` — compiled successfully on the first attempt, all 110 routes generated. The
  reading route's bundle (`/preview/learning-projects/[id]/read`) is unchanged at 7.07 kB, first
  concrete evidence QSR's runtime behavior and bundle didn't shift.

## Scope Check

- Zero new database migration. `universal_learning_objects` and `learning_sessions` are reused
  as-is (QSR Sprint-1 / ADR 0001).
- Zero changes to any pre-existing file under `src/core/` — only new files were added, under the
  new `src/core/learning-modes/memory-mode/` directory.
- Zero changes to any existing public API — every QSR Server Action keeps its original name, path,
  and signature.
- Zero duplicate runtime, session engine, persistence, analytics, or AI pipeline — Memory Mode
  composes the same Shared Learning Runtime QSR now also uses.

## Remaining Roadmap

Per the brief's explicit stop instruction, Memory Mode Sprint-2 does not begin here. Memory Mode
currently has a real, working, tested engine and zero presentation layer — the same state QSR was
in after its own Sprint-1.
