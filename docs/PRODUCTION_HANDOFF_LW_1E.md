# Production Handoff — Sprint LW-1E: AI Learning Blueprint™

## Summary

The brief's own "FIRST TASK" — review the existing implementation before writing code — turned out to be
load-bearing: a real, substantial "Sprint 1/Sprint 2" Learning Blueprint page already existed and was fully
wired (`/preview/learning-projects/[id]/page.tsx` → `LearningBlueprintExperience.tsx`, backed by a
deterministic mock generator, `generateLearningBlueprint.ts`, producing a rich `LearningBlueprint` with
difficulty, estimated time, concepts, chapters, topics, a 7-step Learning Journey™, a Knowledge Map
preview, and an AI Insights panel). This sprint did not rebuild any of that. It added exactly the two
genuinely-missing pieces this brief asks for — **AI Observations™** (Section 1) and a real, rule-based
**AI Recommendation Engine™** (Section 2) — and reframed the bottom card grid into **Other Available
Learning Modes™** (Section 3, recommended mode excluded so it's never shown twice). Every other existing
section (Progress Timeline, Primary Concepts, Chapters, Topics, Learning Journey™, Knowledge Map Preview,
AI Insights) was kept, unchanged, per an explicit decision confirmed with the user before implementation.

## Files Modified / Created

**New:**
- `src/lib/blueprint/recommendLearningMode.ts` (+ `.test.ts`) — the Recommendation Engine
- `src/constants/learning/learningModes.ts` — the 9 Learning Modes
- `src/components/learning/AIObservationCards.tsx` — Section 1
- `src/components/learning/AIRecommendationHero.tsx` — Section 2
- `src/components/learning/LearningModeCard.tsx` — reusable card for Section 3

**Modified:**
- `src/types/learning/blueprint.ts` — additive `memoryDensity`/`diagramCount` fields
- `src/lib/blueprint/generateLearningBlueprint.ts` (+ `.test.ts`) — generates the 2 new fields
- `src/components/learning/LearningBlueprintExperience.tsx` — restructured (see below)
- `src/components/shell/AppShell.tsx` — Focus Mode™ extended to the Blueprint page

## Blueprint Architecture — What Was Reused vs. Added

**Reused, unmodified**: `deriveProjectLifecycle.ts`, `deriveJourneyStepStatuses.ts`, `BlueprintHero.tsx`,
`ProgressTimeline.tsx`, `BlueprintCard.tsx`, `JourneyTimeline.tsx`, `KnowledgeMapPreview.tsx`,
`AIInsightsPanel.tsx`, `WorkspaceComingSoonScreen.tsx`, `DifficultyBadge.tsx`, `ArrivalBackground.tsx`,
`AIPresenceLogo.tsx`, and — critically — `LEARNING_STUDIO_MODULES`
(`src/app/preview/learning-studio/navConfig.ts`), whose 5 real routes (Quantum Speed Reading™, Memory
Intelligence™, Revision™, Research™, AI Mentor™) `learningModes.ts` reads from directly (via a
`hrefFor(title)` lookup) rather than retyping the URLs — one source of truth, no drift possible.

**Added, additive-only**: `memoryDensity: 'low' | 'medium' | 'high'` and `diagramCount: number` on
`LearningBlueprint` — two small, deterministic, seeded mock fields generated the exact same way every
other field in `generateLearningBlueprint.ts` already is (seed offsets `+18`/`+19`, no drift with existing
fields). `generateLearningBlueprint.test.ts` uses property-existence/range assertions throughout, not
exact-shape snapshots, so this was a safe, non-breaking addition (confirmed by reading the test file before
touching the type).

**Superseded on this page, not deleted**: `BlueprintOverviewCards.tsx` (replaced by `AIObservationCards`)
and `STUDY_MODES`/`StudyActionCard.tsx` (replaced by `LEARNING_MODES`/`LearningModeCard`) are no longer
imported by `LearningBlueprintExperience.tsx` but remain in the codebase untouched, in case a future screen
wants them — confirmed via grep that `LearningBlueprintExperience.tsx` was their only consumer, so nothing
else broke.

**Page structure, in final order**: Living AI Symbol + screen title/subtitle → `BlueprintHero` (existing,
kept) → **AI Observations™** (new) → **AI Recommendation™** (new, hero) → **Other Available Learning
Modes™** (new, recommended mode excluded) → Project Progress → Primary Concepts → Chapters → Topics →
Learning Journey™ → Knowledge Map Preview → AI Insights (all 7 of these: existing, unchanged, just
repositioned below the 3 new sections instead of before the old Study Modes grid).

## Recommendation Logic

`recommendLearningMode(blueprint): { modeId, reason }` — a pure, exported, unit-tested function
implementing the brief's own IF/THEN rules literally, in priority order:

1. `difficulty === 'advanced'` → **Quantum Speed Reading™**
2. else `memoryDensity === 'high'` → **Memory Mode™**
3. else `diagramCount >= 10` → **Mind Map™**
4. else → **Research Mode™** (fallback)

Every branch runs on a real (mock) blueprint attribute — never a live AI call, never hardcoded per document
(same document always gets the same recommendation, since the underlying blueprint is itself deterministic).

**Disclosed substitution.** The brief's own recommendation examples mention "👁 Visual Learning™" for high
visual content, but the brief's own Section 3 list of 9 available modes never includes it — an
inconsistency in the brief itself. This sprint recommends **Mind Map™** instead (the closest real, listed
mode for visual/structural understanding) rather than inventing a 10th mode absent from the brief's own
list.

**Disclosed scope limit — no subject classification.** The brief's "Dynamic Recommendation Engine"
examples branch by document subject (Biology → Memory Mode™, Law → AI Mentor™, Mathematics → Research
Mode™, etc.). No subject/category field exists anywhere in the `documents` schema or `LearningBlueprint`
type, and guessing one from the document title via keyword-matching would produce confidently wrong results
for any title that doesn't cleanly signal one subject (e.g., "History of Molecular Biology"). This is
exactly the kind of fabricated specificity this codebase has consistently avoided elsewhere (image
generation, AI Discoveries™, daily insights). This sprint implements only the literal difficulty/memory/
visual rules, all backed by real derivable signals, and documents subject-based branching here as a
**future hook**: once a real subject/category signal exists (either a user-provided field at upload time,
or genuine document classification), `recommendLearningMode.ts` is the one place a new branch would be
added — its priority-ordered `if` structure is already built to extend this way.

## Learning Modes™ — Routing

| Mode | Route |
|---|---|
| 📖 Quantum Speed Reading™ | `/preview/learning-studio/quantum-speed-reading` (real) |
| 🧠 Memory Mode™ | `/preview/learning-studio/memory-intelligence` (real — displayed as "Memory Mode™" per this brief, routes to the existing "Memory Intelligence™" module) |
| 📝 Smart Notes™ | none — `WorkspaceComingSoonScreen` |
| 🗺 Mind Map™ | none — `WorkspaceComingSoonScreen` |
| 🃏 Flashcards™ | none — `WorkspaceComingSoonScreen` |
| ❓ MCQs™ | none — `WorkspaceComingSoonScreen` |
| 🔄 Revision Mode™ | `/preview/learning-studio/revision` (real) |
| 🔬 Research Mode™ | `/preview/learning-studio/research` (real) |
| 🤖 AI Mentor™ | `/preview/learning-studio/ai-mentor` (real) |

The 4 modes without a route use the exact same `WorkspaceComingSoonScreen` swap every mode on this page
already honestly used before this sprint — never a broken button, never a silently-disabled card. The 5
routed modes are real `<Link>` navigation to already-existing pages (currently `ModulePlaceholder` stubs at
their destination, same as before this sprint — this sprint doesn't build those destination pages, only
links to them).

**Note on scope**: none of this links into the separate, much larger, already-shipped `/labs/quantum-speed-
reading/*` product surface — that's a distinct part of the codebase, untouched by this sprint. The
"Quantum Speed Reading™" card here routes to the AI Learning Studio arc's own existing
`/preview/learning-studio/quantum-speed-reading` stub, consistent with this arc's own established
navigation (`LEARNING_STUDIO_MODULES`), not the real Labs product.

## Focus Mode™ Extension

`AppShell.tsx`'s immersive route allow-list (built in Sprint LW-1C.3) previously excluded the Blueprint
page — correct at the time, since that sprint's brief explicitly locked "Learning Blueprint." This brief
explicitly authorizes and requires Focus Mode here ("Show only Living AI Symbol, Blueprint, AI
Recommendation, Learning Modes"), so one additive pattern was added:
`/^\/preview\/learning-projects\/[^/]+$/` — matches only the bare Blueprint page (not `/new` or
`/[id]/processing`, both already matched by existing patterns). Every other `/preview/*` route is
unaffected.

## Motion

Observation cards and the Learning Modes grid use the same `animate-in fade-in slide-in-from-bottom-*`
stagger idiom established throughout this arc, `usePrefersReducedMotion`-gated. The Recommendation hero
uses the same premium glassmorphism/glow vocabulary as `PrimaryLearningMethodCard`. Card hover/lift/glow
matches `SourceTypeCard`'s established treatment. Selecting a routed mode uses real Next.js `<Link>`
navigation (no custom transition needed); selecting an unrouted mode reuses the existing, already-working
`WorkspaceComingSoonScreen` swap.

## Accessibility

- Reduced motion: all new stagger/entrance animations gated by the existing `usePrefersReducedMotion` hook.
- Keyboard: `LearningModeCard` renders a real `<Link>` or `<button>` depending on routing, both natively
  focusable/operable; `AIRecommendationHero`'s CTA is a real `Button`/`Button asChild` + `Link`.
- Screen readers: emoji glyphs are `aria-hidden`; card text content carries the actual information.
- Focus states: unchanged shadcn `Button`/focus-ring conventions throughout.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors.
2. `npx vitest run` — **473 test files / 3195 tests passed** (up from 472/3187 — 8 new tests: 6 in
   `recommendLearningMode.test.ts` covering all 4 branches plus priority ordering, 2 in
   `generateLearningBlueprint.test.ts` for the new fields), zero regressions.
3. `npm run build` — initially failed on a real, legitimate issue (not the known unrelated flake):
   `@next/next/no-assign-module-variable` flagged a local variable named `module` in `learningModes.ts`'s
   `hrefFor` helper (Next.js reserves this name to avoid webpack module-scoping conflicts). Fixed by
   renaming to `studioModule`. Re-ran clean — full static export succeeded, all routes generated
   (`/preview/learning-projects/[id]` now 11.6 kB / 242 kB, up from 10.7 kB / 198 kB, reflecting the new
   sections and the added `AIPresenceLogo`/`ArrivalBackground`). The previously-flagged
   `/discover-learning-potential/reading` issue did not reproduce this run.
4. `npx eslint` on all 11 new/changed files — clean, zero warnings or errors.
5. `git status`/`git diff --stat` scope check — confirmed nothing under `useProcessingPipeline.ts`,
   `mockProcessingRunner.ts`, `processingStages.ts`, `ProcessingExperience.tsx`, any Upload Engine file
   (`validateDocumentFile.ts`, `UploadZone.tsx`, `CameraCaptureExperience.tsx`, `ImagePreviewGrid.tsx`,
   `createLearningProjectWithDocument`), `middleware.ts` (pre-existing modified state, confirmed unrelated
   to this diff), or any migration appears.
6. Manual reasoning-level check (no browser available, disclosed as before): Blueprint page renders with
   zero sidebar/topbar; Living AI Symbol + Living Background present; AI Observations shows all 6 metrics
   with real (mock) values; AI Recommendation hero shows exactly one mode with a reason tied to real
   blueprint attributes, never duplicated in the grid below; the 5 routed modes are real links, the 4
   unrouted ones swap to `WorkspaceComingSoonScreen`; every other `/preview/*` route's `AppShell` chrome is
   unaffected.

## Stop

Per the brief's explicit instruction, no Quantum Speed Reading™ work was started — the existing
`/labs/quantum-speed-reading/*` product is entirely untouched, and the Learning Modes grid only links to
the pre-existing `/preview/learning-studio/quantum-speed-reading` stub within this same arc's own
navigation. Waiting for review before any further work.
