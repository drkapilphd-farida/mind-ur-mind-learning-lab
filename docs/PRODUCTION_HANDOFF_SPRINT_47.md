# Production Handoff — Sprint 47 (Premium Reading Player™)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue Production Sprint 48 onward with zero
context loss.
**Scope of this document:** Sprint 47 only. Builds on `docs/PRODUCTION_HANDOFF_SPRINT_46.md` (the
Reading Intelligence Lab™ orchestration layer this sprint composes) and
`docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`. Continues the Reading Intelligence Lab™ arc — not part of
the separate, unrelated "Real AI Integration™" mock arc (Sprints 23–45).

---

## 1. What This Sprint Is

`src/features/premium-reading-player/` — a new, real, tested component tree that is the single
orchestration layer *presenting* a reading session to the learner: Welcome → Daily Mission Banner +
Reading Objective → Exercise Transition → the actual exercise (delegated, untouched) → Session Summary
(Reading Score, Mind Score Update, XP Reward, Continue Learning).

**The central research finding**: nearly everything the brief asked for already existed, live, in
production, split across three separate, un-unified player lineages. Building this sprint required
identifying and respecting that fragmentation rather than adding a fourth lineage:

1. **Universal Runtime** (`src/hooks/exercise-engine/useUniversalExerciseRuntime.ts` +
   `src/components/exercise-engine/UniversalExercisePlayer.tsx` + `ExerciseCountdown`/`SessionProgress`/
   `RuntimeResultScreen`/`ChoiceGrid`) — already powers **Flash Reading Mode** (Word Flash) and
   **Chunk Reading Mode** (Chunk Reading, Progressive Chunk Reading). Already has countdown, live
   progress, pause/resume, completion animation, a full result screen, and next-speed/next-milestone
   recommendation. No exit confirmation.
2. **`ReadingExperience.tsx`** — a separate, bespoke long-form scrolling passage reader. Not one of
   this sprint's three named modes; untouched, unreferenced.
3. **`ExerciseRunner` + `RsvpExperience`/`RsvpCanvas`** — the RSVP single-word-at-a-time reader. This
   is **Streaming Reading Mode**. Older, simpler lineage: no countdown, no pause, no live progress bar.
4. **Session Start / Daily Mission / Reading Objective** already exist:
   `app/labs/quantum-speed-reading/start/page.tsx` + `QuantumReadingLanding` +
   `getTodaysGoal`/`getMotivationalMessage` (`src/lib/exercises/dashboardInsights.ts`).

**Genuinely new territory** (confirmed by repo-wide grep, zero existing precedent): **Exit
Confirmation**. A real, previously-unused Radix `Dialog` primitive (`src/components/ui/dialog.tsx`)
existed and is used for the first time here.

---

## 2. The Hard Constraint and How This Sprint Resolves It

"Do NOT rewrite any runtime" means `UniversalExercisePlayer.tsx`, `ExerciseRunner.tsx`, and `RsvpCanvas`
cannot be touched — including to add an exit-confirmation hook to their own internal exit buttons.
`PremiumReadingPlayer` cannot intercept those buttons. Instead:

- Its own outer chrome (Welcome → Mission Banner/Objective) is shown *before* the child engine mounts —
  sequential, never nested inside it.
- Its own Session Summary is shown *after* the child engine reports completion, via a callback the
  caller's render-prop invokes.
- Its own persistent Exit affordance is entirely separate from whatever exit control the mounted child
  engine has.
- `active` phase mounts **exactly** whatever `renderActiveExperience(onExerciseComplete)` returns — this
  feature contains **zero** flash/chunk/streaming rendering logic of its own, matching
  `UniversalExercisePlayer`'s own "never changes when exercises are added" precedent.

**Explicitly out of scope, not silently dropped**: true interception of the child engines' own
internal exit/pause controls, and a live-progress overlay during Streaming mode (RSVP's canvas exposes
no progress callback) — both would require adding an optional prop to those existing files, which is
authorized only in a future, explicitly-scoped sprint.

---

## 3. Directory Tree (23 files)

```
src/features/premium-reading-player/
  types/
    ReadingPlayerMode.ts              ('flash' | 'chunk' | 'streaming')
    ReadingPlayerPhase.ts             ('welcome' | 'mission' | 'active' | 'completed')
    ReadingPlayerExerciseOutcome.ts
    ReadingPlayerSessionSummary.ts
    ReadingPlayerValidationIssue.ts
    ReadingPlayerValidation.ts
    index.ts
  session/
    buildReadingPlayerSessionSummary.ts (+ .test.ts)
    index.ts
  validation/
    validateReadingPlayerSessionSummary.ts (+ .test.ts)
    index.ts
  components/
    WelcomeAnimation.tsx
    DailyMissionBanner.tsx
    ReadingObjectiveCard.tsx
    ExitConfirmationDialog.tsx
    ExerciseTransition.tsx
    ReadingPlayerSummaryScreen.tsx
    PremiumReadingPlayer.tsx
    index.ts
  testFixtures.ts
  index.ts
```

