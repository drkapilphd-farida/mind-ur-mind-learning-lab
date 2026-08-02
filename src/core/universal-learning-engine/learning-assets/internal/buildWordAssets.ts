import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { WordAsset } from '../types/ReadingAssetRecords'
import { containsText } from './textHelpers'

// Category 2, "Word Assets" — one per real keyword. `priority` is a
// real, deterministic rank (earlier in the Blueprint's own already-real
// keyword order = higher priority) — never a fabricated score.
export function buildWordAssets(blueprint: ChapterIntelligenceBlueprint): readonly WordAsset[] {
  const { keywords } = blueprint.readingAssets
  const objects = blueprint.learningObjects.objects
  const lastIndex = keywords.length - 1

  return keywords.map((word, index) => {
    const match = objects.find((object) => containsText(object.title, word) || containsText(word, object.title) || (object.definition ? containsText(object.definition, word) : false))
    return {
      word,
      priority: lastIndex > 0 ? Number((1 - index / lastIndex).toFixed(3)) : 1,
      learningObjectReference: match?.objectId ?? null,
    }
  })
}
