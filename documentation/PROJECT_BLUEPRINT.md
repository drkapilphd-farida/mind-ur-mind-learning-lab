# Quantum Speed Reading™ V2 — Project Blueprint

**Audience for this document set: an AI agent (or engineer) with zero prior context.** You have not read any previous conversation about this project. Everything you need to understand what has been built, why, and how to continue safely is in this file and its linked companions. Do not assume anything beyond what is written here or verifiable in the repository itself.

**Repository:** `mind-ur-mind-learning-lab` (Next.js App Router, TypeScript strict, Supabase, Tailwind CSS)
**Feature area:** `Quantum Speed Reading™` (QSR), specifically the **V2 rebuild**, referred to throughout as **Quantum Speed Reading™ V2** or the **Master Reading Engine™** project.
**Status as of this document:** 4 of 5 planned Reading Modes are live and linked from a discoverable hub (the 5th, Guided Paragraph Reading™, is listed as "Coming Soon" with no route yet — see Section 2). The shared engine and shell are stable and considered locked except for narrowly-scoped, explicitly-justified additions.

This is a living index. If you are an AI picking up this project, read this file first, then follow the links below in order.

---

## Document set

| File | Contents |
|---|---|
| **PROJECT_BLUEPRINT.md** (this file) | Overview, philosophy, sprint-by-sprint status, completed-features checklist |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, the Master Reading Engine™, state management, locked architecture rules |
| [READING_MODES.md](./READING_MODES.md) | Every implemented Reading Mode: purpose, renderer, dataset, settings, engine integration |
| [READING_HUB.md](./READING_HUB.md) | The Reading Hub: architecture, navigation, cards, recent activity, progress summary, limitations |
| [READING_SHELL.md](./READING_SHELL.md) | The shared UI shell and reusable components every mode inherits |
| [DATASETS.md](./DATASETS.md) | Every content dataset, difficulty structure, authoring conventions |
| [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) | Complete annotated folder/file tree for this feature area |
| [DATABASE.md](./DATABASE.md) | `practice_sessions` / `exercise_progress` schema, RLS, relationships, limitations |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Typography, spacing, motion language, visual conventions |
| [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md) | Every known limitation and piece of technical debt, with priority |
| [ROADMAP.md](./ROADMAP.md) | Recommended next sprints — **documentation only, nothing here is implemented** |
| [AI_HANDOVER.md](./AI_HANDOVER.md) | **Read this before writing any code.** What must never change, what may change, how to extend safely |
| [CHANGELOG.md](./CHANGELOG.md) | Chronological record of every completed sprint |
| [APPENDIX.md](./APPENDIX.md) | Glossary, diagrams, lifecycle flows |

---

## Section 1 — Project Overview

### What Quantum Speed Reading™ V2 is

Quantum Speed Reading™ V2 is a from-scratch rebuild of the reading-training experience inside this platform. It replaces one-off, hand-built exercises with a single, reusable, **content-agnostic engine** (the **Master Reading Engine™**) that powers multiple distinct "Reading Modes" — currently Vertical Word Reading, Phrase Reading, Sentence Reading, and Paragraph Reading — all sharing identical timing, session-persistence, and completion logic, while each owning only its own content and presentation.

This is explicitly a **V2** effort. An older, unrelated "V1" reading system already exists in this codebase (legacy routes like `/labs/quantum-speed-reading/phrase-reading`, `/sentence-reading`, `/paragraph-reading`, and the mission-gated `ParagraphReadingExperience.tsx`). V1 is **not part of this project**, has not been modified by it, and must not be confused with it — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for exactly which files belong to which system.

### Why it exists

The V1 reading exercises were each built independently: separate timing logic, separate WPM math, separate session-saving code, separate completion screens. Every new exercise meant re-deriving the same mechanics from scratch, with no guarantee of consistency. Quantum Speed Reading™ V2 exists to fix this at the root: build the pacing/timing/session/completion machinery **once**, prove it works, and then add new reading content types as thin presentation layers on top — never touching the machinery again.

### Core philosophy

