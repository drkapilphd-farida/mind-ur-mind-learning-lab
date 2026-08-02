# AI Handover

[← Back to index](./PROJECT_BLUEPRINT.md)

**This is the most important file in this document set.** If you are an AI (or engineer) about to write code in this feature area and can only read one file, read this one. It tells you what must never change, what may freely change, how to extend the system safely, and how to think about this project the way it has been built so far.

## What MUST NEVER change without explicit human authorization

These are the 10 locked architecture rules from [ARCHITECTURE.md](./ARCHITECTURE.md), Section 14, restated here as hard constraints:

1. **`useReadingRuntime` stays content-agnostic.** It takes `readonly string[]` and a target WPM — nothing else. Never add a parameter like `contentType` or special-case behavior for "this is a paragraph." If you think the engine needs to know what it's reading, you are about to violate the one rule that has held across every mode added so far.
2. **A Reading Mode never implements its own timer, WPM formula, or session-save logic.** If you find yourself writing a `setInterval` inside a mode's `*Experience.tsx` or `*Canvas.tsx`, stop — that belongs in the engine, which already exists.
3. **The Reading Shell components are used as-is.** `ReadingHeader`, `ReadingLayout`, `ReadingProgressBar`, `ReadingSessionCompleteScreen`, `ReadingStatTile` are shared, unforked, across every mode. Do not copy one of these into a mode's own folder to make a small tweak — extend the shared component's props instead (see "How the shared shell has evolved," below).
4. **Presentation may change; the engine may not.** Five consecutive motion redesigns (Sprints 3.4A–3.4D, see [CHANGELOG.md](./CHANGELOG.md)) touched only Canvas components and never `useReadingRuntime.ts`/`useReadingSession.ts`/`readingMetrics.ts`/`readingLocalHistory.ts`. Keep it that way.
5. **Never fabricate data.** If a real data source doesn't exist for something (e.g. per-session historical WPM), say so honestly in the UI ("Not tracked yet," "No sessions yet"). Do not estimate, interpolate, or invent a number to fill a gap. See [READING_HUB.md](./READING_HUB.md)'s Recent Activity section for the pattern to follow.
6. **Check for existing logic before writing new logic.** Every sprint in this project's history found and reused an existing mechanism (the engine, the shell, a pure metrics function) rather than rewriting one. Before adding pacing/session/metrics/completion code anywhere in a new mode, search `src/features/reading-engine/` and `src/hooks/reading-engine/` first.
7. **Check for route/folder-name collisions before naming anything new.** This codebase has an unrelated legacy V1 reading system living alongside V2 (`phrase-reading` vs. `phrase-reading-mode`, etc. — see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)). Before creating a new route or feature folder, grep the repository for a similarly-named existing one.
8. **Run the full verification suite before and after any change:** `npx tsc --noEmit`, `npx eslint .`, `npx vitest run`. The test count (751 test files / 4459 tests as of the last verified sprint) should only change because you deliberately added new tests — never because something silently broke or got deleted.
9. **Session-save honesty is non-negotiable.** An early Finish must be recorded as `completed: false` via `recordExit`, never upgraded to `completed: true`. This is `useReadingSession`'s job — don't bypass it from a mode.
10. **No new database migration without explicit justification and human sign-off.** Best Record deliberately lives in `localStorage`, not a DB column, specifically to avoid a migration for one number. If you think a new column or table is needed (e.g. for [ROADMAP.md](./ROADMAP.md) item 3, per-session WPM), propose it and get explicit confirmation before writing or applying it — this is a hard-to-reverse action against a live, shared database.

## What MAY change freely

- **The presentation/motion layer of any mode's Canvas** — how a unit is displayed, what transitions look like, what axis content scrolls on. This has already been iterated on repeatedly and is explicitly the "free" layer in this architecture.
- **A mode's own presentation settings** (adding a new one, changing its options) — as long as the setting stays presentation-only and is never passed into `useReadingRuntime`.
- **Datasets** — adding more words/phrases/sentences/paragraphs, as long as new content follows the existing authoring rules in [DATASETS.md](./DATASETS.md) (no AI-generated content, no lorem ipsum, thematically consistent, real and grammatically correct).
- **The Reading Hub's card content and copy.**
- **Adding a new Reading Mode entirely** — this is the system's intended extension point (see below).

## Coding standards

This project follows the repository-wide standards in `CLAUDE.md` and `ENGINEERING_CONSTITUTION.md` — nothing about Quantum Speed Reading™ V2 overrides them:

