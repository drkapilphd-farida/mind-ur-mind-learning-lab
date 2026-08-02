# Architecture Consolidation Report — Reading Journey / Progress / Gamification Systems

**Generated:** 2026-07-14
**Purpose:** Document every duplicate implementation discovered while researching Production Sprint
46 ("Reading Intelligence Lab™ Experience Layer"), before any Sprint 46 code is written. This report
covers findings only — it makes no code changes and proposes no Sprint 46 implementation.
**Status:** Awaiting approval. No architectural decision has been made yet.

---

## 1. Executive Summary

Researching Sprint 46 surfaced six real instances of duplicated or fragmented logic in the live,
production Reading/Visual Intelligence experience layer — none of it part of the separate, mock
"Real AI Integration™" arc (Sprints 23–45). Two are genuine algorithm duplication; one is a
deliberate, self-documented copy-paste pattern repeated three times; two are same-named
components/functions with incompatible shapes; one is a naming collision between Sprint 46 itself and
an already-shipped page. None of this was introduced by this session — all of it predates this
conversation and was found by reading the existing, uncommitted working tree.

**Bottom line:** most of what Sprint 46 needs (Reading Journey, Progress Tracking, Continue Learning,
Completion Experience, Navigation Contracts, Session Flow) has exactly **one** canonical, non-duplicated
implementation already and is safe to reuse today. The duplication that exists is concentrated in three
narrower areas — streak computation, the "Daily Mission" card, and the word "Reading Intelligence"
itself — and none of it requires a full consolidation sprint to resolve. See §6.

---

## 2. Every Duplicate Implementation Found

### 2.1 Streak computation — 1 canonical algorithm, copy-pasted 3 times, plus 1 divergent-data-source case

| # | File | Relationship to canonical |
|---|---|---|
| 1 | `src/lib/exercises/practiceHistory.ts` → `computeDailyStreak()` | **Canonical.** Operates on `PracticeSessionRecord[]` (the shared `practice_sessions` table, any Lab registered in `LabId`). Powers the main dashboard's `DailyMomentumCard`/`TransformationJourneyCard`. |
| 2 | `src/features/visual-intelligence/fixation/fixationStreak.ts` → `computeFixationStreak()` | **Verbatim copy** of the same day-gap-reset algorithm. Own comment: *"Mirrors computeDailyStreak's exact day-gap-reset algorithm... a small local copy, not a direct import, since that function is typed against PracticeSessionRecord/LabId, which this lab intentionally doesn't register in."* |
| 3 | `src/features/visual-intelligence/persistence-challenge/persistenceStreak.ts` → `computePersistenceStreak()` | **Verbatim copy**, same reasoning, same comment pattern, references fixationStreak.ts as precedent. |
| 4 | `src/features/tratak-intelligence/tratakStreak.ts` → `computeTratakStreak()` | **Verbatim copy** again — its own comment says it mirrors `computeFixationStreak`, not even the original, i.e. a copy of a copy. |
| 5 | `src/features/quantum-speed-reading/adaptive-intelligence/readingProfileEngine.ts` → `computeReadingProfile()` | **Not a duplicate algorithm** — this one correctly calls the canonical `computeDailyStreak()` (imports it directly). The divergence here is a **data-scope** issue, not a logic issue: it feeds `computeDailyStreak` only `reading_intelligence_sessions` rows (passages with recorded wpm/accuracy/comprehension), while `practiceHistory.ts`'s dashboard streak is computed from **all** `practice_sessions` across all four Reading Lab stages (Visual Activation, Reading Preparation, Flash Intelligence Pack, Core Reading Journey). **A Reading Lab user can see two different streak numbers today** — one on `/dashboard`, a different one on `/labs/quantum-speed-reading/intelligence` — because the two features are honestly answering two different questions ("have you practiced anything" vs. "have you completed a reading-intelligence passage"), not because anyone made a mistake. |

### 2.2 `computeJourneyProgress` — same name, two incompatible functions

