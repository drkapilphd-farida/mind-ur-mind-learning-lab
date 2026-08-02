# UX Documentation — Reading Journey UX & Navigation™ (Sprint QSR-2.5)

## Summary

A UX polish sprint on top of the locked Sprint QSR-2 flow (Chapter Ready → Word Flash → Progressive Chunk
Reading → Reading Assessment → Chapter Complete → Next Chapter). No architecture, engine, Exercise Asset, or
AI change — `useQuantumReadingJourneyController`'s 5-stage persisted state machine is untouched. Every change
here is presentational, navigational, or a new *read-only* query over data QSR-2 already persists.

## What's new

**Reading Journey Home** (`quantum-reading-journey/home/QuantumJourneyHome.tsx`) — the learner now starts the
journey, not an exercise. Shows the book title, overall progress, streak, total reading time, a "Continue
Journey" / "Start Journey" CTA, and a full chapter card list (`QuantumJourneyChapterCard.tsx`: number, title,
status, estimated time, past assessment score). Every figure comes from a new, pure-read Server Action,
`loadQuantumJourneyOverview` — queries `chapter_intelligence_blueprints` (real per-chapter titles/times),
`learning_asset_bundles` (chapter count), and `learning_sessions` (`session_type = 'qsr-journey'`, already
written by QSR-2) for status/scores/timing. **No new table, no new column.**

Chapter status (`locked | ready | current | completed`) is a real, sequential derivation — extracted into a
pure, unit-tested function, `deriveQuantumJourneyChapters`, mirroring `getModuleProgress`'s own
`deriveAvailability` precedent: at most one chapter is ever `current`/`ready`; everything after it is
`locked`; everything at or before the last completed chapter is `completed`.

**Streak reuses an existing, real algorithm** — `computeDailyStreak` (`src/lib/exercises/practiceHistory.ts`),
already used for the platform's other streak displays, fed with `qsr-journey` session rows reshaped into its
existing `PracticeSessionRecord` input shape. Not reimplemented.

**Reading time is computed, never persisted** — `readingTimeMinutes` on the Chapter Complete screen is real
elapsed wall-clock time (`Date.now() - startedAtRef.current`, tracked in the controller since QSR-2), shown
once at completion and never written to the database — the "no architecture changes" constraint stays literal.
The Home screen's own aggregate "total reading minutes" figure, by contrast, is a real derivation from
`learning_sessions.started_at`/`completed_at` — columns that already existed on the table before this sprint.

**Journey Navigation** (Objective 2) — `QuantumReadingJourneyExperience.tsx` (new) is a thin switch between
Home and the (unmodified) Controller. Choosing "Continue Journey" or a specific unlocked chapter card hands
off into the Controller at that `chapterOrder`; the learner never sees a Word Flash/Chunk Reading/Assessment
picker — those still happen automatically, exactly as QSR-2 locked them.

