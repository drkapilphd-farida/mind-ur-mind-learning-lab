import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import type { Locale } from '@/types/exercise-engine'
import type { WordExerciseAsset } from '../types/ExerciseAsset'
import { mapChunkDifficultyToTier } from './mapChunkDifficultyToTier'

export type BuildWordExerciseAssetsOptions = {
  // The document's own real detected language (BlueprintHeader.language)
  // — 'en' is the honest, disclosed default when undetected, matching
  // every dataset already authored in this codebase (Locale's own '`en`
  // is the primary/default value).
  locale?: Locale
  idFactory?: (word: string, index: number) => string
}

function defaultId(chapterId: string, word: string, index: number): string {
  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${chapterId}-word-${index}-${slug}`
}

// Exercise Asset Builder™ — Word Exercise Asset. Pure Map + one Join, no
// new computation: every WordAsset in the bundle already carries a real
// `priority` and `learningObjectReference` (Sprint 2). This function only
// resolves that reference against the SAME bundle's own `learningObjects`
// array (already loaded together — no new query, no new AI) to reach a
// real difficulty signal, then converts it via mapChunkDifficultyToTier.
// A word whose reference doesn't resolve (should not happen for a bundle
// this codebase's own Sprint-2 pipeline produced, but never trusted
// blindly) degrades honestly to the same 'medium' default an unenriched
// word would receive — never a thrown error, never a fabricated tier.
export function buildWordExerciseAssets(bundle: LearningAssetBundle, options: BuildWordExerciseAssetsOptions = {}): readonly WordExerciseAsset[] {
  const locale: Locale = options.locale ?? 'en'
  const idFactory = options.idFactory ?? ((word, index) => defaultId(bundle.chapterId, word, index))
  const objectsById = new Map(bundle.learningObjects.map((object) => [object.objectId, object] as const))

  return bundle.wordAssets.map((asset, index) => {
    const sourceObject = asset.learningObjectReference !== null ? (objectsById.get(asset.learningObjectReference) ?? null) : null

    return {
      id: idFactory(asset.word, index),
      word: asset.word,
      wordLabel: asset.word,
      difficultyTier: mapChunkDifficultyToTier(sourceObject?.difficulty ?? null),
      locale,
      priority: asset.priority,
      sourceObjectId: asset.learningObjectReference,
    }
  })
}
