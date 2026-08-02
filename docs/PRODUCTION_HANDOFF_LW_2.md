# Production Handoff — Sprint LW-2: Quantum Speed Reading™

## Summary

The brief's own "FIRST TASK" — review and reuse the existing implementation before writing code —
surfaced a genuine blocker that had to be resolved before any design work: **no uploaded document's real
text exists anywhere in this system** (confirmed by reading the `documents` migration and
`documentTextExtraction.ts`'s own disclosure — extraction happens client-side for validation only and is
discarded, never persisted). Confirmed with the user: the reading passage is generated deterministically
from the same mock `LearningBlueprint` already shown on the Blueprint page, not the user's real file
content — consistent with this entire arc's disclosed mock-content approach since Sprint 1.

A second finding shaped the architecture: a genuinely well-built continuous-reading component already
exists (`ReadingExperience.tsx`/`ReadingPassageView.tsx`), but it's deeply wired into the separate, large,
already-shipped `/labs/quantum-speed-reading/*` product (passage library, adaptive intelligence, AI reading
coach, quiz/reports — confirmed via grep across ~20 files). This sprint builds **new, parallel components**
informed by that component's real design patterns (typography, adaptive width, focus mode, controls) but
sharing no code with it — zero risk to that separate, live product.

## Files Modified / Created

**New:**
- `src/types/learning/reading.ts` — `ReadingSection`/`ReadingPassage` types
- `src/lib/blueprint/seededMock.ts` — `seedFrom`/`numberInRange` extracted for reuse (see below)
- `src/lib/reading/generateReadingPassage.ts` (+ `.test.ts`) — the mock passage generator
- `src/hooks/learning/useReadingMicroBreakPrompt.ts` (+ `.test.ts`) — Micro Breaks™ architecture
- `src/components/learning/reading/` — `ReadingExperienceShell.tsx`, `ReadingPassageContent.tsx`,
  `ReadingControlsBar.tsx`, `ReadingProgressIndicator.tsx`, `ReadingInsightCallout.tsx`,
  `InlineAIAssistPopover.tsx`, `ReadingSessionComplete.tsx`

**Modified:**
- `src/app/preview/learning-studio/quantum-speed-reading/page.tsx` — real page, replacing `ModulePlaceholder`
- `src/lib/blueprint/generateLearningBlueprint.ts` — now imports `seedFrom`/`numberInRange` instead of
  defining private duplicates (byte-identical output — same seed algorithm, just relocated)
- `src/constants/learning/learningModes.ts` — new `resolveLearningModeHref()` helper
- `src/components/learning/AIRecommendationHero.tsx`, `LearningBlueprintExperience.tsx` — pass `?project=`
  for the Quantum Speed Reading link specifically
- `src/components/shell/AppShell.tsx` — Focus Mode extended to this route
- `src/lib/analytics/track.ts` — 2 new event names (`reading_session_started`/`_completed`)

## Reading Architecture

**Content generation.** `generateReadingPassage(blueprint, documentTitle)` is pure and deterministic (same
seed-from-document-id pattern as `generateLearningBlueprint.ts` — the two now share `seedFrom`/
`numberInRange` via the new `seededMock.ts`, removing a near-duplicate private implementation rather than
copying it a second time). One `ReadingSection` per existing blueprint chapter (chapter count/order
untouched), each with 3 short paragraphs woven from that document's own real (mock) concept titles/
descriptions/topics — never a separately-invented corpus, never claimed to be the file's real text. Doc
comments disclose this plainly, matching every other generator in this arc.

**Routing.** `/preview/learning-studio/quantum-speed-reading` had no dynamic segment (one of 6 flat
`LEARNING_STUDIO_MODULES` stubs). Rather than restructure the route, the Learning Project id travels
forward as `?project={id}` — the same lightweight, no-database-write pattern already used for `?goal=`
elsewhere in this arc. `resolveLearningModeHref()` appends this only for the `quantum-speed-reading` mode;
the other 8 modes' links are unchanged. Missing/invalid `?project=`, or a project whose document isn't
`ready`, shows an honest `EmptyStateCard` — never a crash, never a fabricated session.

**Reader components — new, not shared with the Labs product.** `ReadingExperienceShell.tsx` orchestrates:
current section (via `IntersectionObserver`, real scroll position — never a fake auto-advancing timer),
font scale, reading width, theme, focus mode, bookmark, elapsed timer, text selection, and completion
state. `ReadingPassageContent.tsx` renders real typography with 3 adaptive-width presets
(`max-w-[52ch|68ch|84ch]`) and a soft-focus dim on non-current sections when Focus Mode is on (never a hard
cut). Reuses `ArrivalBackground`/`AIPresenceLogo` (Living AI Symbol™) unmodified, and
`WorkspaceComingSoonScreen` unmodified for the "Continue to Learning Proof™" destination (which doesn't
exist yet) — exactly the same honest not-yet-built pattern every other destination in this arc already
uses.