**Transitions & loading copy** (Objectives 5/6) — every loading/transition string now matches the brief's own
example vocabulary verbatim where given ("Great! Now let's read meaningful chunks.", "Excellent. Let's check
understanding.", "Preparing important words…", "Organising this chapter…", "Finding important ideas…"). A new
`transition-to-word-flash` beat was added between Chapter Ready and Word Flash — the same purely local,
never-persisted `TransitionUiStage` pattern QSR-2 already established for the other three transitions, not a
change to the real 5-stage machine.

**A within-chapter step indicator** (`QuantumJourneyStageDots.tsx`, Objectives 4/12) — three calm dots (Word
Flash / Reading Chunks / Understanding Check), replacing the previous "Chapter N of M" as the *only* progress
signal during a chapter; the chapter-level counter still shows in the header.

**Error recovery** (Objective 11) — `QuantumJourneyErrorScreen.tsx` replaces the raw `SessionErrorBanner`
everywhere inside the journey: real, honest error text (never fabricated) inside a warmer frame, with Retry
and Return to Dashboard actions. `QuantumJourneyProcessingEmptyState.tsx` (Objective 10) is a **distinct**,
calm state for "this document's AI processing genuinely hasn't finished yet" — `loadQuantumJourneyOverview`
now returns an optional `reason: 'not-processed' | 'not-found'` alongside its existing `error` string so the
UI can tell "nothing is wrong, just wait" apart from "something is actually wrong," without changing what any
existing caller of the similarly-shaped `loadQuantumJourneyChapter` receives.

**Chapter Complete** (Objective 8) now shows three real figures — Reading Time, Words Covered
(`wordAssets.length`, the chapter's own real count), Journey Progress (`chapterOrder + 1` of `totalChapters`)
— replacing the plain congratulations-only screen.

**Perceived performance** (Objective 14) — the *next* chapter is prefetched in the background the moment the
current chapter's completion write actually lands (`persist(...).then(() => prefetch)`, never before —
`loadQuantumJourneyChapter` gates chapter N+1 server-side on chapter N's real completed status, so prefetching
earlier risked an honest-but-confusing rejection). `goToNextChapter` uses the prefetched result if it's ready
instead of re-querying.

## Accessibility

Real, applied fixes, not a full formal audit (see Disclosed gaps below): every interactive element is a
native `<button>`/`<Link>` (keyboard-focusable by construction, no click-only `<div>`s); loading/transition
screens carry `role="status" aria-live="polite"`; the chapter card's decorative completion bar was changed
from a `role="progressbar"` with a **fabricated** `aria-valuenow` (an arbitrary "50%" for "in progress") to
`aria-hidden="true"`, since the adjacent status text already announces the real, honest state — a real
"don't expose a number we don't actually have" fix, not a stylistic one. All new colors reuse this project's
existing design tokens (`text-muted-foreground`, `border-destructive/25`, etc.) rather than introducing new,
unvetted contrast values.

## Files

```
src/features/learning-mode-runtime/
  actions/
    loadQuantumJourneyOverview.ts (+ test)             — new, read-only
  quantum-reading-journey/
    QuantumReadingJourneyExperience.tsx                — new, Home ⇄ Controller switch
    QuantumReadingJourneyController.tsx                — edited: initialChapterOrder/onExitToHome props, new copy, stage dots, prefetch
    useQuantumReadingJourneyController.ts               — edited additively: initialChapterOrder param, transition-to-word-flash beat, prefetch cache, readingTimeMinutes — 5-stage machine itself unchanged
    home/
      QuantumJourneyHome.tsx / QuantumJourneyChapterCard.tsx   — new
    components/
      QuantumJourneyErrorScreen.tsx / QuantumJourneyProcessingEmptyState.tsx / QuantumJourneyStageDots.tsx   — new
      QuantumJourneyChapterCompleteScreen.tsx           — edited: real reading time/words/progress
```

## Disclosed gaps

- No automated accessibility audit (axe-core or similar) was run — this codebase has no such tooling
  installed, and installing one is out of scope for a UX polish sprint. The fixes above are real but manual.
- No new authenticated browser click-through was performed this sprint either, for the same reason disclosed
  in QSR-2's own documentation (Next.js middleware redirects unauthenticated requests before the page module
  compiles) — verification is the real production demonstration below plus the full regression suite.
- The hub-link deferral from QSR-2 stands unchanged — this sprint didn't revisit it.

## Testing

7 new unit tests for `deriveQuantumJourneyChapters` (the pure chapter-status derivation). Full existing suite
re-run — 745 files, 4,410 tests, zero regressions. `tsc --noEmit` and `eslint` both clean.

**Real production demonstration** (temp script, deleted after use, disposable test user): ran
`deriveQuantumJourneyChapters` and `computeDailyStreak` against real data for every document in the live
project that currently has real Learning Assets — today that is exactly **one** document ("Photosynthesis
Validation," 2 real chapters, real titles "Section 1"/"Section 2"). Confirmed: before any progress, chapter 1
is `ready` and chapter 2 is `locked`; after a real `saveQuantumJourneyProgress` write marks chapter 1
complete, chapter 2 correctly becomes `ready` and `currentChapterOrder` advances to 1; a real streak of 1
computed from the one real completed session. Objective 15 asked for validation across multiple real
documents — only one currently exists in this environment's live data, so multi-document validation is
honestly disclosed as unverified rather than fabricated; the derivation logic itself has no per-document
special-casing, so there's no specific reason to expect a second document to behave differently, but that's
an inference, not a demonstrated fact.
