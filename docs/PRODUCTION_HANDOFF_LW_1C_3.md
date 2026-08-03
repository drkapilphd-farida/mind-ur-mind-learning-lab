# Production Handoff — Sprint LW-1C.3: Immersive Onboarding Polish™

## Summary

A pure experience-quality pass across the full onboarding flow (Welcome → Learning Goal → Learning
Method → Upload → AI Thinking). No changes to the Upload Engine, AI Pipeline, Learning Blueprint, Learning
Workspace, business logic, authentication, database, or any existing URL. The two genuinely load-bearing
gaps — a real Immersive Focus Mode™ and a cross-screen journey indicator — required deliberate, low-risk
design decisions, detailed below; everything else was copy, visual, and motion polish on top of already-
working screens.

## Files Modified / Created

**New:**
- `src/components/welcome/OnboardingJourneyIndicator.tsx`

**Modified:**
- `src/components/shell/AppShell.tsx` — Immersive Focus Mode™
- `src/components/learning/SourceTypeCard.tsx` — emoji prop
- `src/components/learning/NewLearningProjectWizard.tsx` — copy, background, header, journey indicator, step fade
- `src/components/welcome/LearningGoalSelector.tsx` — premium cards, auto-advance, journey indicator
- `src/components/welcome/ChooseLearningMethodExperience.tsx` — journey indicator, exit fade, future-feature tiles
- `src/components/learning/ProcessingExperience.tsx` — journey indicator, spacing
- `src/components/welcome/ArrivalExperience.tsx` — journey indicator

## Immersive Focus Mode™ — Implementation

**The real gap.** `/welcome/*` routes already render chrome-free (outside `middleware.ts`'s
`PROTECTED_PATHS`, no shared layout). But `src/app/preview/layout.tsx` unconditionally wraps every
`/preview/*` route in `AppShell` (sidebar + topbar + `UserMenu`), including the Upload wizard
(`/preview/learning-projects/new`) and the AI Thinking screen
(`/preview/learning-projects/[id]/processing`) — the two onboarding screens that live under `/preview`.

**The fix.** `AppShell` (`src/components/shell/AppShell.tsx`) has exactly one call site
(`preview/layout.tsx`, confirmed via grep) and is already a Client Component, so it reads `usePathname()`
directly and branches:

```ts
const IMMERSIVE_ROUTE_PATTERNS = [/^\/preview\/learning-projects\/new$/, /^\/preview\/learning-projects\/[^/]+\/processing$/]
```

A match renders a bare `<div className="min-h-dvh bg-background">{children}</div>` — no sidebar, no
topbar, no `UserMenu`. Every other path renders the existing chrome tree, byte-for-byte unchanged. This
is a single-file, additive change: no route or file was moved, no URL changed, `preview/layout.tsx`'s
auth/profile-fetch logic is untouched, and every other `/preview/*` route (dashboard, labs, settings,
subscription, the Blueprint page, etc.) is provably unaffected since the regex only matches the two named
paths.

**Why the Learning Blueprint page is excluded.** The brief says "restore normal layout only after the
Learning Workspace™ is created" — but Workspace doesn't exist as a real feature yet (still a
`ModulePlaceholder`), so there is no real "Workspace created" moment to hook into today. Extending
immersive mode onto the Blueprint page (`/preview/learning-projects/[id]`, no further segment) would be a
visible behavior change to a page this brief explicitly locks. This scoping decision is deliberate, not an
oversight: the Blueprint page keeps its normal `AppShell` chrome exactly as before.

**Each onboarding screen supplies its own "Logo" / "Living AI Symbol" / "current step"** — the shell itself
injects nothing extra. `NewLearningProjectWizard.tsx` (the one screen that had neither) now has a compact
`<AIPresenceLogo>` + "Quantum Mind™" kicker + journey indicator header, matching every other onboarding
screen.

## Onboarding Journey Indicator™

