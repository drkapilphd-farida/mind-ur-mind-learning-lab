# Production Handoff — AI Learning Studio™ Sprint ALS-5: Learning Workspace™

## Status: COMPLETE. QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, Dashboard, AI Processing Experience™, and the Learning Blueprint™ Experience untouched.

## What this sprint discovered before writing any code

QSR, Memory Mode, and Smart Notes each already have a fully real, working "workspace" —
`/preview/learning-projects/[id]/read`, `/memory`, `/notes` — genuinely built on the Learning Session
Runtime (real ULO load, real session recovery/resume, real progress). But the Learning Blueprint
screen's mode cards never linked to any of them: `resolveLearningModeHref` still pointed into the
Sprint-0 mock catalog (`/preview/learning-studio/*`) — for Memory Mode™ that meant a literal "Coming
soon" placeholder despite a real Memory workspace existing at a different URL, and for Quantum Speed
Reading™ it meant a disclosed-mock synthetic-content preview instead of the real ULO-backed one. This
was a real, pre-existing wiring gap, not something invented by this sprint's own scope.

Founder confirmed via `AskUserQuestion`: build the universal Learning Workspace™ as a **pre-flight
shell** — real document/session/progress/timer/resume chrome, shown for every mode reached from
"Start Learning" — that **hands off** to a mode's existing real route once shown, rather than gating
already-working functionality behind an empty dead end. This also fixes the Blueprint's stale links as
part of the same change, since "connect the Blueprint CTA to the real Learning Workspace" (this
sprint's own point 1) required it.

## What was built

### `src/features/ai-learning-studio/` (extended — same feature folder ALS-1 established)

```
types/LearningWorkspaceState.ts
queries/resolveLearningWorkspaceState.ts
components/LearningWorkspaceShell.tsx
```

- **`LearningWorkspaceState`** — a superset of the existing `ModeWorkspaceInitialState`
  (`not-processed` | `not-started` | `in-progress` | `error`), adding exactly one new, honest state:
  `unavailable`, for a real, listed Learning Mode with no real session runtime behind it yet
  (Revision, Research, Exam Preparation, Mind Map, Flashcards, MCQs).
- **`resolveLearningWorkspaceState`** — the container's one real read. For each of the three Learning
  Modes with a genuine session runtime, it calls the **exact same real find/continue functions** that
  mode's own dedicated route already calls on every load (`findReadingSessionForDocument` +
  `continueReadingSession` for QSR, the Memory and Smart Notes equivalents for their modes) — zero new
  session/runtime logic, only a new dispatcher in front of already-real functions. Every other mode
  honestly returns `unavailable`.
- **`LearningWorkspaceShell`** — purely presentational. Composes entirely from already-existing shared
  components: `SessionProgressBar`, `SessionTimer`, `SessionResumeBanner`, `SessionErrorBanner` (all
  from `learning-mode-runtime/components`, unchanged) plus the platform's own `Card`/`Badge`/
  `EmptyStateCard`. Shows: Document information (title, real content type via `analyzeDocumentContent`,
  reused a third time now), Current Learning Mode, Session status, Current session/Learning
  progress/Session timer/Resume capability (when `in-progress`), and Learning controls — a real
  "Continue to [Mode] →" action when the mode has a real destination, always a "Back to Learning
  Blueprint" action. Renders no mode-specific content (no reading passage, no memory card, no notes
  editor) — that stays each real mode's own route's job.

### `src/app/preview/learning-projects/[id]/workspace/` (new route)

`page.tsx` — same auth + ownership + document-status pattern as every other
`/preview/learning-projects/*` route; mode-agnostic via `?mode=<LearningModeId>` (validated against the
real `LEARNING_MODES` list, `notFound()` on anything else). Redirects to the project detail page if the
document isn't `'ready'` yet (mirrors `[id]/page.tsx`'s own guard). `loading.tsx` — a skeleton matching
the shell's own section rhythm. Added to `AppShell`'s `IMMERSIVE_ROUTE_PATTERNS`, matching every other
session-style route in this family.

### `resolveLearningModeHref` (`src/constants/learning/learningModes.ts`) — the actual CTA fix

- `quantum-speed-reading` / `memory-mode` / `smart-notes` → now route to the real Learning Workspace™
  (`/workspace?mode=...`), which itself hands off to each mode's real route via `continueHref`.
- `ai-mentor` → routes directly to its own real, non-project-scoped route (`/preview/ai-mentor`) — it
  doesn't use the ULO/session model at all, the same established exception from the AI Mentor sprints.
- `mind-map` / `flashcards` / `mcqs` / `revision-mode` / `research-mode` — **unchanged**. No real
  runtime exists for any of them yet; they keep falling back to `mode.href` (`null` for four of them,
  triggering the existing `WorkspaceComingSoonScreen`; the mock catalog stub for Revision/Research,
  pre-existing, not touched). Routing these through the new container instead was considered and
  deliberately deferred — see Locked Decisions.

## What was deliberately left untouched

- `useProcessingPipeline`, `ProcessingExperience.tsx`, `LearningBlueprintExperience.tsx`,
  `generateLearningBlueprint.ts`, `recommendLearningMode.ts` — zero changes.
- `read/page.tsx`, `memory/page.tsx`, `notes/page.tsx` and every component under
  `quantum-speed-reading-runtime`, `memory-mode-runtime`, `smart-notes-runtime` — zero changes. Their
  own find/continue functions are called, never modified.
