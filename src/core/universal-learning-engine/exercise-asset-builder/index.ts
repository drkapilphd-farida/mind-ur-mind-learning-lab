// Universal Learning Intelligence Engine™ (ULIE™) — Exercise Asset
// Builder™ (Reading Intelligence Engine™ Upgrade, Sprint QSR-1, Tier-1).
// The one import path every downstream consumer uses — never import from
// internal/ directly. This module knows nothing about React, pages, or
// the exercise-engine dataset registry: every export below is a plain
// function/type operating on plain data. Registering the output against
// the existing Quantum Speed Reading engines is a feature-layer concern
// (see src/features/learning-mode-runtime/exercise-assets/), deliberately
// kept out of this core module the same way reading-experience/ stays
// free of any QSR-specific code.

export { buildExerciseAssets, EXERCISE_ASSET_BUILDER_VERSION } from './buildExerciseAssets'
export type { BuildExerciseAssetsInput, BuildExerciseAssetsResult } from './buildExerciseAssets'

export { mapChunkDifficultyToTier } from './internal/mapChunkDifficultyToTier'
export { buildWordExerciseAssets } from './internal/buildWordExerciseAssets'
export type { BuildWordExerciseAssetsOptions } from './internal/buildWordExerciseAssets'
export { buildChunkExerciseAssets } from './internal/buildChunkExerciseAssets'
export type { BuildChunkExerciseAssetsOptions } from './internal/buildChunkExerciseAssets'
export { buildAssessmentExerciseAssets } from './internal/buildAssessmentExerciseAssets'
export type { BuildAssessmentExerciseAssetsOptions } from './internal/buildAssessmentExerciseAssets'

export { validateWordExerciseAssets, validateChunkExerciseAssets, validateAssessmentExerciseAssets } from './internal/validateExerciseAssets'
export type { ExerciseAssetKind, ExerciseAssetValidationError, ExerciseAssetValidationResult } from './internal/validateExerciseAssets'

export type { WordExerciseAsset, ChunkExerciseAsset, AssessmentQuestionKind, AssessmentExerciseAsset } from './types'
