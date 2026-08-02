import type { DifficultyTier, Locale } from '@/types/exercise-engine'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-1: Exercise Asset
// Builder™ (Tier-1). These three types are the runtime contract Sprint
// QSR-0.75 defined and this sprint implements — each shaped to match the
// existing engine's own native input as closely as possible (see each
// field's own comment for exactly which existing type it mirrors), so
// registering one requires no change to the engine that consumes it.

// Mirrors ContentItem (src/types/exercise-engine/index.ts) field-for-field
// — a WordExerciseAsset maps onto ContentItem with a rename only, no
// reshaping. Consumed by Word Flash and Flash Words™ (Rapid Visual
// Intelligence) via the same getContentForExercise() seam.
export type WordExerciseAsset = {
  id: string
  word: string
  wordLabel: string
  difficultyTier: DifficultyTier
  locale: Locale
  // = the source WordAsset's own real, already-computed rank position.
  priority: number
  // = the source WordAsset's own real learningObjectReference — null when
  // the word wasn't traceable to a specific Learning Object.
  sourceObjectId: string | null
}

// Mirrors ContentItem, same as WordExerciseAsset. Consumed by Progressive
// Chunk Reading (its word/chunk-tier levels) and legacy Chunk Reading via
// the same getContentForExercise() seam.
export type ChunkExerciseAsset = {
  id: string
  chunkText: string
  wordCount: number
  difficultyTier: DifficultyTier
  sourceChapterId: string
}

// Every AssessmentAssets.mcqs item this codebase has ever produced is a
// definition question (buildStructuralAssessmentItems.ts's own
// buildDefinitionMcq is the only mcq builder that exists) — a single
// honest literal, not a fabricated wider union, matching this codebase's
// own BlueprintLearningObjectType = 'concept' precedent (Sprint 1).
export type AssessmentQuestionKind = 'definition'

// Mirrors AssessmentAssets.mcqs[number] (StructuralMcqItem) with a field
// rename (question -> prompt, correctAnswerIndex -> correctIndex) plus
// two fields StructuralMcqItem never carried (sourceObjectId,
// questionKind), resolved locally — see buildAssessmentExerciseAssets.ts.
export type AssessmentExerciseAsset = {
  id: string
  prompt: string
  options: readonly string[]
  correctIndex: number
  sourceObjectId: string | null
  questionKind: AssessmentQuestionKind
}