**Reading Controls.** Exactly the brief's list, nothing extra: Font Size (−/+), Reading Width (3 presets),
Dark/Light, Focus Mode, a read-only current-pace WPM indicator (real, computed from elapsed time × words
read — information, not an adjustable playback speed, since this isn't RSVP), Bookmark.

**Reading Progress.** Elegant, non-bar indicators — current section name + position, real estimated time
remaining (from real remaining word count), real Concepts Covered count. **"Reading Streak" is deliberately
omitted** — no real cross-session streak data source exists yet, the same honesty precedent as
`BlueprintOverview`'s own deliberately-omitted Memory/Understanding Score (flagged as a future hook, not a
fabricated number).

**Reading Insights.** The brief's 💡/🧠/📖/⭐ examples, revealed as a real section boundary is crossed —
the same honest mechanism already established for AI Discoveries™ on the AI Thinking screen — content
drawn from this document's own real (mock) chapters/concepts (e.g. "💡 This concept connects to {a real
other chapter title}").

**Inline AI Assist — disclosed judgment call.** Text selection opens a small anchored popover (never a chat
window, closes on Escape/outside click) with all 6 actions (Explain/Simplify/Translate/Give Example/
Summarize/Ask AI). Responses are **deterministic, templated text, not a live Anthropic API call** —
wiring a real model call is a materially bigger, separate scope than this UI sprint and outside this
brief's own "DO NOT modify... Business Logic." `getMockAssistResponse()` is the exact, isolated seam a
future sprint would replace with a real call, same input/output shape.

**Micro Breaks™.** Genuinely real, not mock: `useReadingMicroBreakPrompt` is a plain elapsed-time threshold
check (20 minutes) with dismiss/reset logic — "this is future-ready, design architecture only" was read as
"the mechanism can be real even though the eventual AI-generated suggestion copy is a future enhancement."

**End of Reading.** "✨ Excellent. You've completed this reading session." + "Continue to Learning Proof™"
— user-triggered only via a real button click at the end of the passage ("I've Finished Reading"), never an
auto-detected scroll-end heuristic and never an automatic navigation afterward.

## Motion & Typography

Insight callouts and the completion screen reuse the established `animate-in fade-in slide-in-from-*`
idiom, `usePrefersReducedMotion`-gated throughout — no new animation primitives. Typography lives locally
in the new reading components (not a change to the shared `src/lib/designSystem/typography.ts`, which is
tuned for UI chrome, not long-form reading) — larger base size, `leading-8` body copy, comfortable measure
per width preset, adaptive `font-size` via a scale multiplier.

## Accessibility

- Reduced motion: gated throughout via the existing hook.
- Keyboard: every control is a real `<button>`/`Button`; the AI Assist popover closes on Escape and moves
  focus to itself on open; standard tab order elsewhere (no custom global keyboard shortcuts were added —
  judged unnecessary risk of conflicting with browser/assistive-tech behavior without strong justification).
- Screen readers: progress indicator and insight callouts are `aria-live="polite"`; controls have
  `aria-label`/`aria-pressed` where relevant; the AI Assist popover is `role="dialog"` with a label.
- Focus states: unchanged shadcn `Button` focus-ring conventions throughout.

## Validation Results

1. `npx tsc --noEmit` — initially caught one real, legitimate issue: `trackEvent`'s
   `LearningProjectAnalyticsEvent` union didn't include the 2 new reading event names — fixed by adding
   them (additive, no existing event renamed). Clean after.
2. `npx vitest run` — **475 test files / 3206 tests passed** (up from 473/3195 — 11 new tests:
   `generateReadingPassage.test.ts` ×7, `useReadingMicroBreakPrompt.test.ts` ×4), zero regressions.
3. `npm run build` — succeeded on the first attempt; `/preview/learning-studio/quantum-speed-reading`
   compiled with real content (6.98 kB, up from the 842 B placeholder); every route under
   `/labs/quantum-speed-reading/**` compiled unchanged, confirming zero impact on the separate Labs
   product. The previously-flagged `/discover-learning-potential/reading` issue did not reproduce this run.
4. `npx eslint` on all 20 new/changed files — clean, zero warnings or errors.
5. `git status`/`git diff --stat` scope check — the large `labs/quantum-speed-reading/**` and
   `features/quantum-speed-reading/**` diff noise is confirmed pre-existing (present in this repo's working
   tree since before this session began; several of those exact files were already listed `M` in this
   session's very first git status). Cross-checked every file this sprint actually created/edited against
   those two path prefixes — zero overlap.
6. Manual reasoning-level check (no browser available, disclosed as before): the route renders in Focus
   Mode; missing/invalid `?project=` shows the honest empty state; a valid project renders a real
   multi-section passage with working controls; text selection opens the AI Assist popover; insight
   callouts and progress numbers track real scroll position; completion never auto-navigates; every other
   `/preview/*` route and the Labs product are unaffected.

## Stop

Per the brief's explicit instruction, no Memory Mode™ work was started. Waiting for review before any
further work.