1. **The engine must never know what it is reading.** A "unit" of content is just a `string` (see `ReadingUnit` in [ARCHITECTURE.md](./ARCHITECTURE.md)). Whether that string is one word, a phrase, a full sentence, or an entire paragraph is invisible to the engine. This was proven, not assumed: each new mode added across the sprint history required **zero engine changes**, confirmed every time by an unchanged automated test count.
2. **Presentation is free; architecture is locked.** The visual/motion layer (how a unit is displayed, how transitions feel) has been redesigned multiple times (see the Sprint 3.4A–3.4D history in this document and in [CHANGELOG.md](./CHANGELOG.md)) without ever touching the runtime, session, or metrics logic underneath.
3. **Real data or an honest placeholder — never fabricated data.** Where a genuine data source exists (e.g. real practice history), it is used. Where it does not (e.g. per-session historical WPM, which is never persisted), the UI says so explicitly rather than inventing a number. See [READING_HUB.md](./READING_HUB.md)'s Recent Activity section for the concrete example.
4. **Minimal, justified footprint per sprint.** Every sprint in this project's history was scoped to touch the fewest files necessary, with an explicit "explicitly not touched" list, verified against the full automated test suite before and after.

### Product goals

- Give users a calm, "premium" reading-training experience across increasing units of text (word → phrase → sentence → paragraph → eventually guided paragraph).
- Track real, honest progress (Best Reading Pace per mode, real session history, a real practice streak) without fabricating metrics the system cannot actually measure.
- Make every mode discoverable from one place (the Reading Hub) rather than requiring users to know exact URLs.

### Version 1 (of this V2 effort) scope

"Version 1" here means the initial, complete slice of Quantum Speed Reading™ V2 — not to be confused with the unrelated legacy "V1" system mentioned above. This V2-Version-1 scope is:
- A reusable Master Reading Engine (timing, WPM, progress, session lifecycle).
- A reusable presentation shell (header, layout, progress bar, completion screen).
- Four working Reading Modes: Vertical Word, Phrase, Sentence, Paragraph.
- A discoverable Reading Hub linking all of them, with real progress data.
- A calm, continuous-flow motion language, iterated across several sprints.

**Not yet built** (see [ROADMAP.md](./ROADMAP.md)): Guided Paragraph Reading (the 5th planned mode — currently listed in the Reading Hub as "Coming Soon" with no route), an AI Reading Coach, per-session historical WPM tracking, cross-device Best Record sync.

### Learning objectives (per mode, summary — full detail in [READING_MODES.md](./READING_MODES.md))

| Mode | Primary learning objective |
|---|---|
| Vertical Word Reading™ | Instant word recognition, eye movement |
| Phrase Reading™ | Chunk reading, reading flow |
| Sentence Reading™ | Fluent sentence processing, meaning extraction |
| Paragraph Reading™ | Extended reading endurance, comprehension of connected prose |

---

## Section 2 — Current Product Status (sprint-by-sprint)

Every sprint below actually happened, in this order, in this repository. Each is documented in full in [CHANGELOG.md](./CHANGELOG.md); this section is the executive summary. "Files" here are representative, not exhaustive — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) for the complete list.

### Sprint 3.1A — Master Reading Engine™ Foundation
**Purpose:** Build the shared engine as pure infrastructure, with zero UI consumer yet.
**Architecture:** Introduced `ReadingUnit`, `ReadingSessionResult`, `ReadingRuntimePhase` types; `useReadingRuntime` (pacing/timer); `useReadingSession` (persistence composition); `readingMetrics.ts` (WPM/time math, re-exported from the pre-existing `readingSessionEngine.ts` rather than reimplemented); `readingLocalHistory.ts` (parametrized local Best-Record store); `ReadingStatTile` (shared stat atom).
**Files:** `src/features/reading-engine/*`, `src/hooks/reading-engine/useReadingRuntime.ts`, `src/hooks/reading-engine/useReadingSession.ts`.
**Outcome:** Engine built, unit-tested (`readingMetrics.test.ts`, `readingLocalHistory.test.ts`), zero UI yet. Full suite unaffected.
**Key design decision:** `computeUnitDwellMs(unit, targetWpm)` scales a unit's on-screen time by its own word count — this single mechanism is what later let word/phrase/sentence/paragraph content all share one engine with no per-mode timing logic.
**Reusable components produced:** `useReadingRuntime`, `useReadingSession`, `readingMetrics.ts`, `readingLocalHistory.ts`, `ReadingStatTile`.

### Sprint 3.1B — Vertical Word Reading Mode migration
**Purpose:** Prove the engine works by migrating the pre-existing Vertical Word Reading exercise onto it (that exercise had been hand-built in an earlier, separate sprint before the engine existed).
**Architecture:** `VerticalWordReadingExperience.tsx`/`VerticalWordReadingCanvas.tsx` rewritten to consume `useReadingRuntime`/`useReadingSession` instead of a one-off hook; introduced `ReadingUnit` as the content-preparation convention (`{id, text}`) at the dataset layer, keeping the engine's own hook signature at plain `string[]`.
**Outcome:** First real mode running on the shared engine. Old one-off hook and local-history file deleted (confirmed zero other consumers before deletion). Best Record storage key preserved exactly, verified live that a pre-existing localStorage value survived the migration.
**Design decision:** `ReadingUnit` lives at the mode/content layer, not inside `useReadingRuntime` itself — the engine hook still takes `readonly string[]`, keeping the "locked" engine's public signature completely unchanged even while adding this convention.

