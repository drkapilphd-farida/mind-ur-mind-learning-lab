# Architecture

[← Back to index](./PROJECT_BLUEPRINT.md)

## Section 3 — System Architecture

Quantum Speed Reading™ V2 is organized in strict layers. Each layer only talks to the layer directly below it, and no layer reaches back up.

```
┌─────────────────────────────────────────────────────────────┐
│  Reading Hub                                                 │
│  src/features/reading-hub/ + app/labs/.../reading-hub/       │
│  Discovery + navigation + real progress data. Knows about    │
│  all Reading Modes by manifest, but contains no reading logic│
└───────────────────────────┬───────────────────────────────────┘
                             │ links to
┌────────────────────────────▼──────────────────────────────────┐
│  Reading Modes                                                 │
│  vertical-word-reading (in quantum-speed-reading/) |            │
│  phrase-reading-mode | sentence-reading-mode |                  │
│  paragraph-reading-mode                                         │
│  Owns: dataset, Settings screen, Canvas (renderer), Experience   │
│  (orchestrator). Knows its own content shape. Does NOT own       │
│  timing, WPM math, or session persistence.                      │
└───────────────────────────┬──────────────────────────────────────┘
                             │ renders inside / calls
┌────────────────────────────▼──────────────────────────────────┐
│  Reading Shell                                                 │
│  src/features/reading-engine/components/                       │
│  ReadingHeader · ReadingLayout · ReadingProgressBar ·           │
│  ReadingSessionCompleteScreen · ReadingStatTile                 │
│  Shared, mode-agnostic UI chrome. Every mode inherits it as-is. │
└───────────────────────────┬──────────────────────────────────────┘
                             │ driven by
┌────────────────────────────▼──────────────────────────────────┐
│  Reading Runtime + Reading Session                              │
│  src/hooks/reading-engine/useReadingRuntime.ts                  │
│  src/hooks/reading-engine/useReadingSession.ts                  │
│  Phase state machine, pacing/timer, WPM/progress derivation,    │
│  session-save decision (completed vs. early-exit)               │
└───────────────────────────┬──────────────────────────────────────┘
                             │ built on
┌────────────────────────────▼──────────────────────────────────┐
│  Reading Metrics + Local History (pure functions)               │
│  src/features/reading-engine/readingMetrics.ts                  │
│  src/features/reading-engine/readingLocalHistory.ts              │
│  WPM formula, elapsed-time formatting, word counting, unit-dwell │
│  time, localStorage Best-Record read/write. No React, no state. │
└───────────────────────────┬──────────────────────────────────────┘
                             │ persists via (existing, pre-V2 infra)
┌────────────────────────────▼──────────────────────────────────┐
│  Session Persistence (existing, not part of this project)       │
│  src/lib/exercises/actions/savePracticeSession.ts                │
│  src/lib/exercises/queries/getPracticeSessions.ts                │
│  src/lib/exercises/queries/getPracticeSessionsForExercises.ts    │
│  Writes to Supabase practice_sessions / exercise_progress tables │
└──────────────────────────────────────────────────────────────────┘
```

### Separation of concerns, stated explicitly

| Layer | Owns | Does NOT own |
|---|---|---|
| Reading Hub | Discovery, navigation, aggregated real progress display | Any reading/timing/session logic |
| Reading Modes | Content (dataset), mode-specific settings, mode-specific renderer (Canvas) | Timing, WPM math, session-save decisions, shared UI chrome |
| Reading Shell | Shared header/layout/progress-bar/completion-screen/stat-tile UI | Content, timing |
| Reading Runtime/Session | Phase state machine, timer, WPM/progress derivation, completed-vs-early-exit decision | Rendering, content, database access |
| Reading Metrics/Local History | Pure WPM/time math, localStorage read/write | React state, session lifecycle |
| Session Persistence | Supabase writes/reads, RLS-enforced, server-side unlock re-verification | Everything above |

