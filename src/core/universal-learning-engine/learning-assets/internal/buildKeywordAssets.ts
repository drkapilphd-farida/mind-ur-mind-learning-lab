import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { KeywordAsset } from '../types/ReadingAssetRecords'
import { containsText } from './textHelpers'

// Category 1, "Keywords" — real, direct reuse of the Blueprint's own
// `readingAssets.keywords` (already real, UCE-3B-derived), each given a
// real reference back to whichever Learning Object's own title this
// keyword concerns, if any.
export function buildKeywordAssets(blueprint: ChapterIntelligenceBlueprint): readonly KeywordAsset[] {
  const objects = blueprint.learningObjects.objects

  return blueprint.readingAssets.keywords.map((keyword) => {
    const match = objects.find((object) => containsText(object.title, keyword) || containsText(keyword, object.title))
    return { keyword, learningObjectReference: match?.objectId ?? null }
  })
}