### Sprint 3.2 — Phrase Reading Mode™ (2nd engine mode)
**Purpose:** Prove the engine generalizes to a **different content shape** (multi-word phrases, not single words) with zero engine changes.
**Architecture:** New `phrase-reading-mode` feature folder and route, deliberately separate from the unrelated legacy V1 `/phrase-reading`. Dataset chunked into natural 2–4 word phrases.
**Outcome:** Confirmed live, via direct browser-timing measurement, that `computeUnitDwellMs`'s word-count-weighted pacing correctly paces multi-word units — no engine change needed. This was the sprint's whole point and is the strongest piece of evidence in this project that the "content-agnostic engine" claim is real, not aspirational.

### Sprint 3.2A — Reading Experience Polish™ (shared shell extraction)
**Purpose:** Stop every mode from hand-rolling its own header/progress/completion UI.
**Architecture:** Extracted `ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen` into `src/features/reading-engine/components/`. Retrofitted Vertical Word Reading and Phrase Reading onto this shell (both were built before the shell existed).
**Outcome:** Two mode-specific "Complete" screen files deleted (confirmed byte-identical except subtitle copy) in favor of the one shared `ReadingSessionCompleteScreen`. "Current WPM" renamed to "Reading Pace" with a "Warming up…" state for the first ~1.5s of a session (a presentation-only UX fix; the underlying WPM math was never changed).

### Sprint 3.3 — Sentence Reading Mode™ (3rd engine mode)
**Purpose:** Third content shape (one full sentence per unit), and the first mode built **directly** on the finished shared shell from day one (no retrofit needed).
**Outcome:** Needed **no mode-specific completion component at all** — direct proof the shell extraction in 3.2A was paying off. One small, explicitly-justified shared-file touch: renamed "Average WPM" → "Average Reading Pace" in `ReadingSessionCompleteScreen.tsx` for terminology consistency, verified live that this correctly propagated to every other mode's completion screen too.

### Sprint 3.3A — Reading Hub Experience™
**Purpose:** Give the (until then) URL-only-reachable modes a real, discoverable entry point.
**Architecture:** New `src/features/reading-hub/` feature folder, new `getPracticeSessionsForExercises` query (server-side filtered, sibling to the existing `getPracticeSessions`, which has no exercise-id filter), new Reading Hub page. One footer link added to the existing Lab Home page.
**Outcome:** Real data throughout — Best Reading Pace from localStorage (client-side), Last Practised/Today's Practice/Sessions/Streak from real `practice_sessions` rows. One thing deliberately **not** fabricated: Recent Activity's "Reading Pace"/"Completion %" for the last session are shown as "Not tracked yet," because `practice_sessions` genuinely has no column for them (see [DATABASE.md](./DATABASE.md)).

### Sprint 3.4 — Paragraph Reading Mode™ (4th engine mode)
**Purpose:** The first long-form, continuous-reading mode — each unit is a **whole paragraph**, not a short chunk.
**Architecture:** Borrowed the legacy V1 `ParagraphReadingExperience.tsx`'s own comfort-reading typography convention (fixed-pixel font-size/line-height, ~720px measure) rather than the large centered display type Phrase/Sentence Reading use.
**Outcome:** Confirmed live that a long (~75-word) paragraph dwells proportionally longer than a short (~30-word) one at the same target WPM — same engine mechanism, fourth confirmation.

### Sprint 3.4A — Apple Motion Polish™
**Purpose:** First motion-quality pass across all 4 modes (not yet a redesign — see 3.4B/C/D below for that).
**Outcome:** Fixed two real root causes of "mechanical" motion: (1) Phrase/Sentence/Paragraph canvases were remounting content on every advance (`key={currentUnit.id}`) with no exit animation; (2) Vertical Word Reading was snapping `font-size` (a layout-affecting property) between current/non-current words. New `useContentCrossfade` hook built (same-node exit→pause→enter, opacity/transform only, no remount).

### Sprint 3.4B — Continuous Reading Motion Engine™
**Purpose:** A genuine interaction-model redesign (not just tuning the fade from 3.4A) for Phrase, Sentence, and Paragraph Reading.
**Outcome:** Adopted a "windowed previous/current/next" model — all three always rendered and visible (not just current), each crossfading independently via `useContentCrossfade`. Rejected a full-dataset "measure every unit's height and scroll" design as too risky for highly variable-height paragraph content.

