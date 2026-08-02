# Appendix

[← Back to index](./PROJECT_BLUEPRINT.md)

## Glossary

| Term | Meaning |
|---|---|
| **Quantum Speed Reading™ V2** | This entire project — the rebuild of the reading-training experience on a shared, content-agnostic engine. Distinct from the unrelated legacy "V1" reading exercises already in this codebase. |
| **Master Reading Engine™** | `useReadingRuntime` — the single, reusable pacing/timer/WPM/progress hook every Reading Mode is built on. |
| **Reading Unit / `ReadingUnit`** | `{id: string, text: string}` — the content-preparation abstraction each mode's dataset exports. The engine itself only ever sees the `text` as a plain string. |
| **Reading Mode** | One complete, content-specific reading experience (Vertical Word, Phrase, Sentence, Paragraph) — owns a dataset, Settings screen, Canvas (renderer), and Experience (orchestrator). |
| **Reading Shell** | The 5 shared, mode-agnostic UI components every mode inherits as-is: `ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen`, `ReadingStatTile`. |
| **Reading Hub** | The discovery/navigation page listing all Reading Modes with real progress data, at `/labs/quantum-speed-reading/reading-hub`. |
| **Canvas** | A mode's renderer component (`{Mode}Canvas.tsx`) — owns the visual/motion presentation of the current reading unit. |
| **Experience** | A mode's orchestrator component (`{Mode}Experience.tsx`) — wires the engine, session persistence, and phase-based screen switching together. |
| **Best Record / Best Reading Pace** | The highest WPM ever achieved in a given mode, stored per-browser in `localStorage` via `readingLocalHistory.ts`. Not synced across devices (see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md)). |
| **Dwell time** | How long a given reading unit stays on screen before advancing, computed as `countWords(unit) × (60000 / targetWpm)` — this is the mechanism that makes the engine content-agnostic. |
| **`wasFinishedEarly`** | A flag on `ReadingSessionResult` distinguishing a natural completion from an early "Finish" — determines whether a session is saved as `completed: true` or `completed: false`. Never silently upgraded (see [ARCHITECTURE.md](./ARCHITECTURE.md), Rule 9). |
| **`useContentCrossfade`** | The shared motion utility (exit → pause → enter, same DOM node, no remount) built in Sprint 3.4A. Currently used only by Paragraph Reading's windowed-peek slots. |
| **V1 (legacy)** | The older, unrelated, pre-existing reading exercises in this codebase (`phrase-reading`, `sentence-reading`, `paragraph-reading`, and others) that this project deliberately does not modify or reuse code from — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)'s naming-collision table. |
| **`practice_sessions`** | The append-only Supabase table logging every practice attempt across the whole platform (not QSR-specific). See [DATABASE.md](./DATABASE.md). |
| **`exercise_progress`** | The sticky-completion Supabase table tracking current status (`in_progress`/`completed`) per user/lab/exercise. See [DATABASE.md](./DATABASE.md). |

## Architecture diagram

The full layered system diagram is maintained in one place to avoid drift between copies — see [ARCHITECTURE.md](./ARCHITECTURE.md), Section 3, for the complete Reading Hub → Reading Modes → Reading Shell → Reading Runtime/Session → Reading Metrics/Local History → Session Persistence diagram and its accompanying separation-of-concerns table.

## Folder diagram

The full annotated file tree (every file in this project's scope, plus the unrelated legacy files it deliberately sits alongside) is maintained in [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md), not duplicated here.

## Lifecycle / flow diagrams

### Reading Runtime phase lifecycle

Maintained in full in [ARCHITECTURE.md](./ARCHITECTURE.md), Section 4 ("Lifecycle"). Summary:

```
settings ──start()──▶ reading ──pause()──▶ paused ──resume()──▶ reading
                         │                                          │
                         │◀─────────────restart() (from either)─────┘
                         │
                         ├──finish() (early)───────────▶ complete
                         │
                         └──(currentUnitIndex reaches end naturally)──▶ complete
```

### A user's end-to-end flow through one Reading Mode

```
Reading Hub (or direct URL)
   │  click mode card
   ▼
Mode route (Server Component page.tsx)
   │  renders
   ▼
{Mode}Experience.tsx   ── phase: 'settings' ──▶  {Mode}Settings.tsx
   │                                              (Target WPM + mode-specific option)
   │  start()
   ▼
{Mode}Experience.tsx   ── phase: 'reading'/'paused' ──▶  {Mode}Canvas.tsx
   │                                              (inherits ReadingLayout + ReadingHeader,
   │                                               renders current unit per its own motion model)
   │  natural completion OR finish()
   ▼
{Mode}Experience.tsx   ── phase: 'complete' ──▶  ReadingSessionCompleteScreen
   │                                              (shared; 6 stats via ReadingStatTile)
   │  useReadingSession.recordResult()
   ▼
savePracticeSession (Server Action, pre-existing)
   │
   ├──▶ practice_sessions   (new row, every attempt)
   └──▶ exercise_progress   (upserted status, sticky-completion)
```

### Data flow for the Reading Hub's own page load

Maintained in full in [READING_HUB.md](./READING_HUB.md) ("Architecture" section) — not duplicated here to avoid two copies drifting apart.

[← Back to index](./PROJECT_BLUEPRINT.md)
