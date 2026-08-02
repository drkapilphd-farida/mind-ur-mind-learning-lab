# Production Handoff — Sprint LW-1A (Arrival Experience™ + Learning Goal™)

**Generated:** 2026-07-14
**Purpose:** Allow a new Claude Code session to continue LW-1B/LW-1C onward with zero context loss.
**Scope of this document:** This revises and replaces the *previous* LW-1A handoff (same filename,
overwritten — the prior version described a single screen, "Welcome Experience™," at `/welcome`). This
version covers the expanded, renamed scope: "Arrival Experience™" (Screen 1) plus a new "Learning Goal™"
(Screen 2), and a new LW-1C hook.

---

## 1. What This Sprint Is

The brief renamed the product concept "Welcome Experience™" → **"Arrival Experience™,"** stripped Screen 1
down further (no illustration, no daily insight, no "Continue your last learning" card — an exhaustive
"show nothing else" list), and added a **new Screen 2, "Learning Goal™,"** with a hard flow rule: the
Screen 1 CTA no longer goes to Upload at all — it goes to Learning Goal, which itself must stop short of
Upload too ("that belongs to LW-1C").

### What was reused, not rebuilt (per "Refactor the experience. Not the engine.")

- The real Supabase in-page auth-check pattern (`getUser()` → `redirect('/login?next=...')`), reused
  identically across all three `/welcome/*` routes.
- `listLearningProjects`/`getCurrentUserProfile` (both real, unchanged).
- The `/welcome` route's standalone-outside-`/preview` placement — still correct this sprint;
  `src/app/preview/layout.tsx` still unconditionally wraps everything in `AppShell`, still incompatible
  with "no complex navigation."
- `TYPOGRAPHY` design tokens, the `usePrefersReducedMotion` staged-entrance motion convention, and the
  `role="group"` + `aria-pressed` single-select button pattern (confirmed established in 10+ files
  elsewhere in this codebase, e.g. `ImagePersistenceReflectionScreen.tsx`, `ChoiceGrid.tsx`) — reused for
  the new Learning Goal cards rather than inventing a new selection pattern.
- The existing `ModulePlaceholder` component (`src/components/shell/ModulePlaceholder.tsx`) — confirmed to
  have zero dependency on `AppShell` — reused directly for the new LW-1C stub, the exact same "real route,
  real auth, no business logic yet, swap out later" pattern this codebase already established for the
  whole `/preview/*` Sprint-0 arc.

### Two disclosed judgment calls

1. **`WelcomeHeroIllustration.tsx` was deleted, not left unused.** Confirmed zero other importers before
   deletion. The new Screen 1 spec has no illustration requirement at all this round (the "hero area" is
   gone; the background instead grew a "minimal floating particles" requirement, a different, lighter
   treatment). The brief's "don't throw away production-quality work" is explicitly scoped to a named
   engine list (Upload/AI Processing/Blueprint/Workspace/Dashboard/Upload Flow) — a decorative component
   from last sprint isn't in that category, and leaving genuinely dead, zero-importer decorative code
   around is clutter, not reuse.
2. **`getDailyInsight`/`DAILY_INSIGHTS` were kept, unused for now.** Different reasoning: small, pure,
   already explicitly documented as a future AI-generation swap point, genuinely reusable (e.g. by a
   future Dashboard or Learning Workspace), not decorative markup. Deleting and potentially re-adding
   later would be pure churn for no benefit.

### Copy decision, flagged for explicit review