### Sprint 3.4C — Flow Reading Experience™ (Phrase Reading only)
**Purpose:** Go further than 3.4B for Phrase Reading specifically — genuine physical motion, not simultaneous in-place crossfades.
**Outcome:** Generalized `VerticalWordReadingCanvas.tsx`'s own proven mechanism (permanent list of all units + a single `translateY` scroll transform) to Phrase Reading, with a fixed row height per `PhraseSize` setting. `useContentCrossfade` stopped being used by Phrase Reading (still used by Sentence/Paragraph at this point).

### Sprint 3.4D (first pass) — Reference Flow Implementation (Sentence + Paragraph)
**Purpose:** Extend 3.4C's proven vertical-scroll model to Sentence Reading; adapt it for Paragraph Reading.
**Outcome:** Sentence Reading got the full vertical-scroll treatment (same mechanism as Phrase). Paragraph Reading deliberately **kept** its 3.4B windowed-peek structure (to avoid the real risk of clipping long, highly variable paragraph text) but gained a small consistent upward `translateY` drift on its existing crossfade, for a lighter-touch version of the same "things move" philosophy.

### Sprint 3.4D (second pass) — Phrase Flow Reading™ (horizontal)
**Purpose:** Replace Phrase Reading's vertical scroll with a **horizontal** one, per an explicit new instruction.
**Outcome:** Phrase Reading now scrolls left-right (`translateX`) instead of top-bottom — same underlying mechanism, rotated 90°, with fixed column widths per `PhraseSize` instead of fixed row heights. Sentence/Paragraph/Vertical Word Reading untouched.
**Note on scope:** at time of writing, only Phrase Reading uses the horizontal model; Sentence Reading still uses the vertical scroll model from the first 3.4D pass. This is a deliberate, current asymmetry — see [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md).

**A note on "reference video" sprints:** Several sprints in this history (3.4B onward) referenced an "attached reference video" as the design target. No video attachment ever actually reached the agent executing these sprints — this was flagged transparently in every affected sprint's own report. All motion-model decisions in 3.4B–3.4D were made from the sprint briefs' **textual** descriptions only. If a real reference video exists elsewhere, it has not yet been compared against this implementation frame-by-frame.

---

## Section 15 — Completed Features Checklist

### Engine & Architecture
- [x] Master Reading Engine™ (`useReadingRuntime`, content-agnostic timing/WPM/progress)
- [x] Shared session-persistence composition (`useReadingSession`)
- [x] Shared metrics module (`readingMetrics.ts`)
- [x] Shared local Best-Record store (`readingLocalHistory.ts`)
- [x] Shared UI shell (`ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen`, `ReadingStatTile`)
- [x] Shared motion utility (`useContentCrossfade`)

### Reading Modes
- [x] Vertical Word Reading™ (live, linked from Hub)
- [x] Phrase Reading™ (live, linked from Hub, horizontal-scroll motion model)
- [x] Sentence Reading™ (live, linked from Hub, vertical-scroll motion model)
- [x] Paragraph Reading™ (live, linked from Hub, windowed-peek + drift motion model)
- [ ] Guided Paragraph Reading™ — **Planned – Not Implemented** (listed in Reading Hub as "Coming Soon," no route exists)

### Navigation
- [x] Reading Hub (real data: Best Reading Pace, Last Practised, Today's Practice, Sessions Today, Current Streak)
- [x] Lab Home → Reading Hub discoverability link
- [ ] Reading Hub link from the Library page — **Planned – Not Implemented**

### Data honesty
- [x] Real per-mode Best Reading Pace (localStorage)
- [x] Real Last Practised / Today's Practice Time / Sessions Completed / Current Streak (from `practice_sessions`)
- [ ] Real per-session historical WPM — **Not implemented** (no DB column exists; Recent Activity shows "Not tracked yet" instead of fabricating a value)

### Motion system
- [x] Apple-style motion polish pass (Sprint 3.4A)
- [x] Windowed previous/current/next model (Sprint 3.4B)
- [x] Full vertical scroll model — Phrase (3.4C), Sentence (3.4D)
- [x] Horizontal scroll model — Phrase Reading only (3.4D second pass)
- [ ] Horizontal (or any single consistent) model applied to Sentence/Paragraph/Vertical Word — **Planned – Not Implemented**, awaiting approval per each sprint's own explicit "wait for approval" instruction

See [LIMITATIONS_AND_TECHNICAL_DEBT.md](./LIMITATIONS_AND_TECHNICAL_DEBT.md) for the full, non-checklist detail behind every unchecked item above.
