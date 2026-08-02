import type { ContentItem } from '@/types/exercise-engine'
import type { WordExerciseAsset } from '@/core/universal-learning-engine/exercise-asset-builder'

// Reading Intelligence Engine™ Upgrade — Sprint QSR-2: Reading Experience
// Integration™. Maps WordExerciseAsset[] straight into a ContentItem[]
// pool scoped to ONE document's own chapter — deliberately NOT through
// the dataset registry (registerWordExerciseAssetDataset, QSR-1), which
// pools across every registered dataset sharing a contentType/locale and
// would silently mix in unrelated hand-authored platform vocabulary
// (confirmed against datasetEngine.ts's own getContentForExercise, which
// has no category filter). This pool is handed directly to
// wordFlashEngine.ts's own buildWordFlashItems — the same distractor-
// building function Word Flash itself calls — so the Quantum Reading
// Journey™'s Word Flash stage renders through the identical engine
// primitives, on a document-pure pool instead of the global one.
export function toWordFlashContentItems(assets: readonly WordExerciseAsset[]): ContentItem[] {
  return assets.map((asset) => ({
    id: asset.id,
    content: asset.word,
    contentLabel: asset.wordLabel,
    difficulty: asset.difficultyTier,
    locale: asset.locale,
    categories: ['ai-learning-studio'],
    metadata: { sourceObjectId: asset.sourceObjectId, priority: asset.priority },
  }))
}
