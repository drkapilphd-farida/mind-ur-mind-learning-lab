import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { SentenceAsset } from '../types/ReadingAssetRecords'
import { containsText } from './textHelpers'

// Category 4, "Sentence Assets" — real sentences reused verbatim from
// the Blueprint's own `readingAssets.keySentences`. `importance` is a
// real, deterministic relative-density score: how many of the chapter's
// own real keywords/keyPhrases this sentence contains, normalized
// against whichever key sentence in this same chapter scores highest —
// never AI-scored, never fabricated.
export function buildSentenceAssets(blueprint: ChapterIntelligenceBlueprint): readonly SentenceAsset[] {
  const { keywords, keyPhrases, keySentences } = blueprint.readingAssets
  const objects = blueprint.learningObjects.objects
  const significantTerms = [...keywords, ...keyPhrases]

  const matchCounts = keySentences.map((sentence) => significantTerms.filter((term) => containsText(sentence, term)).length)
  const maxMatchCount = Math.max(1, ...matchCounts)

  return keySentences.map((sentence, index) => {
    const explanationReference = objects.find((object) => containsText(sentence, object.title))?.objectId ?? null
    return {
      keySentence: sentence,
      importance: Number(((matchCounts[index] ?? 0) / maxMatchCount).toFixed(3)),
      explanationReference,
    }
  })
}
