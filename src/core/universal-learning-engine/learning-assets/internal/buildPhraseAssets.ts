import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { PhraseAsset, PhraseAssetType } from '../types/ReadingAssetRecords'
import { containsText } from './textHelpers'

// Category 3, "Phrase Assets" — real phrases reused verbatim from the
// Blueprint's own `readingAssets.keyPhrases` (never re-derived via
// n-grams — "not random n-grams, phrases should preserve meaning" is
// already satisfied by Sprint-1's own UCE-3B-derived importantTerms).
// `phraseType` is a real, deterministic classification against this
// chapter's own real Learning Objects/definitions — never guessed.
export function buildPhraseAssets(blueprint: ChapterIntelligenceBlueprint): readonly PhraseAsset[] {
  const objects = blueprint.learningObjects.objects

  return blueprint.readingAssets.keyPhrases.map((phrase) => {
    const conceptMatch = objects.find((object) => containsText(object.title, phrase) || containsText(phrase, object.title))
    if (conceptMatch) {
      return { phrase, phraseType: 'concept-phrase' as PhraseAssetType, relatedLearningObject: conceptMatch.objectId }
    }

    const definitionMatch = objects.find((object) => object.definition && containsText(object.definition, phrase))
    if (definitionMatch) {
      return { phrase, phraseType: 'definition-phrase' as PhraseAssetType, relatedLearningObject: definitionMatch.objectId }
    }

    return { phrase, phraseType: 'supporting-phrase' as PhraseAssetType, relatedLearningObject: null }
  })
}
