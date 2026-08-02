# AI Learning Studio™ — Sprint ALS-21 Complete Bug Fix Report

**Sprint:** ALS-21 — Complete Functional Completion
**Method:** Three parallel, independent research audits (upload wizard + mode-card grid; AI Mentor content
grounding; a broader placeholder/dead-button/silent-failure sweep) covering the entire product, not just
AI Learning Studio™'s own nine modes. Every fix below is traced to a specific, concrete, verified finding
— nothing was changed speculatively.

## Real bugs found and fixed

### 1. Research Mode™ / Exam Preparation™ cards had no "Coming Soon" treatment

**Where:** `src/components/learning/LearningModeCard.tsx`, used by the Learning Blueprint™'s "Other
Available Learning Modes™" grid.

**The bug:** Every one of the 11 Learning Mode cards rendered identically — the two modes with no real
runtime (Research Mode™, Exam Preparation™) were visually indistinguishable from a fully working mode
like MCQs™ or Flashcards™. A learner had zero advance signal that clicking one of these two specific
cards would lead to a "Coming in a future production sprint" stub. This was the concrete cause behind the
sprint brief's own observation that "Research Mode currently appears visually inconsistent" — not a
height/CSS bug (card heights were already correctly equalized by the grid), but a missing disclosure
state, inconsistent with the Upload Wizard's own `SourceTypeCard`, which has always shown a real "Coming
Soon" badge for its own not-yet-real options.

**The fix:** `LearningModeCard` gained a `comingSoon` prop, rendering the same real `Badge` component
`SourceTypeCard` already uses, at a consistent position (top-right, alongside the icon), plus a subtle
`opacity-80` dimming. The link itself stays fully clickable — clicking still navigates to the Workspace's
own honest, real "Coming in a future production sprint" screen, a real destination, not a dead end. A new,
shared `isLearningModeAvailable()` helper in `src/constants/learning/learningModes.ts` is the one place a
future sprint needs to touch when either mode gets a real runtime.

### 2. The AI Recommendation engine could recommend a mode with no real runtime as its top pick

**Where:** `src/lib/blueprint/recommendLearningMode.ts`.

**The bug:** The engine's own default/fallback case (fires for any document that isn't `advanced`
difficulty, doesn't have `high` memory density, and has fewer than 10 diagrams — the majority of ordinary
documents) recommended **Research Mode™** — a mode with no real runtime. `AIRecommendationHero.tsx` then
prominently features this as the AI's own top pick, with a "Start Recommended Mode" button leading
straight to the same unavailable stub. This is a materially worse bug than #1: it's not just a card
lacking a badge, it's the product's own AI recommendation actively steering a learner's primary
call-to-action toward a dead end.

**The fix:** The fallback case now recommends **Quantum Speed Reading™** — a real, connected mode, and
the platform's own designated "foundational Learning Mode" (per ALS-6's own reasoning). `research-mode`
was removed entirely from `RecommendedLearningModeId`'s own type union, so this class of bug is now
structurally impossible to reintroduce without a compiler error.

### 3. The primary "Start Learning" CTA silently disagreed with a valid, connected recommendation

**Where:** `src/lib/blueprint/selectPrimaryLearningMode.ts`.

**The bug:** This function's own job is to decide which mode the Blueprint's primary CTA launches — the
AI's real recommendation, when it's connected, or Reading as a safe fallback otherwise. Its own
`CONNECTED_RECOMMENDATION_MODE_IDS` list still only included `quantum-speed-reading` and `memory-mode` —
it had never been updated since ALS-13 gave **Mind Map™** a real, working runtime, over four sprints
earlier. The practical effect: whenever the AI recommended Mind Map™ (a real, working mode), the primary
"Start Learning" button silently substituted Reading instead — while the AI Recommendation Hero shown
directly below it correctly linked to Mind Map™. Two calls-to-action on the same screen, disagreeing,
for a silently stale reason.

**The fix:** `mind-map` added to the connected-mode list. All three real values `recommendLearningMode`
can now return are connected; the function's own safety-net behavior is preserved for the day a future
recommendation category introduces a genuinely disconnected mode.

### 4. AI Mentor™ never referenced any real document content

**Where:** `src/features/ai-mentor-runtime/context/buildMentorSessionContext.ts`,
`src/features/ai-mentor-runtime/ai/buildMentorSystemPrompt.ts`.

**The bug (or rather, gap):** A full trace of AI Mentor™'s real prompt-construction code confirmed it only
ever reasoned about aggregate counts (session counts, confidence percentages, documents-with-notes count)
— never a specific document's real title or content. This was a deliberate, explicitly-commented original
design choice, not an oversight, but the sprint brief's own explicit checklist item ("AI Mentor actually
uses uploaded content") called it out for reconsideration. Founder-confirmed: build it.

**The fix:** A new pure function, `resolveMostRecentDocumentId`, finds which real document the learner was
most recently active in, reusing the exact same Reading/Memory/Smart-Notes snapshot lists
`buildMentorSessionContext` already fetches (no new query). A new `resolveActiveDocumentContext` then
loads that document's real ULO and its real section headings — reusing `loadUniversalLearningObject` and
`listDocumentSectionHeadings`, the same primitives MCQs™ already uses; no new AI pipeline, no new parsing.
The real title and up to 5 real section headings now fold into AI Mentor's own system prompt, honestly
and only when real (never a guessed or fabricated document).

### 5. The Mind Assessment Center™ had two genuinely dead buttons and literal placeholder text shown as real UI

**Where:** `src/components/assessment/QuestionCard.tsx`,
`src/app/assessments/[category]/[assessment]/questions/page.tsx`,
`src/app/assessments/[category]/[assessment]/complete/page.tsx`.

**The bug:** This is a separate, older core module (PROJECT_RULES.md's own "Mind Assessment Center™"),
reachable from the marketing homepage, that predates this sprint arc entirely. Its answer-option buttons
had no `onClick` at all; its "Finish" button on the completion screen had no `onClick`/`href`/`asChild`,
a genuinely dead click target next to a real, working "Return Home" button; and the literal string
"Progress indicator placeholder" was rendered as if it were real UI copy.

**The fix (founder-confirmed minimal safety fix, not a full rebuild — real scoring/interactivity is
explicitly out of this sprint's scope):** Answer options now give real, honest visual feedback on
selection (a real `radiogroup`/`radio` pattern, local state only). Previous/Next are now honestly disabled
with a real reason (`title="Not available yet"`) rather than silently inert — this page shows one real,
hardcoded question with no real multi-question state to navigate, so disabling is the honest choice, not
a workaround. The dead "Finish" button was removed rather than wired to duplicate its neighbor's identical
behavior. The literal "Progress indicator placeholder" text was removed.

## Verification

`npx tsc --noEmit` clean, `npx eslint .` clean (whole repo), `npx vitest run` — 645 test files, 3,932
tests, 100% passing (+1 file / +5 tests over ALS-20, matching the new `resolveMostRecentDocumentId.test.ts`
and three new `buildMentorSystemPrompt.test.ts` assertions). `npm run build` — 126 routes, zero errors;
diffed against ALS-20's own build output, only the two files with real new logic (the assessment
`questions` route, `/preview/learning-projects/[id]`) grew by a few hundred bytes each — everything else
byte-identical. Full route sweep (public + all protected routes across the complete journey, including
the previously-unverified `?mode=research-mode` Workspace entry and the newly-fixed assessment routes) —
all clean.