- `learning-mode-runtime`'s state machine, persistence, and shared presentational components — zero
  changes; `LearningWorkspaceShell` is a new consumer, not a new implementation.
- `WorkspaceComingSoonScreen.tsx` — still reachable and unchanged, for the 5 modes with no real
  runtime.
- QSR, Memory Mode, Smart Notes, AI Mentor, the Shared Learning Runtime, `src/core/`, `/preview/dashboard`.
- Reading Intelligence UI / the Reading Experience — not begun, per the brief. The Workspace hands off
  to QSR's own already-existing route; it doesn't build or duplicate that route's content.

## Files created

```
src/features/ai-learning-studio/types/LearningWorkspaceState.ts
src/features/ai-learning-studio/queries/resolveLearningWorkspaceState.ts
src/features/ai-learning-studio/components/LearningWorkspaceShell.tsx
src/app/preview/learning-projects/[id]/workspace/page.tsx
src/app/preview/learning-projects/[id]/workspace/loading.tsx
src/constants/learning/learningModes.test.ts   (4 cases — this file had zero test coverage before)
```

## Files modified

```
src/features/ai-learning-studio/index.ts               (+ LearningWorkspaceState/resolveLearningWorkspaceState/LearningWorkspaceShell exports)
src/features/ai-learning-studio/components/index.ts     (+ LearningWorkspaceShell, client-safe sub-barrel)
src/constants/learning/learningModes.ts                  (resolveLearningModeHref fix — see above)
src/components/shell/AppShell.tsx                        (+ 1 IMMERSIVE_ROUTE_PATTERNS entry for the new route)
```

## Verification Results

- `npx tsc --noEmit` — clean.
- `npx eslint` scoped to every created/modified file above — clean.
- `npx vitest run` (whole repo) — **636 test files, 3902 tests passed** — up from ALS-4's 635/3898 by
  exactly one new file and four new tests (`learningModes.test.ts` — this constants file had no test
  coverage before this sprint; added because `resolveLearningModeHref` now carries real, easy-to-regress
  branching logic).
- `npm run build` — compiled successfully, 113 routes (same count as ALS-4). Diffed the full route
  table against ALS-4's build log:
  - New: `/preview/learning-projects/[id]/workspace` (1.13 kB, 189 kB First Load) — the real new route.
  - `/preview/learning-studio` grew from 1.01 kB/180 kB to 1.13 kB/189 kB, matching the new route's
    numbers exactly. Confirmed via `find -newer`: zero source diff to `/preview/learning-studio/page.tsx`
    or `StudioHome.tsx`. Cause: the shared `ai-learning-studio` root barrel now also re-exports
    `LearningWorkspaceShell` (which pulls in `Card`/`Badge`/`EmptyStateCard`/the shared session
    components), so webpack now hoists a larger chunk shared between these two routes — the same
    disclosed, non-functional chunk-splitting phenomenon documented in every prior sprint, just a
    bigger jump than usual because the new shared component is heavier than a single new function.
  - Six unrelated static/API routes (`/_not-found`, `/api/health`, `/api/stripe/webhook`,
    `/auth/callback`, `/robots.txt`, `/sitemap.xml`) shifted by 2 bytes each (207 B → 209 B) — none of
    these are wrapped by `AppShell` or touch anything this sprint changed; this is Next.js build
    metadata noise, not a functional change.
  - Every other route is byte-identical.
- Manual check: dev server started; `/preview/learning-projects/[id]/workspace?mode=memory-mode`
  renders real document info, real session status, and (for a document with an existing Memory session)
  real progress/timer/resume chrome, with a working "Continue to Memory Mode™" link into the existing
  real `/memory` route.

## Locked Decisions

1. The Learning Workspace™ is a pre-flight shell that hands off to already-real per-mode routes rather
   than gating them behind an empty dead end — founder-confirmed via this sprint's opening
   `AskUserQuestion`, chosen specifically to avoid regressing reachability of QSR/Memory/Smart Notes'
   already-working experiences.
2. Only the three modes with a genuine session runtime were rewired through the new container this
   sprint. The five modes with no real runtime (Mind Map, Flashcards, MCQs, Revision Mode, Research
   Mode) were deliberately left on their existing fallback — routing them through the container's
   `unavailable` state too was considered but is a materially larger, more visible change than "connect
   the Blueprint CTA to the real Workspace" strictly required, and is listed below as a disclosed
   future step rather than done unilaterally.
3. AI Mentor™ bypasses the Workspace entirely, routing straight to its own real route — it doesn't use
   the ULO/session model, the same architectural exception established in the AI Mentor sprints.
4. `resolveLearningWorkspaceState` calls each mode's real `continue*Session` action (not just a
   read-only lookup) so the container's progress/timer numbers are the exact real values each mode's
   own route would show — not a simplified or re-derived approximation.

## Future Extension Points (not implemented)

- Reading Intelligence UI / the Reading Experience itself (explicitly out of scope — the Workspace
  hands off to QSR's existing route, it doesn't rebuild it)
- Routing Mind Map™/Flashcards™/MCQs™/Revision Mode™/Research Mode™ through the universal container's
  `unavailable` state uniformly, once that's an explicit decision rather than an incidental one
- A real Learning Mode Runtime integration for Revision, Research, or Exam Preparation, which would let
  `resolveLearningWorkspaceState` return real `in-progress`/`not-started` states for them too
- A real Exam Preparation Learning Mode entry in `LEARNING_MODES`

## Stop

No further AI Learning Studio sprint begins here without explicit approval.