A Reading Mode **never** calls Supabase directly, **never** implements its own timer, and **never** builds its own completion screen. It receives a `units: readonly string[]` array (derived from its own dataset's `ReadingUnit[]`), passes that to `useReadingRuntime`, and renders whatever that hook returns.

---

## Section 4 — The Master Reading Engine™

### Purpose

Provide one, single, reusable implementation of "pace through a sequence of text, tracking time/words/progress, with pause/resume/restart/finish controls" — usable identically regardless of whether the sequence is words, phrases, sentences, or paragraphs.

### Responsibilities

- Own the phase state machine: `'settings' | 'reading' | 'paused' | 'complete'` (`ReadingRuntimePhase`, defined in `src/features/reading-engine/types.ts`).
- Own the pacing timer: advance to the next unit only once enough time has elapsed for that unit's own word count at the chosen target WPM.
- Derive live WPM, elapsed time, and progress percentage from pure functions (`readingMetrics.ts`), never duplicating that math per mode.
- Own Start / Pause / Resume / Restart / Finish as callback functions.
- Report a final `ReadingSessionResult` when a session ends (naturally or early), which callers hand to `useReadingSession` for persistence.

### Inputs

`useReadingRuntime(units: readonly string[], initialTargetWpm = 250): UseReadingRuntimeResult`

- `units` — a plain array of strings. **This is the entire content contract.** The engine does not know or care whether each string is one word or an entire paragraph.
- `initialTargetWpm` — the reading pace selected in that mode's own Settings screen before Start.

### Outputs (`UseReadingRuntimeResult`)

```ts
{
  phase: ReadingRuntimePhase
  targetWpm: number
  setTargetWpm: (wpm: number) => void
  currentUnitIndex: number
  currentUnit: string | null
  wordsRead: number        // cumulative, word-count-weighted, not just unit-count
  totalWords: number       // sum of countWords() across all units
  elapsedMs: number        // only accumulates while phase === 'reading'
  liveWpm: number
  progressPercent: number
  wasFinishedEarly: boolean
  start: () => void
  pause: () => void
  resume: () => void
  restart: () => void
  finish: () => void
}
```

### The `ReadingUnit` abstraction

```ts
// src/features/reading-engine/types.ts
export type ReadingUnit = {
  id: string
  text: string
}
```

`ReadingUnit` exists **above** the engine, at the content-preparation layer — every mode's dataset file exports `readonly ReadingUnit[]`, giving each unit a stable `id` for React keys. The mode's orchestrator (`*Experience.tsx`) then does `units.map((u) => u.text)` before calling `useReadingRuntime`, which itself only ever sees `readonly string[]`. This was a deliberate design choice (Sprint 3.1B) to add real value (stable keys, a documented content-preparation convention) without changing the "locked" engine hook's own signature at all.

### Lifecycle

```
settings ──start()──▶ reading ──pause()──▶ paused ──resume()──▶ reading
                         │                                          │
                         │◀─────────────restart() (from either)─────┘
                         │
                         ├──finish() (early)───────────▶ complete
                         │
                         └──(currentUnitIndex reaches end naturally)──▶ complete
```

- `start()` / `restart()` reset `currentUnitIndex`, `elapsedMs`, and `wasFinishedEarly`, then set phase to `'reading'`.
- `pause()` / `resume()` toggle between `'reading'` and `'paused'` — the internal tick interval **only exists while `phase === 'reading'`**, so paused time is genuinely excluded from `elapsedMs`, not just hidden.
- `finish()` moves directly to `'complete'` and sets `wasFinishedEarly = true` if `currentUnitIndex < totalUnits`.
- Natural completion (index reaches the end while still `'reading'`) moves to `'complete'` with `wasFinishedEarly = false`.

### Timer mechanism

A single `setInterval` at 100ms ticks only while `phase === 'reading'`. On each tick:
1. `elapsedMs` increases by 100.
2. A ref-tracked "ms since last unit advance" accumulator increases by 100.
3. If that accumulator has reached `computeUnitDwellMs(currentUnit, targetWpm)` (see below), the accumulator resets (carrying over any excess) and `currentUnitIndex` advances by one.

This is read fresh from refs on every tick (not memoized once), specifically so the per-unit dwell threshold can vary correctly as the current unit changes — a fixed threshold would break the moment a longer or shorter unit became current.

### WPM / Metrics

All in `src/features/reading-engine/readingMetrics.ts`:

```ts
export { computeLiveWpm as computeWpm, formatElapsedTime } from '@/features/quantum-speed-reading/readingSessionEngine'

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function computeUnitDwellMs(unit: string, targetWpm: number): number {
  return countWords(unit) * (60_000 / targetWpm)
}
```

`computeWpm`/`formatElapsedTime` are **re-exported, not reimplemented** — they were already the de facto canonical WPM/time functions used across several other, older parts of this codebase before the engine existed (`ReadingAssessmentFlow.tsx`, `ReadingSprintView.tsx`, and others). `countWords` and `computeUnitDwellMs` are the two genuinely new pieces the engine needed, and `computeUnitDwellMs` is the single mechanism that makes the engine content-agnostic: a unit's on-screen dwell time scales with its own word count, so a 1-word unit, a 4-word phrase, and a 90-word paragraph are all paced correctly by the exact same formula.

### Progress

```
totalWords    = sum of countWords(unit) across ALL units
wordsRead     = sum of countWords(unit) across units[0 .. currentUnitIndex - 1]
progressPercent = round((wordsRead / totalWords) * 100)
liveWpm       = computeWpm(wordsRead, elapsedMs)
```

Both are word-count-weighted, not unit-count-weighted — a mode whose units vary wildly in length (Paragraph Reading especially) still gets an honest progress percentage.

### Session handling (the boundary with persistence)

`useReadingRuntime` produces a `ReadingRuntimePhase` and the numbers above — it has **no knowledge of Supabase, `practice_sessions`, or `localStorage`.** That is `useReadingSession`'s job:

```ts
// src/hooks/reading-engine/useReadingSession.ts
export function useReadingSession(session: ExerciseSession): UseReadingSessionResult {
  // session = the result of the PRE-EXISTING, unrelated useExerciseSession()
  // hook (src/hooks/exercises/useExerciseSession.ts) — NOT part of this
  // project, already existed for other exercise types.
}
```

Returns `{ recordResult(result: ReadingSessionResult): void, reset(): void }`.

- `recordResult` is called exactly once per completed attempt (a ref-based guard prevents double-firing); it decides `session.recordCompletion(elapsedMs)` vs. `session.recordExit(elapsedMs)` based on `result.wasFinishedEarly` — an honest early Finish is saved as a real, non-completed attempt, never silently marked "completed."
- `reset()` must be called by the mode's orchestrator whenever a new attempt begins (Read Again / Restart), or the guard would permanently block further saves for the rest of that page's lifetime.

### How a new Reading Mode plugs in

See [AI_HANDOVER.md](./AI_HANDOVER.md) for the full step-by-step. In outline: author a dataset as `ReadingUnit[]`, build a Settings screen (own presentation-only options), build a Canvas (own renderer, inheriting `ReadingLayout`/`ReadingHeader`), build an Experience orchestrator wiring `useReadingRuntime` + `useExerciseSession` + `useReadingSession` together, add a page route. **None of these steps require touching any file under `src/features/reading-engine/` or `src/hooks/reading-engine/`.**

---

## Section 12 — State Management

| Concern | Mechanism | Where |
|---|---|---|
| Reading phase/timer/progress | React state + refs inside `useReadingRuntime` | `src/hooks/reading-engine/useReadingRuntime.ts` |
| Session-save decision | React state (double-fire guard ref) inside `useReadingSession` | `src/hooks/reading-engine/useReadingSession.ts` |
| Cross-device session history | Supabase `practice_sessions` table, written via the pre-existing `savePracticeSession` Server Action | see [DATABASE.md](./DATABASE.md) |
| Per-mode Best Record | `localStorage`, one key per mode, via `readingLocalHistory.ts` | `src/features/reading-engine/readingLocalHistory.ts` |
| Content-transition animation state | `useContentCrossfade` (local component state + refs, no persistence) | `src/hooks/reading-engine/useContentCrossfade.ts` |
| Mode-specific presentation settings (Phrase Size, Sentence Width, Reading Width, Font Size) | Local `useState` in each mode's `*Experience.tsx`, **not persisted** across visits | each mode's own Experience file |
| Target WPM | Owned by `useReadingRuntime` itself (`targetWpm`/`setTargetWpm`), not persisted across visits either | `useReadingRuntime.ts` |

There is no global state library (Redux/Zustand/Context) involved anywhere in this feature area — every piece of state above is either local component state, a custom hook's internal state, or genuinely server-persisted data fetched fresh per page load. This is a deliberate simplicity choice, not an oversight — see [AI_HANDOVER.md](./AI_HANDOVER.md) for why this should stay true.

---

## Section 14 — Architecture Rules (Locked Decisions)

These rules have been enforced, sprint after sprint, by explicit "do not modify" instructions and verified every time via an unchanged automated test count (**751 test files / 4459 tests**, unchanged across every sprint from 3.1A through the latest motion sprint). Treat every rule below as binding unless a human explicitly authorizes an exception.

1. **The Master Reading Engine is content-agnostic.** `useReadingRuntime` takes `readonly string[]` and a target WPM. It must never be given knowledge of "this is a word" vs. "this is a paragraph."
2. **Reading Modes only provide content + renderer + mode-specific settings.** A mode must never implement its own timer, WPM formula, or session-save logic.
3. **The Reading Shell is shared.** `ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen`, `ReadingStatTile` are used as-is by every mode. A mode may not fork its own copy of any of these.
4. **The presentation layer may change; the engine may not.** Multiple sprints (3.4A–3.4D) completely redesigned how content transitions look and moves, without a single change to `useReadingRuntime.ts`, `useReadingSession.ts`, `readingMetrics.ts`, or `readingLocalHistory.ts`. This is proof the separation works, not a coincidence.
5. **Never fabricate data.** If a real, honest data source exists, use it. If it does not, say so in the UI ("Not tracked yet," "No sessions yet") rather than inventing or estimating a number. See the Reading Hub's Recent Activity section for the canonical example.
6. **Zero duplicated logic across modes.** Before writing new pacing/session/metrics/completion code in a mode, check whether the shared engine/shell already provides it. Every sprint in this project's history has found and reused an existing mechanism rather than rewriting one, without exception.
7. **New mode ≠ new route collision.** Every new mode's route and feature-folder name has been deliberately chosen to avoid colliding with a pre-existing, unrelated legacy V1 exercise of a similar name (see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)). Confirm no collision before naming a new route.
8. **Every sprint verifies the full test suite before and after.** `npx tsc --noEmit`, `npx eslint .`, `npx vitest run` must all be clean, and the total test count must not silently change for reasons other than genuinely new tests being added.
9. **Session-save honesty is non-negotiable.** An early Finish must record as `completed: false` (via `recordExit`), never silently upgraded to `completed: true`. This is enforced by `useReadingSession`'s `wasFinishedEarly` branch and must not be bypassed by any mode.
10. **No new database migration without explicit justification.** Best Record deliberately lives in `localStorage`, not a new DB column, specifically to avoid a migration for a single number. Per-session historical WPM is deliberately **not** tracked for the same reason (see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md)) — this is a known, accepted gap, not an oversight to silently "fix" with a migration without discussion.

See [AI_HANDOVER.md](./AI_HANDOVER.md) for what these rules mean in practice for the next piece of work.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Reading Modes →](./READING_MODES.md)
