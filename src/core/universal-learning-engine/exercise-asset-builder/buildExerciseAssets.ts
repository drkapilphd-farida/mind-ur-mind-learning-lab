import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import type { AssessmentAssets } from '@/core/universal-learning-engine/learning-blueprint'
import type { Locale } from '@/types/exercise-engine'
import { logger } from '@/lib/logger'
import { buildWordExerciseAssets } from './internal/buildWordExerciseAssets'
import { buildChunkExerciseAssets } from './internal/buildChunkExerciseAssets'
import { buildAssessmentExerciseAssets } from './internal/buildAssessmentExerciseAssets'
import { validateWordExerciseAssets, validateChunkExerciseAssets, validateAssessmentExerciseAssets, type ExerciseAssetValidationResult } from './internal/validateExerciseAssets'
import type { WordExerciseAsset, ChunkExerciseAsset, AssessmentExerciseAsset } from './types/ExerciseAsset'

// Bumped only when a Tier-1 builder's real output shape or field
// derivation changes — logged with every build so a regression can be
// traced to the exact Builder version that produced it.
export const EXERCISE_ASSET_BUILDER_VERSION = '1.0.0-tier1'

export type BuildExerciseAssetsInput = {
  documentId: string
  // = the source LearningChunk.id / LearningAssetBundle.chapterId this
  // build covers — every asset produced carries this as a traceable
  // sourceChapterId/id prefix.
  chapterId: string
  // Real chapter body text (LearningChunk.content) — the Chunk builder's
  // only content source; never re-fetched or re-extracted here.
  chapterContent: string
  // = the document's own detected language (BlueprintHeader.language),
  // honestly null when undetected — the Word builder applies the same
  // 'en' default documented in buildWordExerciseAssets.ts.
  locale: Locale | null
  bundle: LearningAssetBundle
  assessmentMcqs: AssessmentAssets['mcqs']
}

export type BuildExerciseAssetsResult = {
  words: readonly WordExerciseAsset[]
  chunks: readonly ChunkExerciseAsset[]
  assessments: readonly AssessmentExerciseAsset[]
  validation: {
    words: ExerciseAssetValidationResult
    chunks: ExerciseAssetValidationResult
    assessments: ExerciseAssetValidationResult
  }
  builderVersion: string
  generatedAt: string
}

// Exercise Asset Builder™ — Tier-1 orchestrator (Sprint QSR-1). Combines
// the three Tier-1 builders (Word, Chunk, Assessment) over one chapter's
// already-real Learning Assets/Blueprint output, validates every asset
// produced, and logs one structured summary line — never per-item spam.
// This function performs no AI, no scoring, no rendering: pure Filter /
// Map / Join / Split / Transform over data these builders already trust
// (see each internal/build*.ts for the specific operations), matching
// the Exercise Asset Builder's locked responsibilities (Sprint QSR-0.75,
// Part 6).
export function buildExerciseAssets(input: BuildExerciseAssetsInput): BuildExerciseAssetsResult {
  const startedAt = Date.now()

  const words = buildWordExerciseAssets(input.bundle, { locale: input.locale ?? 'en' })
  const chunks = buildChunkExerciseAssets(input.chapterContent, input.chapterId)
  const assessments = buildAssessmentExerciseAssets(input.assessmentMcqs, input.chapterId, input.bundle.learningObjects)

  const knownObjectIds = new Set(input.bundle.learningObjects.map((object) => object.objectId))
  const validation = {
    words: validateWordExerciseAssets(words),
    chunks: validateChunkExerciseAssets(chunks),
    assessments: validateAssessmentExerciseAssets(assessments, knownObjectIds),
  }

  const generationTimeMs = Date.now() - startedAt
  const generatedAt = new Date().toISOString()
  const totalValidationErrors = validation.words.errors.length + validation.chunks.errors.length + validation.assessments.errors.length

  logger.info('exercise asset builder: tier-1 build complete', {
    builderVersion: EXERCISE_ASSET_BUILDER_VERSION,
    documentId: input.documentId,
    chapterId: input.chapterId,
    receivedWordAssets: input.bundle.wordAssets.length,
    receivedMcqs: input.assessmentMcqs.length,
    generatedWords: words.length,
    generatedChunks: chunks.length,
    generatedAssessments: assessments.length,
    validationErrors: totalValidationErrors,
    generationTimeMs,
  })

  if (totalValidationErrors > 0) {
    logger.warn('exercise asset builder: validation failures produced', {
      documentId: input.documentId,
      chapterId: input.chapterId,
      wordErrors: validation.words.errors,
      chunkErrors: validation.chunks.errors,
      assessmentErrors: validation.assessments.errors,
    })
  }

  return { words, chunks, assessments, validation, builderVersion: EXERCISE_ASSET_BUILDER_VERSION, generatedAt }
}
