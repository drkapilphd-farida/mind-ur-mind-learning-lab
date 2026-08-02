import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import type { LearningAssetBundle } from './types/LearningAssetBundle'
import { enhanceLearningObjects } from './internal/enhanceLearningObjects'
import { buildKeywordAssets } from './internal/buildKeywordAssets'
import { buildWordAssets } from './internal/buildWordAssets'
import { buildPhraseAssets } from './internal/buildPhraseAssets'
import { buildSentenceAssets } from './internal/buildSentenceAssets'
import { buildParagraphAssets } from './internal/buildParagraphAssets'

export type BuildLearningAssetsOptions = {
  now?: () => Date
  idFactory?: () => string
}

// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. The one real orchestrator. Takes ONLY an already-real,
// already-stored `ChapterIntelligenceBlueprint` (Sprint-1's own output)
// — never raw chunks, never the knowledge graph or learning analysis
// directly, since every real signal this sprint needs (readingAssets,
// learningObjects, knowledgeGraph.relationships) is already inside the
// Blueprint. Zero new AI calls: "AI thinks once. Blueprint stores
// intelligence. Learning Assets create reusable learning experiences."
export function buildLearningAssets(blueprint: ChapterIntelligenceBlueprint, options: BuildLearningAssetsOptions = {}): LearningAssetBundle {
  const now = options.now ?? (() => new Date())
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())

  return {
    bundleId: idFactory(),
    documentId: blueprint.header.documentId,
    chapterId: blueprint.header.chapterId,
    version: 1,
    learningObjects: enhanceLearningObjects(blueprint),
    keywordAssets: buildKeywordAssets(blueprint),
    wordAssets: buildWordAssets(blueprint),
    phraseAssets: buildPhraseAssets(blueprint),
    sentenceAssets: buildSentenceAssets(blueprint),
    paragraphAssets: buildParagraphAssets(blueprint),
    createdAt: now().toISOString(),
  }
}