Collision research: `PremiumReadingPlayer`, `ReadingPlayerSession`, `ReadingPlayerPhase`,
`ExitConfirmation`, `WelcomeAnimation`, `DailyMissionBanner`, `ReadingObjective`, `NextRecommendation`,
`ExerciseTransition`, `LiveProgress`, `ReadingModeSelector` — all zero collisions. `SessionSummary`
already existed twice (`focus-discovery`, `rapid-visual-intelligence`) with unrelated shapes — this
feature uses `ReadingPlayerSessionSummary` instead.

---

## 4. Reuse Manifest

| Sprint 47 module | Reused from (verbatim, unchanged) |
|---|---|
| Flash / Chunk Reading Mode | `UniversalExercisePlayer` — mounted whole, as-is, via the caller's render-prop |
| Streaming Reading Mode | `RsvpExperience`/`ExerciseRunner` — same render-prop delegation |
| Countdown | `src/components/exercise-engine/ExerciseCountdown.tsx` (standalone, already generic — not composed by this feature directly, but confirmed reusable by a future integration sprint for Streaming mode, which lacks a native one) |
| Completion Animation | `src/components/exercises/MicroVictoryMoment.tsx`, fed by Sprint 46's `buildReadingCompletionContract` shape (`progressLabel`) |
| Exercise Transition timing | `useMicroVictoryReveal.ts`'s generic reveal-timer mechanic |
| Motion language | `usePhaseFadeClass.ts`, `usePrefersReducedMotion.ts` |
| Exit Confirmation UI primitive | `src/components/ui/dialog.tsx` (existing, previously unused) |
| Reading Score, Mind Score Update, XP Reward, Continue Learning | `src/features/reading-intelligence/` (Sprint 46) — `ReadingIntelligenceExperienceResult` consumed as an already-loaded, type-only import |
| Daily Mission / Reading Objective text | `getTodaysGoal`/`getMotivationalMessage` (composed by the caller, not this sprint — passed in as plain strings) |

**Zero duplicate scoring/streak/journey logic, verified**: `buildReadingPlayerSessionSummary` only
reads existing fields off an already-loaded `ReadingIntelligenceExperienceResult` and passes through
the caller-reported `accuracyPercent` — grep confirms every `@/features/reading-intelligence` import in
this feature is `import type` only; there is no runtime call into Sprint 46's code, only its types.

---

## 5. Public Contracts

```ts
// session/
function buildReadingPlayerSessionSummary(
  outcome: ReadingPlayerExerciseOutcome,
  experience: ReadingIntelligenceExperienceResult,
): ReadingPlayerSessionSummary

// validation/
function validateReadingPlayerSessionSummary(summary: ReadingPlayerSessionSummary): ReadingPlayerValidation
// Checks: reading-score-out-of-range (0-100 when non-null), mind-score-out-of-range (0-1000),
// non-negative-xp.

// components/PremiumReadingPlayer.tsx
type PremiumReadingPlayerProps = {
  mode: ReadingPlayerMode
  stageTitle: string
  exerciseTitle: string
  missionText: string
  objectiveText: string
  estimatedTime: string | null
  exitHref: string
  progressLabel: string | null
  renderActiveExperience: (onExerciseComplete: (outcome: ReadingPlayerExerciseOutcome) => void) => React.ReactNode
  sessionSummary: ReadingPlayerSessionSummary | null
}
```

`PremiumReadingPlayer` owns the `welcome → mission → active → completed` phase state machine plus an
orthogonal exit-confirmation boolean reachable from any non-terminal phase. All six sub-components
(`WelcomeAnimation`, `DailyMissionBanner`, `ReadingObjectiveCard`, `ExitConfirmationDialog`,
`ExerciseTransition`, `ReadingPlayerSummaryScreen`) are independently exported and independently usable.

---

## 6. Validation

| Issue type | Checks |
|---|---|
| `reading-score-out-of-range` | `readingScore` (when non-null) within `0–100` |
| `mind-score-out-of-range` | `mindScore` within `0–1000` |
| `non-negative-xp` | `xp.totalXp`/`fromCompletedExercises`/`fromStreak` all `>= 0` |

---

## 7. Test Coverage

**10 tests across 2 test files, all passing.** Matches Sprint 46's established testing boundary: only
pure logic is unit-tested (`buildReadingPlayerSessionSummary`, `validateReadingPlayerSessionSummary`).

