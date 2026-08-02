# Folder Structure

[← Back to index](./PROJECT_BLUEPRINT.md)

This is the complete, verified file tree for everything built in the Quantum Speed Reading™ V2 project (41 files, ~3,061 lines, confirmed by direct repository inspection). Files marked **(unrelated legacy V1)** already existed before this project and must not be confused with it or modified by it.

```
src/
├── features/
│   ├── reading-engine/                          ── THE MASTER READING ENGINE (locked)
│   │   ├── types.ts                             ReadingRuntimePhase, ReadingDisplayModeId,
│   │   │                                        ReadingSettings, ReadingUnit, ReadingSessionResult
│   │   ├── readingMetrics.ts                    computeWpm/formatElapsedTime (re-exported),
│   │   │                                        countWords, computeUnitDwellMs
│   │   ├── readingMetrics.test.ts               unit tests for the above
│   │   ├── readingLocalHistory.ts               loadBestWpm / recordBestWpmSession (localStorage)
│   │   ├── readingLocalHistory.test.ts          unit tests for the above
│   │   └── components/
│   │       ├── ReadingHeader.tsx                shared live header
│   │       ├── ReadingLayout.tsx                shared outer container + Exit control
│   │       ├── ReadingProgressBar.tsx           shared thin progress bar
│   │       ├── ReadingSessionCompleteScreen.tsx shared completion screen
│   │       └── ReadingStatTile.tsx              shared {label,value} stat atom
│   │
│   ├── reading-hub/                              ── THE READING HUB
│   │   ├── readingHubModes.ts                   the 5-mode manifest (4 available, 1 coming-soon)
│   │   └── components/
│   │       ├── ReadingHubModeCard.tsx
│   │       ├── ReadingHubRecentActivity.tsx
│   │       └── ReadingHubProgressSummary.tsx
│   │
│   ├── phrase-reading-mode/                       ── PHRASE READING (V2 mode #2)
│   │   ├── phraseReadingModeDataset.ts
│   │   └── components/
│   │       ├── PhraseReadingModeSettings.tsx
│   │       ├── PhraseReadingModeCanvas.tsx       (horizontal scroll renderer)
│   │       └── PhraseReadingModeExperience.tsx
│   │
│   ├── sentence-reading-mode/                     ── SENTENCE READING (V2 mode #3)
│   │   ├── sentenceReadingModeDataset.ts
│   │   └── components/
│   │       ├── SentenceReadingModeSettings.tsx
│   │       ├── SentenceReadingModeCanvas.tsx     (vertical scroll renderer)
│   │       └── SentenceReadingModeExperience.tsx
│   │
│   ├── paragraph-reading-mode/                    ── PARAGRAPH READING (V2 mode #4)
│   │   ├── paragraphReadingModeDataset.ts
│   │   └── components/
│   │       ├── ParagraphReadingModeSettings.tsx
│   │       ├── ParagraphReadingModeCanvas.tsx    (windowed peek renderer)
│   │       └── ParagraphReadingModeExperience.tsx
│   │
│   ├── quantum-speed-reading/                     ── shared with (and mostly owned by) V1;
│   │   │                                            V2's Vertical Word Reading mode lives here
│   │   │                                            because it was migrated from a pre-V2 exercise
│   │   ├── verticalWordReadingDataset.ts        V2 mode #1 dataset
│   │   ├── readingSessionEngine.ts              (unrelated legacy V1) — computeLiveWpm/
│   │   │                                        formatElapsedTime originate here; readingMetrics.ts
│   │   │                                        re-exports from this file, does not duplicate it
│   │   └── components/
│   │       ├── VerticalWordReadingExperience.tsx   V2 mode #1 orchestrator
│   │       ├── vertical-word-reading/
│   │       │   ├── VerticalWordReadingSettings.tsx
│   │       │   └── VerticalWordReadingCanvas.tsx   (vertical scroll renderer — the reference model)
│   │       ├── ParagraphReadingExperience.tsx   (unrelated legacy V1) — mission-gated, 20-mission
│   │       │                                    Brain Challenge exercise. Typography convention
│   │       │                                    borrowed (not code-reused) by V2 Paragraph Reading.
│   │       └── ...many other unrelated legacy V1 files (Reading Preparation, Reading Intelligence,
│   │                                                     RSVP, Chunk Reading, Word Flash, etc.)
│   │
│   ├── phrase-reading/                            (unrelated legacy V1) — phraseEngine.ts,
│   │                                               phraseLibrary.ts, PhraseReadingExperience.tsx.
│   │                                               Deliberately NOT reused by phrase-reading-mode/.
│   │
│   └── (sentenceEngine.ts / sentenceLibrary.ts also live inline inside quantum-speed-reading/,
│        as the unrelated legacy V1 "Sentence Reading™" — not a separate folder.)
│
├── hooks/
│   ├── reading-engine/                            ── ENGINE HOOKS (locked)
│   │   ├── useReadingRuntime.ts                 the pacing engine itself
│   │   ├── useReadingSession.ts                 persistence composition layer
│   │   └── useContentCrossfade.ts               shared motion utility (Sprint 3.4A);
│   │                                             currently used only by Paragraph Reading
│   └── exercises/
│       ├── useExerciseSession.ts                (pre-existing, NOT part of this project) —
│       │                                        generic intro/active/completion lifecycle +
│       │                                        savePracticeSession wiring, used by every mode's
│       │                                        *Experience.tsx as the persistence boundary
│       ├── usePrefersReducedMotion.ts           (pre-existing) matchMedia reduced-motion hook
│       └── useCountUp.ts                        (pre-existing) animated-number hook
│
├── lib/
│   └── exercises/
│       ├── types.ts                             (pre-existing) LabId, PracticeSessionInputSchema
│       ├── practiceHistory.ts                   (pre-existing) computeDailyStreak,
│       │                                        computeTodaysProgress, and other pure history
│       │                                        transforms — reused as-is by the Reading Hub
│       ├── actions/
│       │   └── savePracticeSession.ts           (pre-existing) Server Action → practice_sessions
│       │                                        + exercise_progress
│       └── queries/
│           ├── getPracticeSessions.ts           (pre-existing) no exercise_id filter
│           └── getPracticeSessionsForExercises.ts  (NEW, Sprint 3.3A) — sibling with a real
│                                                    server-side exercise_id filter, used by the Hub
│
└── app/
    └── labs/
        └── quantum-speed-reading/
            ├── page.tsx                          (pre-existing V1 Lab Home) — ONE line added:
            │                                     the "Explore the Reading Hub →" footer link
            ├── vertical-word-reading/page.tsx    V2 mode #1 route
            ├── phrase-reading-mode/page.tsx      V2 mode #2 route
            ├── sentence-reading-mode/page.tsx    V2 mode #3 route
            ├── paragraph-reading-mode/page.tsx   V2 mode #4 route
            ├── reading-hub/page.tsx              Reading Hub route
            ├── phrase-reading/page.tsx           (unrelated legacy V1 route — do not confuse)
            ├── sentence-reading/page.tsx         (unrelated legacy V1 route — do not confuse)
            ├── paragraph-reading/page.tsx        (unrelated legacy V1 route — do not confuse)
            └── ...many other unrelated legacy V1 routes (preparation/, intelligence/, library/, etc.)

supabase/
└── migrations/
    ├── 20260629000001_create_exercise_progress.sql   (pre-existing, reused as-is)
    └── 20260629000002_create_practice_sessions.sql   (pre-existing, reused as-is)
```

## Naming-collision discipline

Every new V2 route/feature-folder name was checked against the existing repository **before** being created, specifically to avoid colliding with a same-named legacy V1 exercise:

| V2 name (this project) | Pre-existing V1 name it deliberately avoids |
|---|---|
| `phrase-reading-mode` | `phrase-reading` |
| `sentence-reading-mode` | `sentence-reading` |
| `paragraph-reading-mode` | `paragraph-reading` |
| `vertical-word-reading` | (no V1 equivalent — this is the one V2 mode with no naming conflict) |

If you are an AI adding a 5th or 6th mode (Guided Paragraph Reading, etc.), **check for an existing route/folder of a similar name before creating one.** See [AI_HANDOVER.md](./AI_HANDOVER.md).

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Database →](./DATABASE.md)
