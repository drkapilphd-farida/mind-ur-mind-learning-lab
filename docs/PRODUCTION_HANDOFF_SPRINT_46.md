# Production Handoff — Sprint 46 (Reading Intelligence Lab™ Experience Layer)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue Production Sprint 47 onward with zero
context loss.
**Scope of this document:** Sprint 46 only. It builds on, and does not repeat, two prior documents:
`docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` (the duplication research and product decisions that
shaped this sprint) and `docs/PRODUCTION_HANDOFF_SPRINT_35-44.md`/`docs/PRODUCTION_HANDOFF_SPRINT_45.md`
(the unrelated, separate "Real AI Integration™" arc — Sprint 46 is **not** part of that arc; read on
for why).

---

## 1. What This Sprint Is, and Why It's Different From Sprints 35–45

Sprints 35–45 built the "Real AI Integration™" arc: fully self-contained, deterministic, zero-real-I/O
mock engines under `src/features/{provider-*, ai-*, streaming-runtime, recovery-engine, ...}`.

**Sprint 46 is a different kind of thing entirely.** It is a thin orchestration layer,
`src/features/reading-intelligence/`, that composes **real, live, async, Supabase-backed** production
functions belonging to the actual Reading Lab product (`src/lib/exercises/*`,
`src/hooks/exercises/*`, and select real exercise-catalog constants from other `src/features/*`
folders). It reuses; it does not mock. "Zero cross-feature imports" from the 35–45 arc does not apply
here the same way — see §5 for the one deliberately confined exception.

### The path that got here

1. The Sprint 46 brief ("Reading Intelligence Lab™ Experience Layer," 11 named modules: Reading
   Journey, Daily Mission, Reading Session, Session Flow, Progress Tracking, XP, Streak, Journey
   State, Continue Learning, Completion Experience, Navigation Contracts) named several "existing,
   production-ready" engines (Flash Runtime, Chunk Runtime, Streaming Runtime, Adaptive Runtime,
   Dataset Engine, Recovery Engine, Personalization Engine) that turned out not to all exist under
   those exact names — some were the (unrelated) Sprint 35–45 arc, others were loosely-named
   references to real exercise-rendering infrastructure.
2. Research (an Explore-agent pass plus direct file reads) found that **most of what the brief asked
   for already exists, live, in production** — not as unwired scaffolding, but wired into
   `/dashboard`, `/progress`, and `/labs/quantum-speed-reading` today, Supabase-backed.
