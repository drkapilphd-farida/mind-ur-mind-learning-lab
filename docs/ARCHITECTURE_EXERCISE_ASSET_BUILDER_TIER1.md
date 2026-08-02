# Architecture — Exercise Asset Builder™ (Tier-1)

## Summary

This sprint (Reading Intelligence Engine™ Upgrade — Sprint QSR-1) implements the runtime contract Sprint
QSR-0.75 designed on paper: a new **Exercise Asset Builder™** module that converts already-real Learning
Assets (Sprint 1's Learning Blueprint + Sprint 2's Learning Assets) into three engine-ready **Exercise
Asset** types — **Word**, **Chunk**, and **Assessment** — without touching a single existing Quantum Speed
Reading engine. Phrase, Sentence, Paragraph, and Multi-Line Reading remain untouched, per the locked Tier-1
scope; their Exercise Assets stay future work (Sprint QSR-0.75, Parts 6–7 already name exactly which fields
are missing for each).

The Builder performs only the eight operations the architecture sprint authorized — filter, sort, group,
rank, map, join, split, deduplicate, transform — and nothing else. It never scores, animates, renders,
evaluates, calculates XP/levels/mastery, or calls an AI model. Every one of those responsibilities stays
exactly where it already lived, inside the existing engines.

## Why This Shape

**Two layers, not one, and the layer boundary matches this codebase's own existing rule.** `src/core/
universal-learning-engine/` never imports from `src/lib/exercise-engine/` or `src/features/` anywhere today
(verified by grep before writing a single file) — core stays framework- and platform-agnostic. Registering a
dataset via `createDataset()`/`registerDataset()` is inherently a `src/lib/exercise-engine/` concern, so the
Exercise Asset *Builder* (pure, testable, zero registry dependency) lives in core, and Exercise Asset
*Registration* (the thin adapter that calls `createDataset()` / reshapes into `AssessmentQuestion`) lives in
`src/features/learning-mode-runtime/exercise-assets/`, the same feature folder that already owns
`learningAssetBundles.ts`/`chapterIntelligenceBlueprints.ts` persistence — the established home for
"consumes core pipeline output, talks to the outside world."

**The DifficultyTier mapping exploits a real, literal coincidence instead of inventing a new scale.**
`ChunkDifficulty` (Learning Assets' only difficulty signal) is `'beginner' | 'intermediate' | 'advanced'`.
`DifficultyTier` (every QSR engine's own scale) is `'beginner' | 'easy' | 'medium' | 'advanced' | 'expert' |
'elite' | 'master' | 'adaptive'`. Two of the three `ChunkDifficulty` values are **literally identical
tokens** on the `DifficultyTier` scale — `mapChunkDifficultyToTier` preserves those two verbatim rather than
remapping a real signal to an adjacent tier for no reason, and maps the one gap (`'intermediate'`) plus a
`null` (undetected) input to `'medium'` — the same tier this codebase's own `DEFAULT_SCORING_RULES
.difficultyMultiplier` already treats as the neutral 1.0 baseline. No prior mapping between these two scales
existed anywhere in this codebase (confirmed against `chunkDifficulty.ts`, which only maps `DifficultyTier`
→ session parameters, never the reverse) — this function is now the single source of truth every Tier-1
asset's `difficultyTier` field depends on.

**Chunk splitting is disclosed as mechanical, not semantic.** `chunkDataset.ts`'s hand-authored chunks
("mental clarity", "reading speed") are curated for independent meaningfulness. `buildChunkExerciseAssets`
cannot replicate that judgment locally — it splits real chapter text on sentence boundaries, then into
fixed-size word windows that never cross a sentence boundary, which keeps every chunk grammatically
contained but not hand-curated. This limitation was named in Sprint QSR-0.5/0.75 and is restated here rather
than silently overclaimed.

**Assessment reuses two already-real algorithms instead of building a third.** `AssessmentAssets.mcqs` is
already generated with zero AI by `buildStructuralAssessmentItems.ts` (Sprint 1). `buildAssessmentExerciseAssets`
is a field rename over that output (`question`→`prompt`, `options`→`options`, `correctAnswerIndex`→
`correctIndex`) plus one local join: `StructuralMcqItem` carries no object reference, so `sourceObjectId` is
recovered by matching the mcq's own real question text (`What is the definition of "<term>"?`) against this
chapter's `learningObjects` — the same "match by real text" precedent Sprint 3's `normalizeForMatching`
already established. An unresolvable term degrades honestly to `sourceObjectId: null`, never a guess.

## Folder Structure

```
src/core/universal-learning-engine/exercise-asset-builder/
  index.ts                              — barrel export (only public surface)
  buildExerciseAssets.ts                — Tier-1 orchestrator: Bundle + Blueprint mcqs + chapter text -> {words, chunks, assessments, validation}
  types/
    ExerciseAsset.ts                    — WordExerciseAsset, ChunkExerciseAsset, AssessmentExerciseAsset
  internal/
    mapChunkDifficultyToTier.ts         — the one shared DifficultyTier mapping every Tier-1 asset depends on
    buildWordExerciseAssets.ts          — Map + Join (learningObjectReference -> LearningAssetObject.difficulty)
    buildChunkExerciseAssets.ts         — Split (sentence boundary, word-count window) + Transform (word count -> tier)
    buildAssessmentExerciseAssets.ts    — Map + Join (question text -> sourceObjectId)
    validateExerciseAssets.ts           — structural validation, returns errors, never throws
    testFixtures.ts                     — shared real-shaped fixtures (mirrors learning-assets/internal/testFixtures.ts)