**Explicitly not tested this sprint, and why**: the 7 `.tsx` components. Confirmed via
`vitest.config.ts` (`environment: 'node'`) and a repo-wide search: **zero `.test.tsx` files exist
anywhere in this codebase, and there is no React Testing Library dependency.** Component-rendering
tests are not part of this project's established infrastructure, and this sprint does not introduce
that infrastructure unilaterally — that is a testing-strategy decision for the user, not something to
add silently. Component correctness is instead ensured by `tsc --noEmit` (full prop/type checking
across every component) and `npm run build` (every component actually compiles). This is a disclosed
limitation, not a gap papered over.

---

## 8. Build Verification (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt** (including all 7 new `.tsx` files).
2. `npx vitest run src/features/premium-reading-player` — **10/10 passing, first attempt.**
3. `npx vitest run` (whole repo) — **462 test files, 3134 tests, all passing** — zero regressions (up
   from Sprint 46's 460/3124: +2 files / +10 tests, exactly this sprint's additions).
4. `npm run build` — **green, first attempt** (full route table generated, `✓ Compiled successfully`,
   no type errors, no lint errors).
5. Import-confinement check — every `@/features/reading-intelligence` import is `import type` only
   (zero runtime coupling). No import of `UniversalExercisePlayer`, `ExerciseRunner`, `RsvpCanvas`, or
   any other existing runtime/engine file anywhere in the new folder — confirms the render-prop
   delegation design was followed exactly.
6. `git status` — only `src/features/premium-reading-player/` (new) plus this session's docs appear as
   untracked/new. **No existing file was modified.**

---

## 9. Known Limitations

1. **Not wired into any page or route.** `PremiumReadingPlayer` is fully real, type-checked, and
   buildable, but nothing calls it outside its own test suite. A future sprint must supply a real
   `renderActiveExperience` implementation (mounting the correct existing engine per mode) and real
   `missionText`/`objectiveText`/`sessionSummary` data.
2. **No live-progress overlay for Streaming mode.** RSVP's `RsvpCanvas` exposes no progress callback;
   adding one would modify an existing runtime file, out of scope this sprint.
3. **No interception of the child engines' own internal exit/pause buttons.** `UniversalExercisePlayer`'s
   and `ExerciseRunner`'s own exit controls continue to work exactly as before, unconfirmed, alongside
   this feature's separate Exit affordance. Unifying them would require an additive prop change to
   those files — deferred, not silently worked around.
4. **`ExerciseCountdown` reuse for Streaming mode is documented but not wired.** The plan identified it
   as the right component to reuse for RSVP's missing countdown, but since no page integration happens
   this sprint, it isn't actually composed anywhere yet.
5. **No `.test.tsx` coverage** — see §7. If the user wants component-level testing in the future, that
   requires deciding on and installing testing infrastructure (jsdom environment, React Testing
   Library) — a repo-wide decision, not something to introduce inside one feature.
6. **`window.location.href` is used for the Exit Confirmation's actual navigation** rather than
   `next/navigation`'s `useRouter` — deliberate, since this component tree isn't nested under any
   Next.js route yet and a router instance may not always be available to a standalone-mounted
   component; a future integration sprint may want to swap this for `useRouter().push()` once it's
   wired into a real page.

---

## 10. Resume Instructions for Sprint 48

**Nothing has been done for Sprint 48 yet — no brief has been received.** When it arrives:

1. Re-read `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`, `docs/PRODUCTION_HANDOFF_SPRINT_46.md`, and
   this document before doing anything else.
2. If Sprint 48 is about wiring `PremiumReadingPlayer` into a real exercise page: decide which page(s)
   first (Word Flash and Chunk Reading are the most natural first candidates, since both already run on
   `UniversalExercisePlayer`). The integration will need to: (a) call
   `createReadingIntelligenceExperience().load()` (Sprint 46) after the child engine reports completion,
   (b) call `buildReadingPlayerSessionSummary` with the real outcome, (c) decide whether adding an
   optional prop to `UniversalExercisePlayer`/`ExerciseRunner` (for true exit/pause interception or
   Streaming-mode live progress) is now in scope — if so, that is a deliberate, explicit exception to
   "no runtime modification," not a default.
3. Collision research, self-contained-vs-bridging analysis, and Plan Mode before code — same discipline
   as every sprint in this arc.
4. Verify using the same 6-step sequence (§8) — the whole-repo baseline going into Sprint 48 is
   **462 test files / 3134 tests**, `tsc` clean, build green.
5. Report results and stop — do not begin Sprint 49 without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at the Sprint 47 boundary.