- No `any` in TypeScript.
- Default to Server Components; push `'use client'` as deep as possible. (Note: every Reading Mode's Canvas/Experience is a Client Component out of necessity — they use React state, timers, and `localStorage` — but each mode's page route under `src/app/labs/quantum-speed-reading/{mode}/page.tsx` is a plain Server Component.)
- All inputs validated with Zod at the boundary (see `PracticeSessionInputSchema` in [DATABASE.md](./DATABASE.md) for the existing pattern this feature area relies on).
- RLS is mandatory on all user-data tables — already true for both tables this feature area uses (see [DATABASE.md](./DATABASE.md)); do not weaken it if you ever touch a migration here.
- No `console.log` in production code — use the structured `logger` (already the convention every `[QuickIntelligence]`-style step-logging pattern elsewhere in this codebase follows; Quantum Speed Reading™ V2 itself does not currently do step-by-step server logging since its logic is client-side and stateless per session, but any future server-side logic added here should follow that same logger convention).
- No PII in logs.

## Architecture philosophy

Build the hard, general mechanism once (pacing, timing, session lifecycle, completion) and prove it generalizes by adding genuinely different content shapes on top of it (word → phrase → sentence → paragraph), changing nothing underneath each time. The proof is not a claim — it is the unchanged automated test count, verified after every single sprint in this project's history. If a future change to this feature area breaks that pattern (i.e., a new mode requires an engine change), treat that as a signal to stop and reconsider the mode's design, not as a reason to special-case the engine.

## Product philosophy

Calm, honest, premium reading practice. "Honest" specifically means: never show a number the system cannot actually back with real data (Rule 5, above). "Premium" means motion and presentation quality matter and have been iterated on more than once — but never at the cost of the engine's simplicity or the data's honesty.

## How to add a new Reading Mode (step by step)

1. **Check for naming collisions first.** Search the repo for any existing route or feature folder resembling your new mode's name (see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)'s naming-collision table for the pattern — e.g. `phrase-reading-mode` vs. the unrelated legacy `phrase-reading`).
2. **Author the dataset.** New file `src/features/{mode-slug}/{mode}Dataset.ts`, exporting `readonly ReadingUnit[]` (`{id, text}`) plus a `TOTAL_*` count, following the authoring rules in [DATASETS.md](./DATASETS.md) (real content, no AI generation, thematically consistent, ordered easy-to-hard where meaningful).
3. **Build the Settings screen.** New `components/{Mode}Settings.tsx` — Target WPM picker plus any mode-specific presentation option (font size, width, etc.). Presentation-only; never wire a setting into the engine's content contract.
4. **Build the Canvas (renderer).** New `components/{Mode}Canvas.tsx` — inherit `ReadingLayout` (pick a `maxWidthClassName` appropriate to your content) and `ReadingHeader`. Decide your motion model deliberately (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for what every existing mode does, and [ROADMAP.md](./ROADMAP.md) item 2 for the open question of whether a new mode should match an existing axis or the asymmetry is still acceptable) rather than defaulting to a sixth different mechanism without reason.
5. **Build the Experience orchestrator.** New `components/{Mode}Experience.tsx` — wire `useReadingRuntime(units.map(u => u.text))` + the pre-existing `useExerciseSession` + `useReadingSession` together, switching between Settings / Canvas / `ReadingSessionCompleteScreen` by phase, exactly like every existing mode does (see [READING_MODES.md](./READING_MODES.md)'s shared file-shape convention at the top of that file).
6. **Add the page route.** New `src/app/labs/quantum-speed-reading/{mode-slug}/page.tsx` — a plain, ungated Server Component rendering the Experience component, no `LabNavHeader` (immersive reading screens own their own Exit control via `ReadingLayout`).
7. **Register it in the Reading Hub.** Add an entry to `readingHubModes.ts` with `status: 'available'` and a real `href`/`exerciseId`/`storageKey` (or `status: 'coming-soon'` with none of those, if the mode isn't ready to launch yet).
8. **Verify.** Run `npx tsc --noEmit`, `npx eslint .`, `npx vitest run` — confirm the pre-existing test count only grows by however many new tests you added, never shrinks or changes for any other reason. Manually verify in a browser: Settings → Canvas advances at the correct pace for your content shape → completion screen shows real stats → a practice session is actually saved (check `practice_sessions`) → Reading Hub's card for the new mode shows real Best Reading Pace / Last Practised once you've completed a session.

## How future development should continue

Treat every locked rule above as binding until a human explicitly overrides it for a specific, stated reason — not because a new sprint brief seems to imply the rule doesn't apply this time. When a sprint brief references something that isn't visible to you (a screenshot, a video, a Figma link), say so explicitly in your own output rather than silently guessing and presenting the guess as fact — this project's own history (see [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)'s closing note on Section 2) has repeated this exact situation multiple times, and transparency about it has been the correct call every time. Keep every sprint scoped to the fewest files necessary, and state explicitly, in your own final report, which files were touched and which related files were deliberately left untouched — this document set exists because that discipline was followed consistently enough to reconstruct accurately after the fact.

[← Back to index](./PROJECT_BLUEPRINT.md) · [Next: Changelog →](./CHANGELOG.md)
