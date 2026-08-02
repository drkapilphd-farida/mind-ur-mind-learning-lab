import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { LearningAssetObject } from '../types/LearningAssetObject'
import { containsText, estimateReadingSeconds, paragraphIdAt } from './textHelpers'

// "Enhance every existing Learning Object." Takes each real
// `BlueprintLearningObject` from a chapter's own already-real Blueprint
// and rolls it up into a richer, reusable `LearningAssetObject` — every
// new field is either a real pass-through, a real relevance filter over
// the same Blueprint's own `readingAssets`, or a real directional split
// of the same Blueprint's own `knowledgeGraph.relationships`. Zero new
// AI, zero re-computation of anything Sprint-1 already computed.
export function enhanceLearningObjects(blueprint: ChapterIntelligenceBlueprint): readonly LearningAssetObject[] {
  const { chapterId } = blueprint.header
  const { relationships } = blueprint.knowledgeGraph
  const { keywords, keyPhrases, keySentences, keyParagraphs } = blueprint.readingAssets

  return blueprint.learningObjects.objects.map((object) => {
    const objectText = [object.title, object.definition, object.explanation, ...object.examples].filter((value): value is string => Boolean(value)).join(' ')

    // Real directional split of the already-real `'builds-upon'` edge:
    // source builds upon target, so target is the prerequisite for this
    // object when this object is the source, and any other object whose
    // edge targets THIS object is a dependent of it.
    const prerequisiteObjects = relationships.filter((edge) => edge.type === 'builds-upon' && edge.sourceObjectId === object.objectId).map((edge) => edge.targetObjectId)
    const dependentObjects = relationships.filter((edge) => edge.type === 'builds-upon' && edge.targetObjectId === object.objectId).map((edge) => edge.sourceObjectId)

    const keyParagraphIds = keyParagraphs.reduce<string[]>((ids, paragraph, index) => {
      if (containsText(paragraph, object.title)) ids.push(paragraphIdAt(chapterId, index))
      return ids
    }, [])

    return {
      objectId: object.objectId,
      title: object.title,
      type: object.type,
      importance: object.importance,
      difficulty: object.difficulty,
      estimatedLearningTime: estimateReadingSeconds(objectText),
      definition: object.definition,
      explanation: object.explanation,
      examples: object.examples,
      misconceptions: object.misconceptions,
      keywords: keywords.filter((keyword) => containsText(objectText, keyword)),
      keyPhrases: keyPhrases.filter((phrase) => containsText(objectText, phrase)),
      keySentences: keySentences.filter((sentence) => containsText(sentence, object.title)),
      keyParagraphIds,
      relatedObjects: object.relatedObjects,
      prerequisiteObjects,
      dependentObjects,
    }
  })
}
