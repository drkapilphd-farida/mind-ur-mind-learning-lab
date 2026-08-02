# Architecture — Quantum Reading Journey™ (Sprint QSR-2)

## Summary

Sprint QSR-1 proved Word/Chunk/Assessment Exercise Assets can drive the existing Word Flash, Progressive
Chunk Reading, and Reading Assessment engines with zero engine changes, but only as isolated, manually
navigated exercises. This sprint (Reading Experience Integration™) makes a real uploaded document feel like
one continuous journey — Chapter Ready → Word Flash → Progressive Chunk Reading → Reading Assessment →
Chapter Complete → Next Chapter — with resumable progress, no manual navigation, and zero new AI calls.

## Why "Quantum Reading Journey™," not "Reading Journey"

`ReadingJourneyExperience.tsx` (Sprint 5, this engagement) already exists and is already called "Reading
Journey Experience™" in the product — a different feature entirely (Chapter Ready → Keyword Warmup →
Word/Phrase/Sentence/Paragraph → Full Chapter → Celebration, built on the Reading Experience Engine's own
ULO-native assets). This sprint's flow is named **Quantum Reading Journey™** throughout — file names,
`exerciseId`s, session type, route — specifically to avoid any code- or product-level confusion with that
existing, already-shipped feature.

## Why the registry isn't used for the journey's own content pool

`getContentForExercise()` — the function Word Flash and Progressive Chunk Reading actually call — pools
every registered dataset matching `contentType`+`locale`, with no `category` filter (confirmed by reading
`datasetEngine.ts` directly). Registering a document's Exercise Assets via QSR-1's
`registerWordExerciseAssetDataset`/`registerChunkExerciseAssetDataset` — which still matters for the
*standalone* practice routes — would silently mix in unrelated hand-authored platform vocabulary here.

Instead: `toWordFlashContentItems`/`toChunkReadingContentItems` (new, `src/features/learning-mode-runtime/
exercise-assets/`) map a document's own `WordExerciseAsset[]`/`ChunkExerciseAsset[]` straight into a
`ContentItem[]` pool, in memory, never touching the registry. That pool is handed directly to the exact same
pure, exported distractor-building functions the real engines call —
`buildWordFlashItems` (`wordFlashEngine.ts`) and `buildProgressiveChunkReadingBlock`
(`progressiveChunkReadingEngine.ts`) — then rendered through the exact same `UniversalExercisePlayer`/
`useUniversalExerciseRuntime`. Nothing about either engine changed; only the pool source did.

## Why "Reading Assessment" here is `AssessmentQuestionScreen` alone

`ReadingAssessmentFlow`/`buildAssessmentQuestions`/`qsr_reading_assessments` are hard-coupled to
`AssessmentPassage[]`/`DocumentComprehensionSignal[]` — the separate, pre-signup WPM-pacing assessment.
Reusing them would require modifying them. `AssessmentQuestionScreen` alone has an exactly-clean prop surface
(`{questions, onComplete}`, no hidden dependencies) and QSR-1's `toAssessmentQuestions()` already produces
its exact input shape from `AssessmentExerciseAsset[]`. The journey reuses `AssessmentQuestionScreen` only;
the onboarding assessment feature is completely untouched.

## A real, disclosed side effect — and why it's harmless

Both journey stage components call `UniversalExercisePlayer`/`useUniversalExerciseRuntime` with a **distinct**
`exerciseId` (`quantum-journey-word-flash`, `quantum-journey-chunk-reading`) rather than reusing
`WORD_FLASH_DEFINITION`/`PROGRESSIVE_CHUNK_READING_DEFINITION` verbatim. Reusing those directly would have
caused completing a journey stage to also write to the *standalone* Word Flash/Progressive Chunk Reading
`exercise_progress` rows via `UniversalExercisePlayer`'s own internal `savePracticeSession` call — silently
marking the real, separately-gated `FLASH_INTELLIGENCE_MODULE`/`READING_EXPANSION_MODULE` sequences as
progressed, a real side effect this sprint never asked for. `verifyExerciseIsUnlocked` returns `true` for any
`exerciseId` not present in the gating registry, so these distinct ids write their own separate, harmless
`practice_sessions`/`exercise_progress` history rows instead.

## Progress persistence

Reuses `learning_sessions` (no new table) with one additive `session_type = 'qsr-journey'`
(`20260801000001_widen_learning_sessions_qsr_journey.sql`, mirroring the exact pattern
`'reading-experience'` already established). `quantumJourneySessionRecord.ts` mirrors
`readingExperienceSessionRecord.ts`'s own shape: `loadQuantumJourneyProgress`/`saveQuantumJourneyProgress`,
plus `isQuantumJourneyChapterCompleted` for chapter-unlock derivation. "Chapter completed → unlock next
chapter" is **derived** from a completed row's real `status`, never a separate write — the same
no-explicit-unlock precedent `getModuleProgress`'s `deriveAvailability` already established for the locked
exercise sequences.

