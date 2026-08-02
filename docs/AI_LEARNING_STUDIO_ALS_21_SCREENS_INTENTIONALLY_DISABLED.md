# AI Learning Studio™ — Sprint ALS-21 Screens Still Intentionally Disabled

**Sprint:** ALS-21 — Complete Functional Completion

This lists every whole screen/route that intentionally shows a "not yet available" state rather than a
real, complete experience — distinct from `AI_LEARNING_STUDIO_ALS_21_REMAINING_NON_FUNCTIONAL_FEATURES.md`,
which covers partial features *within* otherwise-working screens.

## Within the universal Learning Workspace™

1. **`/preview/learning-projects/[id]/workspace?mode=research-mode`** — resolves to the Workspace's own
   real, honest `unavailable` state (`EmptyStateCard`, "Coming in a future production sprint"). Reached
   only by explicitly choosing Research Mode™ from the Learning Blueprint™ grid, which now (as of this
   sprint) discloses its unavailability with a "Coming Soon" badge before the click, not just after.
2. **`/preview/learning-projects/[id]/workspace?mode=exam-prep`** — identical treatment to Research
   Mode™.

Both are real, working screens — not broken, not blank, not an error. Verified reachable and rendering
correctly via this sprint's own route sweep.

## Outside AI Learning Studio™

3. **`/assessments/[category]/[assessment]/*`** — the Mind Assessment Center™ funnel (a separate, older
   core module). All three of its real routes (category, question, and completion screens) render and
   are reachable; this sprint's fix removed the genuinely dead buttons and misleading placeholder text,
   but the underlying flow remains intentionally built on mock/static data, not real scoring or real
   multi-question progression. See `AI_LEARNING_STUDIO_ALS_21_REMAINING_NON_FUNCTIONAL_FEATURES.md` item
   8 for the full disclosure.

## What is NOT on this list

Every one of the nine real AI Learning Studio™ Learning Modes' own dedicated routes
(`/read`, `/memory`, `/focus`, `/notes`, `/mind-map`, `/flashcards`, `/mcqs`, `/revision`,
`/preview/ai-mentor`) — all nine are real, complete, working screens, confirmed by this sprint's own full
route sweep and the per-mode functional matrix in `AI_LEARNING_STUDIO_ALS_21_FUNCTIONAL_COMPLETION_REPORT.md`.
