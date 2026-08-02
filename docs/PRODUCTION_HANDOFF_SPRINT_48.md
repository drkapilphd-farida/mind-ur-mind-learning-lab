# Production Handoff — Sprint 48 (Reading Intelligence Journey™ Integration)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue Production Sprint 49 onward with zero
context loss.
**Scope of this document:** Sprint 48 only. Builds directly on `docs/PRODUCTION_HANDOFF_SPRINT_46.md`
and `docs/PRODUCTION_HANDOFF_SPRINT_47.md`. Continues the Reading Intelligence Lab™ arc.

---

## 1. What This Sprint Is

`src/features/reading-intelligence-journey/` — a pure-TypeScript composition/integration layer that
orchestrates Sprint 46's data (`reading-intelligence`) and confirms/derives one genuinely new concept
(Exercise Queue) into a single `ReadingIntelligenceJourney` view. **No new UI, no new engine, no new
scoring/streak/XP/journey computation.**

**Duplication research (done before any code was written)** mapped every brief-named module against
what already exists:

| Brief module | Already covered by |
|---|---|
| Welcome | Sprint 47 `WelcomeAnimation` |
| Daily Mission | Sprint 47 `DailyMissionBanner` + Sprint 46 `ReadingDailyMission` |
| Continue Learning | Sprint 46 (`getContinueLearningSummary` reuse, exposed via `dailyMission`) |
| Session Progress | Existing `SessionProgress.tsx` + Sprint 46 `ReadingProgressSnapshot` |
| Completion Experience / Session Summary | Sprint 47 `ReadingPlayerSummaryScreen` |
| Micro Victory | Existing `MicroVictoryMoment.tsx` |
| Next Recommendation | Derived from Sprint 46's own `journey.stages` (new derivation, no new computation — see §5) |
| **Exercise Queue** | **Nothing existing** (confirmed by grep — zero "queue" terminology anywhere). The only genuinely new concept this sprint adds. |

**Conclusion reached before writing code**: this sprint could be, and was, built as a pure composition
layer — every module except Exercise Queue was satisfied by reusing Sprint 46/47 as-is.

---

## 2. Rule-by-Rule Compliance (the brief's 8 numbered requirements)

1. **Journey layer only** — zero new `.tsx`, zero new page/route.
2. **Reuse every existing implementation** — `createReadingIntelligenceExperience()` (Sprint 46) is
   this feature's sole data source, called unmodified.
3. **Never duplicate datasets** — no dataset file touched; `ExerciseSequenceItem[]` is caller-supplied
   to `load()`, never fetched or hardcoded here.
4. **Never duplicate scoring** — `mindScore`/`mindScoreLabel` are direct reads of Sprint 46's
   already-computed values.
5. **Never duplicate streaks** — `streak` is Sprint 46's `DailyStreak`, unchanged.
6. **Never duplicate XP** — `xp` is Sprint 46's `ReadingXp`, unchanged.
7. **Never duplicate journey logic** — `computeJourneyProgress`/`JourneyProgress` is never recomputed,
   only re-read from `experience.journeyState.journey`.
8. **Never create another Reading Runtime** — no engine, no player, no exercise-rendering code
   anywhere in this feature.

---

## 3. Directory Tree (21 files)

```
src/features/reading-intelligence-journey/
  types/
    ReadingExerciseQueueItem.ts        ({ exerciseId, title, href, status: 'completed'|'current'|'locked' })
    ReadingExerciseQueue.ts            ({ items, currentItem, remainingCount })
    ReadingIntelligenceJourney.ts
    ReadingIntelligenceJourneyValidationIssue.ts
    ReadingIntelligenceJourneyValidation.ts
    index.ts
  queue/
    buildReadingExerciseQueue.ts (+ .test.ts)
    index.ts
  journey/
    buildReadingIntelligenceJourney.ts (+ .test.ts)
    index.ts
  validation/
    validateReadingIntelligenceJourney.ts (+ .test.ts)
    index.ts
  orchestration/
    ReadingIntelligenceJourneyOrchestrator.ts
    DefaultReadingIntelligenceJourneyOrchestrator.ts (+ .test.ts)
    index.ts
  testFixtures.ts
  index.ts
```

Collision research: `ReadingIntelligenceJourney`, `ReadingExerciseQueue`, `ReadingExerciseQueueItem`,
`buildReadingIntelligenceJourney`, `buildReadingExerciseQueue`, `ReadingJourneyOrchestrator` — all zero
collisions.

---