| File | Signature | Scope |
|---|---|---|
| `src/lib/exercises/journeyProgress.ts` | `computeJourneyProgress(exerciseStages: JourneyExerciseStage[], terminalStage: JourneyTerminalStage): JourneyProgress` | Reading Lab's 5-stage cross-module journey (Visual Activation → Reading Preparation → Flash Intelligence Pack → Core Reading Journey → **Reading Intelligence**). Live, powers `/labs/quantum-speed-reading`. |
| `src/features/visual-intelligence/dashboard/journeyProgressEngine.ts` | `computeJourneyProgress(context: DnaContext, hasMindPassportSnapshot: boolean): readonly DashboardJourneyStage[]` | Visual Intelligence Lab's own 9-stage list. Live, powers `/labs/visual-intelligence/dashboard`. |

Not accidental collision-by-copy — these were built independently, sprint-numbered "Sprint-9" (visual
intelligence) vs. "Sprint-12F" (reading), for genuinely different Labs, and neither imports the other.
The risk isn't that either is wrong; it's that a third `computeJourneyProgress` (e.g. inside
`reading-intelligence`) would make the collision three-way and strictly worse.

### 2.3 `TodaysMissionCard` — same component name, two incompatible prop shapes

| File | Props | Consumer |
|---|---|---|
| `src/components/dashboard/TodaysMissionCard.tsx` | `{ exercises: MissionExercise[]; actionHref; actionLabel; isAllDone; mindScoreGoal? }` | Main dashboard (`app/(dashboard)/dashboard/page.tsx`) |
| `src/features/visual-intelligence/components/dashboard/TodaysMissionCard.tsx` | `{ mission: DashboardMission }` (from `todaysMissionEngine.ts`, has `estimatedXp`/`estimatedBrainGain` fields) | Visual Intelligence Lab's own dashboard |

Confirms a real, live vocabulary split: the Visual Intelligence surface already says **"Estimated XP"**
literally in its UI; the Reading Lab surface uses **"Mind Score"** throughout and has no XP concept.
These are not the same feature reused with different data — they're two independently-designed reward
vocabularies for two different Labs.

### 2.4 "Reading Intelligence" naming collision — Sprint 46 vs. an already-shipped page

`src/lib/exercises/journeyProgress.ts` already constructs its own journey's terminal stage as:
```ts
{ id: 'reading-intelligence', title: 'Reading Intelligence™', href: '/labs/quantum-speed-reading/intelligence' }
```
That route is fully built (`src/app/labs/quantum-speed-reading/intelligence/{page,goals,history,achievements,analytics}.tsx`),
gated behind Core Reading Journey™ completion, backed by its own 23-file engine
(`src/features/quantum-speed-reading/adaptive-intelligence/`) covering Reading Profile, Reading DNA™,
Personal Bests, AI Coach, Goals, Achievements, Analytics — built in a prior "Sprint 4 — Adaptive
Intelligence Engine™." Sprint 46 is titled "**Reading Intelligence** Lab™ Experience Layer." This is
the single largest open question in this whole report — see §6.

### 2.5 `JourneyState` — a second, unwired, generic type parallel to the live one