Exercise Assets themselves are **not** persisted — `buildExerciseAssets` (QSR-1) is a pure, ~2ms derivation
of already-cached Blueprint/Bundle data, rebuilt once per chapter-visit in `loadQuantumJourneyChapter` and
held client-side for all three stages of that visit.

## Server-side sequencing enforcement

`loadQuantumJourneyChapter` refuses chapter N > 0 unless chapter N-1's own `qsr-journey` session has genuinely
completed — checked server-side, not just hidden client-side — the same "never trust the client to enforce
order" discipline `verifyExerciseIsUnlocked` already applies to the classic locked exercise sequences.

## Files

```
src/core/universal-learning-engine/exercise-asset-builder/       — unchanged (Sprint QSR-1)
src/features/learning-mode-runtime/
  exercise-assets/
    toWordFlashContentItems.ts / toChunkReadingContentItems.ts   — new, Map only
  persistence/
    quantumJourneySessionRecord.ts                               — new
  actions/
    loadQuantumJourneyChapter.ts                                 — new, read-only
    advanceQuantumJourneyStage.ts                                — new, the only write path
  quantum-reading-journey/
    useQuantumReadingJourneyController.ts                        — new, the state machine
    QuantumReadingJourneyController.tsx                          — new, sequences stages, no route change
    components/
      QuantumJourneyWordFlashStage.tsx                           — UniversalExercisePlayer, unmodified
      QuantumJourneyChunkReadingStage.tsx                        — useUniversalExerciseRuntime, unmodified
      QuantumJourneyAssessmentStage.tsx                          — AssessmentQuestionScreen, unmodified
      QuantumJourneyChapterReadyScreen.tsx / QuantumJourneyChapterCompleteScreen.tsx / QuantumJourneyLoadingScreen.tsx / QuantumJourneyEmptyStage.tsx
src/app/preview/learning-projects/[id]/quantum-journey/page.tsx  — new route, same auth pattern as [id]/read
supabase/migrations/20260801000001_widen_learning_sessions_qsr_journey.sql
```

## Deliberately deferred, disclosed — not a silent omission

The plan called for one new card linking to this route from the "choose your Learning Mode" hub. On
inspection, both candidate hub surfaces turned out more tightly closed than assumed: `LEARNING_MODES`
(`src/constants/learning/learningModes.ts`) is an explicitly fixed, carefully-tracked "eleven modes" catalog
feeding a recommendation engine — adding a twelfth entry there would misrepresent this as a new top-level
Learning Mode, which it isn't. `QsrHub.tsx`'s own mode cards are typed against a closed `QsrModeId` union
driving in-page `setQsrMode` state, not navigation — folding this route in would mean widening that union and
touching `ReadingWorkspace.tsx`'s own render logic, real scope beyond "build on the existing foundation."
Rather than force a fit into either, the route ships fully functional and directly reachable at
`/preview/learning-projects/[id]/quantum-journey`; wiring a discoverable link in is left as a small, explicit
follow-up once the right entry point is confirmed.

## Testing

New unit tests for both `ContentItem` adapters and the persistence module (mirroring QSR-1's real-fixture
style). The controller hook itself is **not** unit-tested directly — this codebase has no React-hook-testing
harness installed (confirmed: `useUniversalExerciseRuntime.test.ts` only tests its one extracted pure
function, `computeLongestCombo`, not the hook itself), and installing one is out of scope for an integration
sprint. Full existing suite re-run after this sprint's changes — 744 files, 4,403 tests, zero regressions.
`tsc --noEmit` (whole project, including the new route) and `eslint` both clean.

**Real production demonstration** (temp script, deleted after use, disposable test user created/deleted via
the admin API): against a real document ("Photosynthesis Validation," 14 real WordAssets/22 ChunkAssets/6
AssessmentAssets) — real Exercise Assets → real document-pure `ContentItem` pools → real `SessionItem[]` via
the unmodified `buildWordFlashItems`/`buildProgressiveChunkReadingBlock` (14 Word Flash items, a 6-chunk/
2-question reading block) → real `AssessmentQuestion[]` → a full real `learning_sessions` round trip (save
in-progress → load/resume → save completed → verify chapter-completion derivation → verify the next
chapter's server-side unlock check), now against the live, migrated `qsr-journey` session type.

**Disclosed gap**: no authenticated browser click-through of the actual route was performed this sprint —
the dev server was smoke-tested (confirms the app boots and the unauthenticated redirect fires correctly),
but Next.js middleware redirects unauthenticated requests before the page module itself ever compiles, so
that check alone doesn't exercise the route's own render path. The whole-project `tsc --noEmit` pass (which
does include this file) and the real data demonstration above are the actual verification for this sprint;
a real logged-in walkthrough is recommended before this route is linked from anywhere discoverable.