## 4. Public Contracts

```ts
// queue/
function buildReadingExerciseQueue(
  sequence: readonly ExerciseSequenceItem[],   // reused type, caller-supplied
  progress: ModuleProgress,                     // reused type, already-fetched
): ReadingExerciseQueue
// Pure — maps each item's status directly from progress.availabilityByExerciseId
// (already computed by getModuleProgress/deriveAvailability); defaults an
// unregistered exercise id to 'locked'. Never re-derives availability itself.

// journey/
function buildReadingIntelligenceJourney(
  experience: ReadingIntelligenceExperienceResult,  // Sprint 46, already-loaded
  queue: ReadingExerciseQueue,
): ReadingIntelligenceJourney

// validation/
function validateReadingIntelligenceJourney(journey: ReadingIntelligenceJourney): ReadingIntelligenceJourneyValidation
// Checks: queue-remaining-count-overflow, mind-score-out-of-range, non-negative-xp,
// progress-count-overflow.

// orchestration/
interface ReadingIntelligenceJourneyOrchestrator {
  load(currentStageSequence: readonly ExerciseSequenceItem[]): Promise<ReadingIntelligenceJourney>
}
class DefaultReadingIntelligenceJourneyOrchestrator implements ReadingIntelligenceJourneyOrchestrator
function createReadingIntelligenceJourneyOrchestrator(overrides?): ReadingIntelligenceJourneyOrchestrator
```

`ReadingIntelligenceJourney` fields, all traced to their source:

| Field | Source |
|---|---|
| `welcomeTitle` | `experience.dailyMission.stageTitle` |
| `missionLabel` | `experience.journeyState.journey.todaysMissionLabel` |
| `continueHref`/`continueLabel` | `experience.dailyMission.continueHref`/`actionLabel` |
| `queue` | **New** — `buildReadingExerciseQueue` output |
| `progress` | `experience.progressSnapshot`, unchanged |
| `streak` | `experience.journeyState.streak`, unchanged |
| `mindScore`/`mindScoreLabel` | `experience.journeyState.mindScore`/`mindScoreLabel`, unchanged |
| `xp` | `experience.xp`, unchanged |
| `nextRecommendationLabel`/`Href` | Next stage in `journey.stages` after the current one (by index), or the continue target if already on the last stage — a new *derivation*, not a new *computation* |

---

## 5. The One Confined Reuse Seam

`orchestration/DefaultReadingIntelligenceJourneyOrchestrator.ts` is the only file importing a real,
non-type value from another `src/features/*` folder — `createReadingIntelligenceExperience` (Sprint
46). Its `load(currentStageSequence)`:

1. Calls `experience.load()` (injectable, Sprint 46's own DI seam — reused transitively, not
   reimplemented).
2. Finds the current stage's `ModuleProgress` from `experienceResult.progressSnapshot.stages`, matched
   by `dailyMission.stageId`. Falls back to a local `EMPTY_MODULE_PROGRESS` constant for the terminal
   "Reading Intelligence™" stage, which — per `journeyProgress.ts`'s own comment — has "no exercises of
   its own" and so has no `ModuleProgress` entry in `progressSnapshot.stages` at all. This is a real,
   expected case (confirmed with a dedicated test), not a defensive-only path.
3. Calls `buildReadingExerciseQueue` then `buildReadingIntelligenceJourney`, both pure.

Every other file in this feature receives already-computed data as plain arguments — confirmed by grep
(§8).

---

## 6. Validation

| Issue type | Checks |
|---|---|
| `queue-remaining-count-overflow` | `remainingCount <= items.length` |
| `mind-score-out-of-range` | `mindScore` within `0–1000` |
| `non-negative-xp` | `xp.totalXp`/`fromCompletedExercises`/`fromStreak` all `>= 0` |
| `progress-count-overflow` | `overallCompletedCount <= overallTotalCount` |

Note: `validateReadingIntelligenceJourney` is a standalone, independently-testable function — the
orchestrator's `load()` does **not** call it internally (matching Sprint 47's precedent for
`validateReadingPlayerSessionSummary`), so a caller decides whether/when to validate.

---

## 7. Test Coverage

**19 tests across 4 test files, all passing.**