New `OnboardingJourneyIndicator.tsx` — a fixed 5-waypoint stepper (Welcome → Goal → Learning Method →
AI Thinking → Blueprint, per the brief's own literal PROGRESS example), replacing "generic progress bars."
Small connected dots, current step glowing (reusing the established `#4FE0FF` accent, `aria-current="step"`),
completed steps checked, future steps faint outlines. Labels are `hidden sm:inline` (dots-only on mobile).
Fully `usePrefersReducedMotion`-gated. Used on Welcome, Learning Goal, Learning Method, the Upload wizard
(mapped to the `method` waypoint — Upload is a continuation of the Learning Method the user already chose,
not a separate waypoint in the brief's own 5-item list), and AI Thinking. Not added to the locked Blueprint
page.

## UX / Motion Improvements by Screen

**Knowledge-centric language + emoji (`SourceTypeCard.tsx`, `NewLearningProjectWizard.tsx`).**
`SourceTypeCard`'s `icon: LucideIcon` prop became `emoji: string` (single caller, confirmed safe) — this
corrects a judgment call from the LW-1C.2 sprint that chose Lucide icons "to match convention," which in
hindsight was backwards: emoji is the convention used everywhere else in this onboarding flow. All 5
enabled source-type cards now use the brief's exact emoji + copy (📚 Books & PDFs / 🖼 Notes & Images /
📷 Camera Scan / 📝 Word Documents / 📃 Text Notes), and two real technical-format leaks were fixed —
"DOC, DOCX, Office documents" and "TXT, simple notes" no longer appear in user-facing copy.

**Upload wizard (`NewLearningProjectWizard.tsx`).** Root wrapper now matches every other onboarding
screen's pattern (`relative min-h-dvh overflow-hidden` + `<ArrivalBackground />`) — this was the one
onboarding screen with no Living Background at all before this sprint. Step transitions (`source` →
`name` → `upload`) are wrapped in a `key={step}`-based fade so switching steps cross-fades instead of
instantly swapping content. No change to any validation/extraction/submission logic.

**Learning Goal (`LearningGoalSelector.tsx`).** Cards upgraded to the same premium treatment established
by `SourceTypeCard`/`PrimaryLearningMethodCard` (larger radius, hover lift, soft glow layer). Interaction
changed to match those same cards' "Hover → Lift → Glow → Selection → Continue" sequence exactly: selecting
a goal now holds a brief (280ms) confirmation glow, then auto-navigates — the separate manual "Continue"
button was removed. Non-selected cards disable during the hold to prevent a race between two selections.
Reduced motion skips the hold and navigates immediately. The `?goal=` query-param contract is unchanged.

**Choose Learning Method (`ChooseLearningMethodExperience.tsx`).** Added a local exit-fade
(`isExiting` → 250ms opacity transition → deferred `router.push`) before navigating, matching the pattern
already used by Arrival Experience™ and the AI Thinking screen — this was the one route-changing
onboarding screen that previously navigated with zero transition. Two new, deliberately **secondary**
"Coming Soon" tiles were added below the two real hero cards: "📺 YouTube & Learn" and "🌐 Website & Learn"
(smaller scale, `opacity-70`, non-interactive, real `Badge`).

**Disclosed judgment call — "🎤 Record & Learn" excluded from Future Features.** The brief's own example
list for this section includes "🎤 Record & Learn" alongside YouTube/Website. Record & Learn™ already
shipped as a real, working feature (Sprint LW-1C — genuine `getUserMedia`/`MediaRecorder` capture at
`/welcome/record`), so marking it "Coming Soon" here would be an active regression: hiding or mislabeling
real, working functionality. This sprint deliberately excludes it from the future-badge treatment rather
than silently complying with what appears to be a stale assumption in the brief.

**AI Thinking (`ProcessingExperience.tsx`).** Added the journey indicator; increased the main content
container's gap (`gap-6` → `gap-7`) for "more spacing" around the Living AI Symbol, per the brief's Living
AI Symbol section. `AIPresenceLogo.tsx`'s own animation internals (entrance, glow, breathing rhythm) were
**not** touched further — two prior sprints already tuned them specifically for this exact use case
(idle/thinking modes, orbiting dots), and re-touching a component with 5 call sites for a requirement
already substantially met was judged unnecessary risk.

**Arrival Experience (`ArrivalExperience.tsx`).** Journey indicator added to the existing stage-0 block,
above the Living AI Symbol — the established `stageClass`/`stageStyle` stagger sequence is unchanged.

## Explicit Non-Goals (confirmed unchanged)

No file/route moves, no new route groups, no change to any URL, `middleware.ts`, or `preview/layout.tsx`'s
auth logic. No change to the Learning Blueprint page. No literal cross-route shared-element/View
Transitions API integration — the same disclosed, still-valid non-goal from the prior AI Thinking sprint
(would require touching the locked Blueprint page); local fade-out-before-navigate is used everywhere
instead. No demotion of Record & Learn™. No further changes to `AIPresenceLogo.tsx`'s internals or
`PrimaryLearningMethodCard.tsx`'s prop contract.

## Responsive & Accessibility Validation

- **Responsive**: `OnboardingJourneyIndicator` shows dots-only on mobile (`hidden sm:inline` labels);
  every card grid already used `grid-cols-1 sm:grid-cols-2`, unchanged; the new future-feature tiles use
  `flex-wrap` so they reflow on narrow viewports.
- **Reduced motion**: every new animation (journey indicator's current-step glow, Learning Goal's
  selection hold, the wizard's step cross-fade, Choose Learning Method's exit-fade) is gated by the
  existing `usePrefersReducedMotion` hook, collapsing to static/instant equivalents.
- **Keyboard**: Learning Goal's cards remain real `<button>` elements with `role="group"`/`aria-pressed`;
  non-selected cards get `disabled` (not just visually dimmed) during the selection hold, so keyboard
  users can't trigger a second selection mid-transition.
- **Screen readers**: `OnboardingJourneyIndicator` is a `<nav aria-label="Onboarding progress">` with
  `aria-current="step"` on the active waypoint; decorative dots/lines are otherwise unlabeled structural
  elements, consistent with how this codebase treats purely visual progress indicators elsewhere.
- **Focus states**: all interactive elements are unchanged `<button>`/`Button` components — no custom
  focus handling was introduced.

## Validation Results

1. `npx tsc --noEmit` — clean, zero errors.
2. `npx vitest run` — **472 test files / 3187 tests passed**, identical to the pre-sprint baseline — zero
   regressions (no pure logic changed; only presentation, copy, and interaction timing).
3. `npm run build` — succeeded on the first attempt. `/preview/learning-projects/new` and
   `/preview/learning-projects/[id]/processing` both compiled with the new `AppShell` immersive branch
   active; every other `/preview/*` route (dashboard, labs, settings, subscription, the Blueprint page,
   etc.) compiled unaffected.
4. `npx eslint --fix` then `npx eslint` (no `--fix`) on all 8 changed/new files — clean, zero warnings or
   errors.
5. `git status`/`git diff --stat` scope check — confirmed nothing under `useProcessingPipeline.ts`,
   `mockProcessingRunner.ts`, `processingStages.ts`, `LivingBrainLogo.tsx`, `preview/layout.tsx`, the
   Learning Blueprint page, Workspace, or `middleware.ts` (already modified before this sprint began, not
   touched by it) appears in this sprint's diff.
6. Manual reasoning-level check (no browser available in this environment, disclosed as before): the two
   onboarding routes render with zero sidebar/topbar; every other `/preview/*` route is unaffected; the
   journey indicator shows the correct current waypoint on each of the 5 screens it appears on; Learning
   Goal's cards auto-advance after the glow-hold with no separate Continue button; the wizard's step
   transitions cross-fade; Record & Learn's card is unaffected (still real, still enabled); the 2 new
   future-feature tiles are visually smaller/secondary and non-interactive.

## Stop

Per the brief's explicit instruction, no further sprint (LW-1D or otherwise) begins without new, explicit
authorization. Note: LW-1D ("AI Processing/AI Thinking Experience™") already shipped twice under this
arc's numbering in prior sessions — this sprint does not repeat or extend that work beyond the journey
indicator and spacing changes documented above.
