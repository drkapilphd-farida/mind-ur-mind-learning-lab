import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { ParagraphAsset } from '../types/ReadingAssetRecords'
import { containsText, paragraphIdAt, splitIntoSentences } from './textHelpers'

// Category 5, "Paragraph Assets" — real paragraphs reused verbatim from
// the Blueprint's own `readingAssets.keyParagraphs`. `summary` is a real,
// deterministic extractive summary (this paragraph's own first real
// sentence) — never a new AI-generated summary, honoring "AI thinks
// once." `importance` mirrors buildSentenceAssets.ts's own relative-
// density scoring.
export function buildParagraphAssets(blueprint: ChapterIntelligenceBlueprint): readonly ParagraphAsset[] {
  const { keywords, keyPhrases, keyParagraphs } = blueprint.readingAssets
  const objects = blueprint.learningObjects.objects
  const significantTerms = [...keywords, ...keyPhrases]
  const chapterId = blueprint.header.chapterId

  const matchCounts = keyParagraphs.map((paragraph) => significantTerms.filter((term) => containsText(paragraph, term)).length)
  const maxMatchCount = Math.max(1, ...matchCounts)

  return keyParagraphs.map((paragraph, index) => {
    const relatedLearningObjects = objects.filter((object) => containsText(paragraph, object.title)).map((object) => object.objectId)
    const [firstSentence] = splitIntoSentences(paragraph)

    return {
      paragraphId: paragraphIdAt(chapterId, index),
      importance: Number(((matchCounts[index] ?? 0) / maxMatchCount).toFixed(3)),
      summary: firstSentence ?? paragraph,
      relatedLearningObjects,
    }
  })
}