| File | Coverage |
|---|---|
| `queue/buildReadingExerciseQueue.test.ts` | Status mapping from `availabilityByExerciseId`, `currentItem` selection (including the no-current-item case), `remainingCount`, unregistered-exercise-id fallback to `locked`, determinism |
| `journey/buildReadingIntelligenceJourney.test.ts` | Every field traced to its real source via `toBe` (identity, not just equality — proves no recomputation), next-recommendation derivation (next-stage case and last-stage fallback case), determinism |
| `validation/validateReadingIntelligenceJourney.test.ts` | One case per issue type, co-occurring issues, valid pass-through |
| `orchestration/DefaultReadingIntelligenceJourneyOrchestrator.test.ts` | Full `load()` happy path via a stub `ReadingIntelligenceExperience` (zero real Supabase calls), the terminal-stage empty-queue case, determinism |

**Deliberately not re-tested**: anything inside `reading-intelligence` itself (`journeyProgress.ts`,
`continueLearning.ts`, `mindScore.ts`, `practiceHistory.ts`, `getModuleProgress.ts`) — already covered
by Sprint 46's own suite; re-testing here would itself be duplication.

---

## 8. Build Verification (exact results, this sprint)

1. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
2. `npx vitest run src/features/reading-intelligence-journey` — **19/19 passing, first attempt.**
3. `npx vitest run` (whole repo) — **466 test files, 3153 tests, all passing** — zero regressions (up
   from Sprint 47's 462/3134: +4 files / +19 tests, exactly this sprint's additions).
4. `npm run build` — **green, first attempt.**
5. Import-confinement check — the only non-type `@/features/reading-intelligence` import
   (`createReadingIntelligenceExperience`) is confined exactly to
   `orchestration/DefaultReadingIntelligenceJourneyOrchestrator.ts`; every other
   `@/features/reading-intelligence` and `@/lib/exercises/*` import anywhere else in the feature is
   `import type` only — confirmed by grep.
6. `git status` — only `src/features/reading-intelligence-journey/` (new) plus this session's docs
   appear as untracked/new. **No existing file was modified.**

---

## 9. Known Limitations

1. **Not wired into any page or route.** `ReadingIntelligenceJourneyOrchestrator` is fully real,
   type-checked, and tested, but nothing calls it outside its own test suite. A future sprint must
   supply a real `currentStageSequence` (e.g. `READING_EXPANSION_MODULE`) and feed the resulting
   `ReadingIntelligenceJourney` into Sprint 47's `PremiumReadingPlayer` props.
2. **`nextRecommendationLabel`/`Href` is a simple "next stage in the array" derivation**, not a
   personalized recommendation engine — it does not consider difficulty, recency, or anything beyond
   array position. Sufficient for this sprint's "reuse, don't invent scoring" mandate; a future sprint
   could layer something smarter on top without touching this function's contract.
3. **`Exercise Queue` only covers the current stage**, not a cross-stage queue spanning the whole
   Reading Lab journey — matches how `getModuleProgress`/sequences are already scoped per-stage
   throughout the existing codebase; no precedent exists for a cross-stage exercise list to reuse or
   extend.
4. **`EMPTY_MODULE_PROGRESS` is a small, local, non-exported constant**, not a reused helper — the
   equivalent `buildEmptyProgress` in `getModuleProgress.ts` is itself unexported, so this was the
   correct, minimal, non-duplicating choice rather than reaching into that file's private internals.

---

## 10. Resume Instructions for Sprint 49

**Nothing has been done for Sprint 49 yet — no brief has been received.** When it arrives:

1. Re-read `docs/ARCHITECTURE_CONSOLIDATION_REPORT.md` and the Sprint 46/47/48 handoffs before doing
   anything else.
2. The natural next step, if asked for, is real page-level integration: a Server Component page that
   calls `createReadingIntelligenceJourneyOrchestrator().load(sequence)`, passes the result into
   `PremiumReadingPlayer`'s props, and supplies a real `renderActiveExperience` mounting
   `UniversalExercisePlayer` (flash/chunk) or `RsvpExperience` (streaming) per Sprint 47's documented
   render-prop contract. That would be the first sprint in this arc to modify or create any `.tsx`
   page/route — confirm explicitly with the user whether that's now in scope before assuming it, exactly
   as this whole arc has done at every prior step.
3. Collision research, self-contained-vs-bridging analysis, and Plan Mode before code — same discipline
   as every sprint in this arc.
4. Verify using the same 6-step sequence (§8) — the whole-repo baseline going into Sprint 49 is
   **466 test files / 3153 tests**, `tsc` clean, build green.
5. Report results and stop — do not begin Sprint 50 without a new, explicit user instruction.

**Nothing else is pending.** The repository is fully clean, fully verified at the Sprint 48 boundary.