src/features/learning-mode-runtime/exercise-assets/
  registerExerciseAssetDatasets.ts      — Word/Chunk -> createDataset()/registerDataset(), category 'ai-learning-studio'
  toAssessmentQuestions.ts              — AssessmentExerciseAsset -> real AssessmentQuestion (Reading Assessment Engine™'s own type)
```

## What Each Tier-1 Asset Feeds, Unchanged

| Exercise Asset | Registration | Existing engine, unmodified |
|---|---|---|
| `WordExerciseAsset[]` | `registerWordExerciseAssetDataset()` → `createDataset({contentType:'word', category:'ai-learning-studio', ...})` | Word Flash, Flash Words™ — via the same `getContentForExercise()` seam they already call |
| `ChunkExerciseAsset[]` | `registerChunkExerciseAssetDataset()` → `createDataset({contentType:'chunk', ...})` | Progressive Chunk Reading, legacy Chunk Reading — same seam |
| `AssessmentExerciseAsset[]` | `toAssessmentQuestions()` → `AssessmentQuestion[]` | Reading Assessment Engine™ (`ReadingAssessmentFlow` / `AssessmentQuestionScreen`) — same prop shape it already accepts |

No engine file changes. `registerWordExerciseAssetDataset`/`registerChunkExerciseAssetDataset` call the
identical `createDataset()` function `wordFlashDataset.ts`/`chunkDataset.ts` already call; a document-derived
pool and a hand-authored pool merge at query time exactly the way `wordFlashDataset.ts`'s own header comment
already describes for two hand-authored pools sharing one `contentType`. `toAssessmentQuestions` targets the
real `AssessmentQuestion` type (`{type, prompt, options: {value, isCorrect}[]}`) the Reading Assessment
Engine™ already consumes — confirmed by reading `AssessmentQuestion.ts`, `ReadingAssessmentFlow.tsx`, and
`AssessmentQuestionScreen.tsx` directly, not assumed from the QSR-0.75 architecture sketch.

## Validation

Every Tier-1 array is checked before it would be registered: empty arrays, duplicate ids, empty
text/prompt fields, an out-of-range `correctIndex`, an invalid `difficultyTier`, and — for Assessment — a
`sourceObjectId` that doesn't resolve against the chapter's own real `learningObjects`. `validate*` never
throws; it returns `{valid, errors: ExerciseAssetValidationError[]}` and `buildExerciseAssets` logs a
`warn` only when `errors.length > 0` — matching this codebase's own "verify, don't assume; never crash on
malformed data" discipline (`isBundleShaped`, `isBlueprintShaped`).

## Logging

One `logger.info` summary per `buildExerciseAssets()` call — builder version, document/chapter id, assets
received vs. generated per type, validation error count, generation time in ms — plus one `logger.warn`
only when validation actually failed, carrying the specific errors. No per-item logging; `logger.debug` is a
dev-only no-op in this codebase already, so nothing prints in production even if a future caller adds
per-item detail there.

## Testing

47 new tests across 8 files, covering: `mapChunkDifficultyToTier`'s determinism and its two verbatim/one
default/one null case; each Tier-1 builder's field mapping, join behavior, honest degradation on an
unresolvable reference, and empty-input handling; the validation layer's every structural check; the
orchestrator's end-to-end assembly and logging; and the registration layer's actual `createDataset()`/
`getContentForExercise()` round-trip plus the `AssessmentExerciseAsset → AssessmentQuestion` reshape. Full
existing suite (741 files, 4,387 tests) re-run after this sprint's changes — all passing, zero regressions.
`tsc --noEmit` and `eslint` both clean.

## What Is Not In Tier-1

Phrase Reading, Sentence Reading, Paragraph Reading, Multi-Line Reading, their Exercise Asset types, their
registration, and any new AI prompt — all explicitly out of scope per this sprint's brief, and all already
documented (not implemented) in Sprint QSR-0.75, Parts 2 and 7. The `ChunkDifficulty → DifficultyTier`
mapping this sprint ships is written to be reused by those future sprints without modification.