The brief gives one specific, quoted, multi-line copy block for returning users and separately asks for a
dynamic time-of-day greeting, with no first-time copy this round. Rather than collapsing these into one
line (as the previous LW-1A did), **this version keeps both, stacked**: a small time-of-day line ("Good
morning."), then the brief's literal block as the heading + subtitle ("Welcome back, {Name}. 👋" /
"Whatever you're trying to learn today... We'll help you understand it faster, remember it longer, and
revise it smarter."). These read as different registers, not redundant, and the brief's block reads as
prescriptive, sign-off-able copy for the single highest-stakes screen this sprint. First-time-user copy
(not specified by the brief) swaps only the name-specific opening line to "Welcome to Mind Ur Mind. 👋"
and keeps the rest identical — this substitution is this plan's own addition, not literal brief text.

---

## 2. What Stayed Untouched

- `src/app/preview/**`, `middleware.ts`, `PROTECTED_PATHS` — no changes.
- Every Server Action, every Supabase table/migration — no changes, no database writes anywhere in this
  sprint's new code.
- AI Processing, Learning Blueprint, and Learning Workspace surfaces — untouched.
- `/preview/learning-projects/new` (the real Upload Experience) — completely unaffected; no shared code
  was touched, and nothing in the new arrival flow reaches it this sprint (a deliberate, brief-mandated
  change from the previous LW-1A, whose CTA *did* link there).

---

## 3. Work Completed

### `src/app/welcome/page.tsx` (rewritten in place — Screen 1's route, unchanged URL)
Same auth pattern and data fetch as before; stopped computing/passing `continueProject` and
`dailyInsight` (screen no longer shows either). Renders `<ArrivalExperience firstName isReturningUser />`.

### `src/components/welcome/ArrivalExperience.tsx` (new — renamed from, and replaces, `WelcomeExperience.tsx`)
Rewritten content: brand kicker → time-of-day greeting line → the brief's literal returning/first-time
copy block → caption ("Your personal AI Learning Mentor is ready.") → single CTA ("Let's Begin →", now
links to `/welcome/learning-goal`, not Upload). Same staged-entrance motion convention as before
(`animate-in fade-in slide-in-from-bottom-2`, 180ms stagger, `usePrefersReducedMotion`-gated). Renders the
new shared `<ArrivalBackground />` instead of inline gradient markup.

### `src/components/welcome/ArrivalBackground.tsx` (new, shared by both screens)
Extracted so Screen 2 doesn't duplicate the background. Gradient wash + one drifting blurred blob
(keyframe renamed `welcome-ambient-drift` → `arrival-ambient-drift` for naming consistency with the
renamed concept) plus 5 small, low-opacity floating-particle dots (new `arrival-particle-float` keyframe,
`transform`/`opacity` only, GPU-cheap) for the brief's new "minimal floating particles" requirement. Fully
`usePrefersReducedMotion`-gated, `aria-hidden`.

### `src/app/welcome/learning-goal/page.tsx` (new — Screen 2's route)
Same in-page auth pattern repeated (confirmed load-bearing: `/welcome/*` has no shared `layout.tsx` and is
outside `PROTECTED_PATHS`, so each page must prove auth itself — the same established codebase convention
of repeating this check even where a shared layout exists, e.g.
`preview/learning-projects/new/page.tsx` under `preview/layout.tsx`). Renders `<LearningGoalSelector />`.

### `src/components/welcome/LearningGoalSelector.tsx` (new, client)
"What brings you here today?" + subtitle, a 6-card single-select grid (real `<button>`s,
`role="group"` + `aria-pressed`, literal emoji per the brief's exact spec: 📚💼🧠⚡📄✍️), local
`useState<LearningGoalId | null>`. "Continue →" disabled until a selection is made; on click, navigates to
`/welcome/preparing?goal=<id>` — URL state only, no database write.

### `src/constants/learning/learningGoals.ts` (new) + `constants/learning/index.ts` (additive re-export)
`LearningGoalId` union + `LEARNING_GOALS: readonly LearningGoalDefinition[]` (`{id, emoji, label}`),
following `studyModes.ts`'s exact existing pattern. Note: `LearningGoal` as a *term* already exists
elsewhere in this codebase — `src/features/ai-intelligence-layer/types/UserContext.ts`'s free-text
`learningGoal: string | null`, and `adaptive-learning-planner`'s `LearningGoalAnalyzer` — unrelated
(different layer, free text vs. this fixed 6-option enum), no type collision, but a natural future
LW-1C/D hook: the selected `LearningGoalId` here could eventually feed that existing field.

### `src/app/welcome/preparing/page.tsx` (new — the LW-1C hook)
Same auth pattern again. Reads `?goal=`, validates it against `LEARNING_GOALS` server-side (falls back to
a generic "your learning goal" label if missing/invalid — never echoes unvalidated query-param text
directly into rendered copy). Renders the existing `ModulePlaceholder` with copy explaining this is where
Upload Anything™ begins, arriving in LW-1C.

### `src/app/globals.css`
`welcome-ambient-drift` renamed to `arrival-ambient-drift`; new `arrival-particle-float` keyframe added.
Both purely part of this sprint's own prior/new keyframes — no other existing keyframe touched.

### Deletions
- `src/components/welcome/WelcomeHeroIllustration.tsx`
- `src/components/welcome/WelcomeExperience.tsx` (superseded by `ArrivalExperience.tsx`)

Confirmed via `grep` before deleting: no test anywhere referenced either by name.

---

## 4. Files Changed / Added / Deleted

```
NEW    src/components/welcome/ArrivalExperience.tsx
NEW    src/components/welcome/ArrivalBackground.tsx
NEW    src/app/welcome/learning-goal/page.tsx
NEW    src/components/welcome/LearningGoalSelector.tsx
NEW    src/constants/learning/learningGoals.ts
NEW    src/app/welcome/preparing/page.tsx
NEW    docs/PRODUCTION_HANDOFF_LW_1A.md (this file, overwritten)
MOD    src/app/welcome/page.tsx
MOD    src/constants/learning/index.ts        (additive: +1 re-export line)
MOD    src/app/globals.css                    (rename 1 keyframe, +1 new keyframe)
DEL    src/components/welcome/WelcomeHeroIllustration.tsx
DEL    src/components/welcome/WelcomeExperience.tsx
```

Unchanged from last sprint, still present, still unused this sprint: `src/constants/learning/dailyInsights.ts`,
`getDailyInsight` in `src/services/learning/index.ts` and its re-export in `src/api/learning/index.ts`.

---

## 5. Validation (exact results, this sprint)

1. `grep -rn "WelcomeExperience\|WelcomeHeroIllustration" src --include="*.test.*"` — **zero matches**,
   confirmed safe to delete before doing so.
2. `npx tsc --noEmit` — **clean, whole repo, first attempt.**
3. `npx eslint` on all 8 new/changed files — **zero findings.**
4. `npx vitest run` (whole repo) — **470 test files, 3169 tests, all passing** — identical count to before
   this sprint (no test previously covered the deleted files, and this sprint is UI-only with no new pure
   logic to unit-test).
5. `npm run build` — **green, first attempt**; `/welcome`, `/welcome/learning-goal`, and
   `/welcome/preparing` all present in the route table with no errors.
6. `git status`/`git diff --stat` — the tracked `M` list is unchanged from before this sprint; all new/
   changed content lives in brand-new or already-untracked paths (`src/app/welcome/`,
   `src/components/welcome/`, `src/constants/learning/`).

---

## 6. Known Limitations

1. **No browser was available to visually preview any of the three screens** in this environment (no
   browser-automation tool, same disclosed limitation as last sprint). Verified instead via a clean
   production build, `tsc`/`eslint` correctness, and careful reasoning about layout/contrast/motion
   against this app's existing design tokens. A manual visual pass is recommended before real users see
   this flow.
2. **A 5th duplicate of the time-of-day-greeting logic still exists**, now in `ArrivalExperience.tsx`
   (was in `WelcomeExperience.tsx` before the rename) — not consolidated with the 4 other existing
   implementations, for the same reason disclosed last sprint: touching several unrelated, already-working
   screens is out of this sprint's scope.
3. **The Learning Goal selection is not persisted anywhere** — by explicit brief instruction ("no
   database changes," "no business logic changes"). It exists only as a URL query param between Screen 2
   and the `preparing` stub. LW-1C must decide where (if anywhere) this should actually be stored.
4. **Accessibility validated by reasoning, not an automated audit** (no axe-core or equivalent exists in
   this repo, consistent with every prior sprint's disclosed limitation on this point): single `h1` per
   screen, decorative background `aria-hidden`, real focusable buttons/links throughout, full
   `usePrefersReducedMotion` gating on top of the existing blanket reduced-motion CSS safety net, the
   established `role="group"`/`aria-pressed` pattern for the goal cards, colors drawn from already-in-
   production design tokens.
5. **`/welcome` is still not the true post-login entry point** — reachable only by direct URL, same as
   last sprint. Unchanged status, still an explicit LW-1B decision.

---

## 7. Hooks Prepared for LW-1B and LW-1C

**LW-1B** (unchanged from the previous handoff):
- Wiring `/welcome` as the actual post-login default (today `/preview/dashboard` still is;
  `middleware.ts`/`PROTECTED_PATHS` untouched this sprint).
- Building the real Learning Workspace at `/preview/workspace` (still a bare `ModulePlaceholder`).
- Consolidating the now-5 duplicated time-of-day-greeting implementations.

**LW-1C** (new this sprint):
- `src/app/welcome/preparing/page.tsx` is the swap point: replace its `ModulePlaceholder` render with
  the real Upload Anything™ flow (or a redirect into `/preview/learning-projects/new`), reading the
  already-validated `?goal=` param.
- Decide whether/how the selected `LearningGoalId` should be persisted — a natural fit is
  `src/features/ai-intelligence-layer/types/UserContext.ts`'s existing `learningGoal: string | null`
  field, or a new column on `learning_projects` if goal should be scoped per-project rather than
  per-user-session.
- `getDailyInsight`/`DAILY_INSIGHTS` remain available, unused, for whichever future screen wants them
  (Dashboard, Learning Workspace, or elsewhere).

---

## 8. Resume Instructions for LW-1B / LW-1C

**Nothing has been done for LW-1B or LW-1C yet — no brief has been received, and per this sprint's explicit
instruction, neither must begin without new review and approval.** When one arrives:

1. Read this document first, especially §7 (hooks) before assuming anything about what already exists.
2. If it's LW-1C (wiring real Upload into `/welcome/preparing`): read `src/app/preview/learning-projects/new/page.tsx`
   and `NewLearningProjectWizard.tsx` first — that's the real, reusable Upload Experience this hook points at.
3. If it's LW-1B (entry-flow routing): treat any `middleware.ts`/`PROTECTED_PATHS` change with the same
   scrutiny as any other routing change — confirm scope explicitly with the user first.
4. Verify using the same sequence as this sprint (§5) — the whole-repo baseline going forward is
   **470 test files / 3169 tests**, `tsc` clean, `eslint` clean, build green.
5. Report results and stop — do not begin further work without a new, explicit user instruction.

**Nothing else is pending. Stop after this sprint, per the brief's own instruction.**
