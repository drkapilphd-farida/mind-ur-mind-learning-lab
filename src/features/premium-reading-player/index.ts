// Production Sprint 47 — Premium Reading Player™. Continues the Reading
// Intelligence Lab™ (Sprint 46, src/features/reading-intelligence/).
//
// Research finding that shaped this entire feature: nearly every capability
// this brief lists already exists, live, in production, split across three
// separate, un-unified player lineages —
//   1. Universal Runtime (useUniversalExerciseRuntime.ts + UniversalExercisePlayer.tsx
//      + ExerciseCountdown/SessionProgress/RuntimeResultScreen/ChoiceGrid) —
//      already powers Flash Reading Mode (Word Flash) and Chunk Reading Mode
//      (Chunk Reading, Progressive Chunk Reading). Already has countdown,
//      live progress, pause/resume, completion animation, a full result
//      screen, and next-speed/next-milestone recommendation. No exit
//      confirmation.
//   2. ReadingExperience.tsx — a separate, bespoke long-form scrolling
//      passage reader. Not one of this sprint's three named modes.
//   3. ExerciseRunner + RsvpExperience/RsvpCanvas — the RSVP single-word
//      reader. This is Streaming Reading Mode (words streamed one at a
//      time). Older, simpler lineage: no countdown, no pause, no live
//      progress bar.
//   4. Session Start / Daily Mission / Reading Objective already exist:
//      app/labs/quantum-speed-reading/start/page.tsx + QuantumReadingLanding
//      + getTodaysGoal/getMotivationalMessage (src/lib/exercises/dashboardInsights.ts).
//
// Genuinely new territory (confirmed by repo-wide grep — zero existing
// precedent): Exit Confirmation. A real, previously-unused Radix Dialog
// primitive (src/components/ui/dialog.tsx) is used for it here for the
// first time.
//
// The hard constraint that shapes this whole feature: "Do NOT rewrite any
// runtime" means UniversalExercisePlayer.tsx, ExerciseRunner.tsx, and
// RsvpCanvas cannot be touched — including to add an exit-confirmation hook
// to their own internal exit buttons. This feature works within that
// constraint honestly:
//   - Its own outer chrome (Welcome -> Daily Mission Banner + Reading
//     Objective -> Exercise Transition) is shown *before* the child engine
//     mounts — sequential, never nested inside it — and its own Session
//     Summary is shown *after* the child engine reports completion via the
//     `renderActiveExperience` render-prop's callback. No overlap with
//     either child engine's own screens.
//   - Its own persistent Exit affordance is separate from whatever exit
//     control the mounted child engine has, and opens the new
//     ExitConfirmationDialog before navigating away.
//   - `active` mounts exactly what the caller's `renderActiveExperience`
//     returns — this feature contains zero flash/chunk/streaming rendering
//     logic itself, matching UniversalExercisePlayer's own "never changes
//     when exercises are added" precedent.
//   - Known, explicit limitation: true interception of the child engines'
//     own internal exit/pause controls, and a live-progress overlay during
//     Streaming mode (RsvpCanvas exposes no progress callback), are out of
//     scope — would require adding an optional prop to those existing
//     files, authorized only in a future, explicitly-scoped sprint.
//
// Zero duplicate scoring/streak/journey logic: "Reading Score" is a
// pass-through of the caller-reported ReadingPlayerExerciseOutcome.accuracyPercent,
// never recomputed. "Mind Score Update"/"XP Reward"/"Continue Learning" are
// src/features/reading-intelligence/'s own already-computed values, read
// as-is via buildReadingPlayerSessionSummary — no new score, streak, or
// journey computation exists anywhere in this feature.
//
// Collision research: zero collisions for every type/component name here.
// One name avoided: `SessionSummary` already exists twice (focus-discovery,
// rapid-visual-intelligence) with unrelated shapes — this feature uses
// `ReadingPlayerSessionSummary` instead.
//
// Testing boundary: vitest.config.ts runs environment 'node' and this repo
// has zero .test.tsx files and no React Testing Library dependency —
// component-rendering tests are not part of this project's established
// infrastructure and are not introduced here. Only the pure logic
// (buildReadingPlayerSessionSummary, validateReadingPlayerSessionSummary)
// is unit-tested; the .tsx components are verified via `tsc --noEmit` and
// `npm run build`.
//
// No existing file was modified. No new page/route was created — this
// feature is a complete, real, reusable component tree, not wired into any
// live page yet (deferred to a future, explicit sprint, matching Sprint
// 46's own precedent).

export * from './types'
export * from './session'
export * from './validation'
export * from './components'