`src/types/intelligence/index.ts` defines a formally-named `JourneyState` type
(`{ stage, momentumPercent, consistencyPercent, currentStreak, bestStreak }`), computed by
`calculateJourneyState()` in `src/lib/intelligence/engine.ts`, part of a larger, explicitly cross-Lab-
intended "Intelligence Engine Foundation" (`src/lib/intelligence/`, `src/hooks/intelligence/`,
`src/components/intelligence/`). **Zero files under `src/app/` or `src/features/` import any of it** —
confirmed via grep. It is not a duplicate in the sense of "two things computing the same live value"
(only `journeyProgress.ts`'s `JourneyProgress`/`JourneyStageView` is actually live) — it's dead,
parallel scaffolding that pre-dates and was never reconciled with the shape that shipped.

### 2.6 XP vs. Mind Score — two live reward vocabularies, never unified

Not a code duplication (no two functions compute the same thing) but a **product-vocabulary**
duplication: `src/lib/exercises/mindScore.ts` (`computeMindScore`, 0–1000 scale, "Mind Score" label) is
what the Reading Lab and main dashboard use everywhere. A separate, flat "Brain XP" model
(`computeFlashXp`, `computeTratakXp`, `IMAGE_PERSISTENCE_XP`/`FIXATION_XP`/`PERSISTENCE_CHALLENGE_XP`
constants, `DashboardMission.estimatedXp`) is used by Flash Intelligence and Visual
Intelligence/Tratak. Both are real, both are live, neither Lab knows about the other's vocabulary.

---

## 3. Why Each Duplicate Exists

All six are the same root cause wearing different clothes: **each Lab (Reading, Visual Intelligence,
Tratak) was built as its own semi-independent vertical slice, sprint by sprint, without a shared
cross-Lab primitives layer existing yet at the time.** The evidence for this is in the code's own
comments, not inference:

- `fixationStreak.ts`, `persistenceStreak.ts`, and `tratakStreak.ts` **all explicitly say** they copied
  the canonical algorithm rather than importing it, because `computeDailyStreak`'s signature is coupled
  to `PracticeSessionRecord`/`LabId` (the `practice_sessions` table + the fixed `LabId` enum), and each
  of these three features intentionally persists to its **own**, separate table
  (`fixation_sessions`, `image_persistence_sessions`/persistence tables, `tratak_mission_sessions`) that
  was never registered as a `LabId`. This was a **reasonable, deliberate per-sprint decision at the
  time** — reusing the function would have required either widening `LabId` or reshaping the table —
  not a mistake. The debt is that nobody has since gone back to extract the truly generic part (the
  pure day-gap-reset algorithm needs only `{ occurredAt, completed }[]`, nothing table-specific).
- The two `computeJourneyProgress` functions and two `TodaysMissionCard` components exist because
  Visual Intelligence Lab was built as its own product surface with its own dashboard (Sprint 9),
  mirroring the Reading Lab's already-established UX pattern (journey timeline + mission card) without
  sharing the underlying code — again a per-sprint, per-Lab scoping choice, not an oversight; at the
  time each was built, there may have been no obvious common abstraction that fit both Labs' actual
  data shapes (Visual Intelligence's journey stages are hardcoded/context-derived; Reading's are
  computed from real `ContinueLearningSummary` objects).
- The `JourneyState`/Intelligence Engine Foundation duplication exists because it was **built ahead of
  adoption** — its own header comment states every Lab "must describe itself using these types," i.e.
  it was designed as the intended long-term shared foundation, but no Lab (including Reading, which
  already had its own working `mindScore.ts`/`practiceHistory.ts`/`journeyProgress.ts` by then) has
  been migrated onto it. This is forward-built scaffolding that lost the race to the per-Lab code it
  was meant to replace.
- XP vs. Mind Score exists because Reading Lab and Flash/Visual-Intelligence-adjacent Labs picked
  different reward vocabularies independently, likely at different points in the roadmap, with no
  shared "scoring/reward" module either was building against.
- The "Reading Intelligence" naming collision exists because Sprint 46's brief was almost certainly
  written without visibility into the already-shipped `/labs/quantum-speed-reading/intelligence` page
  — the brief describes a new *experience layer*, and the existing page's name happens to already
  occupy very similar territory.

None of this is unusual for a fast-moving, Lab-by-Lab product build. It is, however, exactly the kind
of debt that compounds if a *seventh* implementation (Sprint 46's) gets added without a decision.

---

## 4. Recommended Canonical Implementation Per Duplicate

| Duplicate | Recommended canonical | Rationale |
|---|---|---|
| Streak algorithm | `computeDailyStreak()` (`practiceHistory.ts`) | Already the most general (works over any `{occurredAt, completed}[]`-shaped input once de-coupled from `PracticeSessionRecord`), already correctly reused by `readingProfileEngine.ts`, already dashboard-canonical. |
| Reading Lab's *dashboard-level* streak vs. *Reading-Intelligence-hub* streak (data-scope divergence) | Keep both, but name them for what they honestly measure — **do not silently merge them**, since "practiced anything today" and "completed a graded reading-intelligence passage" are genuinely different facts a user might want to see separately. Sprint 46 needs to pick one explicitly for any new UI it builds — see §6. |
| `computeJourneyProgress` | `src/lib/exercises/journeyProgress.ts`'s version, for anything Reading-Lab-scoped (which is all Sprint 46 needs) | It's the one that operates on real `ContinueLearningSummary` data rather than ad hoc context flags — more faithful to "journey" as a concept or reuse elsewhere. The Visual Intelligence one stays exactly where it is; not this report's concern to touch. |
| `TodaysMissionCard` | `src/components/dashboard/TodaysMissionCard.tsx`, for Reading Lab | Already consumes Reading Lab's own `MissionExercise[]`/Mind Score data shape. |
| `JourneyState` / Intelligence Engine Foundation | **Not canonical for Reading Lab today** — it has zero live callers and Reading Lab's own working system already covers the same ground. Adopting it now would be a net-new integration project, not "using the canonical implementation." | See §6 for whether this should change. |
| XP vs. Mind Score | **Mind Score**, for anything Reading-Lab-scoped | It's what's actually live and branded across the Reading Lab and main dashboard today; "Reading Intelligence" (the existing page) is already Mind-Score-flavored, not XP-flavored. |

---

## 5. What Should Eventually Be Removed

**Nothing needs to be removed to unblock Sprint 46** — none of these duplicates are inside the Reading
Lab's own reuse surface in a way that blocks a thin, Reading-Lab-scoped orchestration layer. For a
*future*, separate cross-Lab consolidation sprint, in priority order:

1. **`fixationStreak.ts` / `persistenceStreak.ts` / `tratakStreak.ts`** — extract the shared pure
   algorithm (already byte-for-byte identical three times) into one generic function taking
   `{ occurredAt: string; completed: boolean }[]`, no `LabId`/`PracticeSessionRecord` coupling. Each
   Lab-specific file becomes a thin type-relabeling wrapper around it, or is deleted outright in favor
   of direct calls. Lowest-risk item on this list — pure functions, already covered by tests, zero UI
   change.
2. **`JourneyState` / `src/lib/intelligence/` Foundation** — either commit to migrating every Lab onto
   it (a real project) or delete it as superseded-before-use scaffolding. Leaving it in place
   indefinitely as unreferenced code is itself a maintenance cost (a future engineer will find it via
   grep and reasonably assume it's the intended integration point, as this report's own research
   initially did).
3. **`computeJourneyProgress` ×2 / `TodaysMissionCard` ×2** — lowest priority; both pairs already serve
   genuinely different Labs with different data. Only worth unifying if a future sprint explicitly
   wants one shared cross-Lab "journey"/"mission" component library — not needed for Sprint 46.
4. **XP vs. Mind Score** — a product/branding decision, not a code cleanup; only "removable" once
   someone decides the platform should have one reward vocabulary, not two.

---

## 6. Sprint 46 — Reuse Now, or Consolidation Sprint First?

**Recommendation: Sprint 46 can proceed without a dedicated consolidation sprint first**, on the
condition that three specific, small decisions are made explicitly before any plan is written — these
are product/naming decisions, not engineering migration work, and none of them require touching
existing files:

1. **Resolve the "Reading Intelligence" naming collision (§2.4).** This is the one genuine blocker.
   Options: (a) Sprint 46's Experience Layer becomes the orchestration layer *behind* the existing
   `/labs/quantum-speed-reading/intelligence` page (extends/reuses it), (b) Sprint 46 is renamed to
   avoid the collision and sits alongside the existing page as a distinct concept, (c) something else.
   I have no basis to guess which — this needs your decision.
2. **Pick which streak Sprint 46's new UI shows (§2.1, item 5).** Dashboard-wide practice streak, or
   Reading-Intelligence-hub-specific streak, or both, clearly labeled. Reusing either existing function
   is fine; silently inventing a third is the only wrong answer.
3. **Confirm Mind Score (not XP) as Reading Lab's vocabulary (§2.6)**, unless there's a product reason
   to introduce XP for Reading Lab specifically — in which case that's a new, additive concept to scope
   explicitly, not a silent duplicate of Mind Score.

None of the cross-Lab duplication (streak triplication outside Reading Lab, the two
`computeJourneyProgress`/`TodaysMissionCard` pairs, the unused Intelligence Engine Foundation) blocks
Sprint 46 and none of it should be touched by Sprint 46 — it's real technical debt, but it belongs to a
separate, explicitly-scoped future consolidation sprint, not bundled into "begin the Reading Lab
Experience Layer."

**Waiting for your decision on the three items above before producing an implementation plan.**
