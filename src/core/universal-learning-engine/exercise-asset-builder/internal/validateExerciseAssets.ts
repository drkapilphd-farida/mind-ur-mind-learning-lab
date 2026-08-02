import type { DifficultyTier } from '@/types/exercise-engine'
import type { WordExerciseAsset, ChunkExerciseAsset, AssessmentExerciseAsset } from '../types/ExerciseAsset'

export type ExerciseAssetKind = 'word' | 'chunk' | 'assessment'

export type ExerciseAssetValidationError = {
  assetType: ExerciseAssetKind
  // null only for a whole-array problem (e.g. "no assets were produced")
  // that isn't attributable to one item.
  assetId: string | null
  field: string
  problem: string
}

export type ExerciseAssetValidationResult = {
  valid: boolean
  errors: readonly ExerciseAssetValidationError[]
}

const VALID_DIFFICULTY_TIERS: ReadonlySet<DifficultyTier> = new Set<DifficultyTier>(['beginner', 'easy', 'medium', 'advanced', 'expert', 'elite', 'master', 'adaptive'])

function findDuplicateIds(ids: readonly string[]): ReadonlySet<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id)
    seen.add(id)
  }
  return duplicates
}

// Exercise Asset Builder™ — validation layer. Every check here is
// structural (missing / empty / duplicate / out-of-range) — never a
// judgment about content quality, which stays out of the Builder's
// scope per Sprint QSR-0.75 Part 6 ("never perform learning logic").
// Nothing here throws: a caller reads the returned errors[] and decides
// whether to skip an item, block registration, or just log — matching
// this codebase's own "verify, don't assume; never crash on bad data"
// discipline (isBundleShaped, isBlueprintShaped).

export function validateWordExerciseAssets(assets: readonly WordExerciseAsset[]): ExerciseAssetValidationResult {
  const errors: ExerciseAssetValidationError[] = []
  if (assets.length === 0) {
    errors.push({ assetType: 'word', assetId: null, field: 'assets', problem: 'no Word Exercise Assets were produced' })
  }

  const duplicates = findDuplicateIds(assets.map((asset) => asset.id))
  for (const asset of assets) {
    if (duplicates.has(asset.id)) errors.push({ assetType: 'word', assetId: asset.id, field: 'id', problem: 'duplicate id' })
    if (asset.word.trim().length === 0) errors.push({ assetType: 'word', assetId: asset.id, field: 'word', problem: 'empty word' })
    if (!VALID_DIFFICULTY_TIERS.has(asset.difficultyTier)) errors.push({ assetType: 'word', assetId: asset.id, field: 'difficultyTier', problem: `invalid tier "${asset.difficultyTier}"` })
  }

  return { valid: errors.length === 0, errors }
}

export function validateChunkExerciseAssets(assets: readonly ChunkExerciseAsset[]): ExerciseAssetValidationResult {
  const errors: ExerciseAssetValidationError[] = []
  if (assets.length === 0) {
    errors.push({ assetType: 'chunk', assetId: null, field: 'assets', problem: 'no Chunk Exercise Assets were produced' })
  }

  const duplicates = findDuplicateIds(assets.map((asset) => asset.id))
  for (const asset of assets) {
    if (duplicates.has(asset.id)) errors.push({ assetType: 'chunk', assetId: asset.id, field: 'id', problem: 'duplicate id' })
    if (asset.chunkText.trim().length === 0) errors.push({ assetType: 'chunk', assetId: asset.id, field: 'chunkText', problem: 'empty chunk text' })
    if (asset.wordCount <= 0) errors.push({ assetType: 'chunk', assetId: asset.id, field: 'wordCount', problem: `invalid word count ${asset.wordCount}` })
    if (!VALID_DIFFICULTY_TIERS.has(asset.difficultyTier)) errors.push({ assetType: 'chunk', assetId: asset.id, field: 'difficultyTier', problem: `invalid tier "${asset.difficultyTier}"` })
  }

  return { valid: errors.length === 0, errors }
}

// `knownObjectIds` — the same chapter's real learningObjects ids, so a
// sourceObjectId that doesn't resolve to any real object in this chapter
// is caught here as an "invalid reference," not silently accepted.
export function validateAssessmentExerciseAssets(assets: readonly AssessmentExerciseAsset[], knownObjectIds: ReadonlySet<string>): ExerciseAssetValidationResult {
  const errors: ExerciseAssetValidationError[] = []
  if (assets.length === 0) {
    errors.push({ assetType: 'assessment', assetId: null, field: 'assets', problem: 'no Assessment Exercise Assets were produced' })
  }

  const duplicates = findDuplicateIds(assets.map((asset) => asset.id))
  for (const asset of assets) {
    if (duplicates.has(asset.id)) errors.push({ assetType: 'assessment', assetId: asset.id, field: 'id', problem: 'duplicate id' })
    if (asset.prompt.trim().length === 0) errors.push({ assetType: 'assessment', assetId: asset.id, field: 'prompt', problem: 'empty prompt' })
    if (asset.options.length < 2) errors.push({ assetType: 'assessment', assetId: asset.id, field: 'options', problem: `fewer than 2 options (${asset.options.length})` })
    if (asset.correctIndex < 0 || asset.correctIndex >= asset.options.length) {
      errors.push({ assetType: 'assessment', assetId: asset.id, field: 'correctIndex', problem: `correctIndex ${asset.correctIndex} out of range for ${asset.options.length} options` })
    }
    if (asset.sourceObjectId !== null && !knownObjectIds.has(asset.sourceObjectId)) {
      errors.push({ assetType: 'assessment', assetId: asset.id, field: 'sourceObjectId', problem: `references unknown object "${asset.sourceObjectId}"` })
    }
  }

  return { valid: errors.length === 0, errors }
}