3. That research became `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md`, documenting 6 real duplicate/
   fragmented implementations already in the codebase (streak computed 5 ways, two incompatible
   `computeJourneyProgress` functions, two incompatible `TodaysMissionCard` components, a dormant
   unwired "Intelligence Engine Foundation," an XP-vs-Mind-Score vocabulary split, and — the single
   biggest finding — that `/labs/quantum-speed-reading/intelligence` **already exists**, live, gated,
   and is already called "Reading Intelligence," built in a prior "Sprint 4 — Adaptive Intelligence
   Engine™."
4. Three product decisions resolved the open questions: (1) that existing page is the canonical
   Reading Intelligence Lab™ — no second page; (2) `computeDailyStreak()` is the single canonical
   streak; (3) Mind Score™ is primary, XP is new/secondary.
5. This sprint implements exactly that: a pure-composition orchestration layer, reusing real functions
   verbatim, adding only what doesn't already exist (XP), touching no existing file, creating no new
   route.

---

## 2. Scope Boundary

**In scope**: the *shell* experience around all four real Reading Lab stages — journey position,
mission framing, progress, streak, Mind Score, XP, session-flow contract, completion-moment contract,
navigation-decision contract.

**Explicitly out of scope**: `src/features/quantum-speed-reading/adaptive-intelligence/` (Reading
Profile, Reading DNA™, Personal Bests, AI Coach, Goals, Achievements, Analytics — the existing
intelligence page's own internal analytics engine). None of the 11 brief-named modules correspond to
that content. Zero imports, zero changes.

**No new page/route. No `.tsx` files. No modification to any existing file.** Wiring this
orchestration layer into the real `/labs/quantum-speed-reading/intelligence` page is deferred to a
future, explicit sprint.

---

## 3. Directory Tree (38 files)

```
src/features/reading-intelligence/
  types/
    ReadingJourneyState.ts
    ReadingDailyMission.ts
    ReadingSessionFlowContract.ts
    ReadingProgressSnapshot.ts
    ReadingXp.ts
    ReadingCompletionContract.ts
    ReadingNavigationContract.ts
    ReadingIntelligenceValidationIssue.ts
    ReadingIntelligenceValidation.ts
    ReadingIntelligenceExperienceResult.ts
    index.ts
  journey/
    buildReadingJourneyState.ts (+ .test.ts)
    index.ts
  dailyMission/
    buildReadingDailyMission.ts (+ .test.ts)
    index.ts
  progress/
    buildReadingProgressSnapshot.ts (+ .test.ts)
    index.ts
  xp/
    computeReadingXp.ts (+ .test.ts)
    index.ts
  completion/
    buildReadingCompletionContract.ts (+ .test.ts)
    index.ts
  navigation/
    buildReadingNavigationContract.ts (+ .test.ts)
    index.ts
  validation/
    validateReadingIntelligenceExperienceResult.ts (+ .test.ts)
    index.ts
  orchestration/
    ReadingIntelligenceExperience.ts
    DefaultReadingIntelligenceExperience.ts (+ .test.ts)
    index.ts
  testFixtures.ts
  index.ts
```

`ReadingSessionFlowContract` is defined in `types/` but has no dedicated builder folder — it's a pure
type-level contract (no computation to wrap) describing what a future page will pass in from
`useExerciseSession`, not something this sprint composes at runtime.

---

## 4. Reuse Manifest — Every Real Function/Type This Sprint Composes

| Module | Reused from (verbatim, unchanged) |
|---|---|
| Reading Journey | `src/lib/exercises/journeyProgress.ts` → `computeJourneyProgress()`, `JourneyProgress`, `JourneyStageView` |
| Daily Mission | Derived from the same `JourneyProgress` — no separate source |
| Reading Session / Session Flow | `src/hooks/exercises/useExerciseSession.ts` → `ExerciseSessionStage` (type only) |
| Progress Tracking | `src/lib/exercises/queries/getModuleProgress.ts` → `getModuleProgress()`, `ModuleProgress` |
| Streak | `src/lib/exercises/practiceHistory.ts` → `computeDailyStreak()`, `DailyStreak` (product decision #2) |
| Mind Score (primary metric) | `src/lib/exercises/mindScore.ts` → `computeReadingScore()`, `computeMindScore()`, `getMindScoreLabel()` (product decision #3) |
| XP (secondary) | **New** — nothing existed to reuse |
| Journey State | Composition of the above (journey + streak + Mind Score) — not the dormant, unwired `src/types/intelligence/JourneyState` |
| Continue Learning | `src/lib/exercises/continueLearning.ts` → `getContinueLearningSummary()`, `ContinueLearningSummary` |
| Completion Experience | `src/components/exercises/MicroVictoryMoment.tsx` prop shape (type only) |
| Navigation Contracts | `src/lib/exercises/queries/getExerciseAccess.ts` → `ExerciseAccess` (type only — this sprint does not call `getExerciseAccess`/`verifyExerciseIsUnlocked` itself, since it renders nothing yet) |

Also reused (real exercise-catalog constants, zero logic, same purpose
`app/labs/quantum-speed-reading/page.tsx` already uses them for): `VISUAL_ACTIVATION_SEQUENCE`/
`VISUAL_ACTIVATION_EXERCISE_IDS` (`@/features/visual-intelligence/visualActivationSequence`),
`EYE_FOUNDATION_MODULE` (`@/features/quantum-speed-reading/eyeFoundationModule`),
`READING_EXPANSION_MODULE` (`@/features/quantum-speed-reading/readingExpansionModule`),
`FLASH_INTELLIGENCE_MODULE` (`@/features/flash-intelligence/flashIntelligenceModule`).

---

## 5. Public Contracts

```ts
// journey/
buildReadingJourneyState(journey: JourneyProgress, streak: DailyStreak, mindScore: number, mindScoreLabel: string): ReadingJourneyState

// dailyMission/
buildReadingDailyMission(journey: JourneyProgress): ReadingDailyMission

// progress/
buildReadingProgressSnapshot(stages: readonly ReadingStageProgress[]): ReadingProgressSnapshot

// xp/
computeReadingXp(completedExerciseCount: number, currentStreak: number): ReadingXp
// 10 XP per completed exercise + 5 XP per current streak day. Never
// influences Mind Score, journey status, or navigation.

// completion/
buildReadingCompletionContract(stageTitle: string | null, position: {index, total} | null): ReadingCompletionContract
// Shape matches MicroVictoryMomentProps exactly.

// navigation/
buildReadingNavigationContract(access: ExerciseAccess): ReadingNavigationContract

// validation/
validateReadingIntelligenceExperienceResult(result: ReadingIntelligenceExperienceResult): ReadingIntelligenceValidation

// orchestration/
interface ReadingIntelligenceExperience { load(): Promise<ReadingIntelligenceExperienceResult> }
class DefaultReadingIntelligenceExperience implements ReadingIntelligenceExperience
function createReadingIntelligenceExperience(overrides?: Partial<ReadingIntelligenceDataSource>): ReadingIntelligenceExperience
```

### The one confined reuse seam

`orchestration/DefaultReadingIntelligenceExperience.ts` is the **only** file in this feature that
imports real, non-type values from other `src/features/*` folders or calls real async production
functions — mirroring Sprint 41's (`ai-runtime-orchestrator`) precedent of confining cross-boundary
calls to one coordinator file. Its `load()`:

1. Fetches, in parallel, all 4 real stages' `ModuleProgress` (`getModuleProgress`) plus
   `PracticeSessionRecord[]` (`getPracticeSessions`) — the only two calls wrapped in an injectable
   `ReadingIntelligenceDataSource` dependency bag, so tests substitute stub data instead of hitting
   Supabase.
2. Calls `getContinueLearningSummary`, `computeJourneyProgress`, `computeDailyStreak`,
   `computeReadingScore`, `computeMindScore`, `getMindScoreLabel` directly — pure, deterministic,
   already-tested production functions; not wrapped, since there's nothing to stub.
3. Passes every result into this feature's own pure `build*`/`compute*` functions to assemble the
   final `ReadingIntelligenceExperienceResult`, then validates it.

The Mind Score input (`overallStagePercent = journey.completedStageCount / journey.totalStageCount`)
deliberately mirrors `app/labs/quantum-speed-reading/page.tsx`'s own computation exactly, so behavior
stays faithful once a future sprint wires this layer into a real page.

Every other file in the feature receives already-computed real data as plain arguments and is a pure
function — confirmed by grep (§8).

---

## 6. Validation

One validator, checking internal consistency of the *composed* result only (the real data it's built
from is already guaranteed correct by its own source systems):

| Issue type | Checks |
|---|---|
| `non-negative-xp` | `xp.totalXp` / `fromCompletedExercises` / `fromStreak` all `>= 0` |
| `progress-count-overflow` | `overallCompletedCount <= overallTotalCount` |
| `mind-score-out-of-range` | `journeyState.mindScore` within `0–1000` |

---

## 7. Test Coverage

**28 tests across 8 test files, all passing.**

| File | Coverage |
|---|---|
| `journey/buildReadingJourneyState.test.ts` | Composition correctness, determinism |
| `dailyMission/buildReadingDailyMission.test.ts` | Current-stage derivation, all-stages-complete fallback, determinism |
| `progress/buildReadingProgressSnapshot.test.ts` | Aggregation across stages, empty-array/zero-division guard, determinism |
| `xp/computeReadingXp.test.ts` | Formula correctness, zero case, determinism |
| `completion/buildReadingCompletionContract.test.ts` | All 3 label-composition branches, determinism |
| `navigation/buildReadingNavigationContract.test.ts` | Allowed/disallowed/no-redirect branches, determinism |
| `validation/validateReadingIntelligenceExperienceResult.test.ts` | One case per issue type, co-occurring issues, valid pass-through |
| `orchestration/DefaultReadingIntelligenceExperience.test.ts` | Full happy-path `load()` (hand-verified XP/progress arithmetic), new-learner/all-zero case, confirms `getModuleProgress` called once per real stage with correct `labId`s, determinism — **stub data source, zero real Supabase calls in any test** |

**Deliberately not tested by this sprint**: `journeyProgress.ts`, `continueLearning.ts`,
`mindScore.ts`, `practiceHistory.ts`, `getModuleProgress.ts`, `getExerciseAccess.ts` themselves —
existing, unmodified production files with their own coverage; re-testing them here would itself be a
form of duplication this sprint was explicitly built to avoid.

---

## 8. Build Verification (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx vitest run src/features/reading-intelligence` — **28/28 passing, first attempt** (including
   hand-computed orchestration-level arithmetic, which matched real function output exactly).
3. `npx vitest run` (whole repo) — **460 test files, 3124 tests, all passing** — zero regressions (up
   from Sprint 45's 452/3096: +8 files / +28 tests, exactly this sprint's additions).
4. `npm run build` — **green, first attempt** (the known `reading-discovery` flake did not trip).
5. Import-confinement check — every `@/features/*` **value** import in the new folder is confined to
   `orchestration/DefaultReadingIntelligenceExperience.ts` (4 imports: `FLASH_INTELLIGENCE_MODULE`,
   `EYE_FOUNDATION_MODULE`, `READING_EXPANSION_MODULE`, `VISUAL_ACTIVATION_SEQUENCE`/
   `VISUAL_ACTIVATION_EXERCISE_IDS`). Every other cross-boundary import anywhere else in the feature
   (`@/lib/exercises/*`, `@/hooks/exercises/*`) is `import type` only — confirmed by grep.
6. `git status` — only `src/features/reading-intelligence/` (new) plus this session's three docs
   (`ARCHITECTURE_CONSOLIDATION_REPORT.md`, this file, and the pre-existing
   `PRODUCTION_HANDOFF_SPRINT_35-44.md`/`_45.md`) appear as untracked/new. **No existing file was
   modified.**

---

## 9. Known Limitations

1. **Not wired into any page or route.** `DefaultReadingIntelligenceExperience` is fully real and
   functional but nothing calls it outside its own test suite. Wiring it into
   `/labs/quantum-speed-reading/intelligence` (per product decision #1: evolve that page, don't
   replace it) is explicitly future work for a later sprint.
2. **XP is genuinely new and unvalidated against product intent beyond "secondary, additive."** The
   10-per-exercise/5-per-streak-day formula is a placeholder-quality first pass; a future sprint should
   treat the exact numbers as tunable, not load-bearing.
3. **`ReadingSessionFlowContract` is unused by any function in this sprint** — it exists purely as a
   documented type contract for a future page's own `useExerciseSession` integration. This is
   deliberate (matches the arc's convention of type-only contracts preceding real usage — see
   `AIStreamingContract` from the unrelated Sprint 5), not dead code to clean up.
4. **`adaptive-intelligence/` (Reading DNA™, Personal Bests, AI Coach, etc.) remains completely
   separate** from this orchestration layer. If a future sprint wires this feature into the real
   intelligence page, it will need to decide how (or whether) to also compose that engine's output —
   not decided here, deliberately out of scope.
5. **The cross-Lab duplication documented in `ARCHITECTURE_CONSOLIDATION_REPORT.md`** (streak
   triplication outside Reading Lab, the two `computeJourneyProgress`/`TodaysMissionCard` pairs, the
   dormant Intelligence Engine Foundation) remains untouched — still real technical debt, still
   belongs to a separate, future, explicitly-scoped consolidation sprint.

---

## 10. Resume Instructions for Sprint 47

**Nothing has been done for Sprint 47 yet — no brief has been received.** When it arrives:

1. Re-read `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` and this document before doing anything else —
   if Sprint 47 touches the Reading Lab experience further, the duplication map and reuse manifest
   here are still the load-bearing context.
2. If Sprint 47 is about wiring `reading-intelligence` into the real
   `/labs/quantum-speed-reading/intelligence` page: that page currently composes its own data inline
   (Reading Profile/DNA/Personal Bests/AI Coach from `adaptive-intelligence/`) — decide explicitly
   whether/how `ReadingIntelligenceExperience.load()` output complements or replaces parts of that,
   and whether any `.tsx` changes are actually authorized (this sprint's brief forbade them; confirm
   whether that still holds).
3. Collision research, self-contained-vs-bridging analysis, and Plan Mode before code — same discipline
   as every sprint in this session, regardless of which "arc" a future sprint belongs to.
4. If a brief revives the separate "Real AI Integration™" arc instead (Sprint 47 as a continuation of
   Sprints 35–45), follow `docs/PRODUCTION_HANDOFF_SPRINT_45.md` §12's instructions instead — that arc
   and this one are independent; don't cross their conventions.
5. Verify using the same 6-step sequence (§8) — the whole-repo baseline going into Sprint 47 is
   **460 test files / 3124 tests**, `tsc` clean, build green.
6. Report results and stop — do not begin Sprint 48 without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at the Sprint 46 boundary.
