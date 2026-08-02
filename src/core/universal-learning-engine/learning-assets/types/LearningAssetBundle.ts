import type { LearningAssetObject } from './LearningAssetObject'
import type { KeywordAsset, WordAsset, PhraseAsset, SentenceAsset, ParagraphAsset } from './ReadingAssetRecords'

// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. One bundle per chapter (= per chunk, same granularity
// Sprint-1 already established) — generated once from that chapter's
// real, already-stored `ChapterIntelligenceBlueprint`, cached, reused
// forever. Nothing consumes this yet; that is Sprint-3's job.
export type LearningAssetBundle = {
  bundleId: string
  documentId: string
  chapterId: string
  // Real: the chapter's own real `content_hash` at generation time —
  // matches the same hash `chapter_intelligence_blueprints` already
  // stores, so a Blueprint that hasn't changed never regenerates its
  // assets either (see persistence/learningAssetBundles.ts).
  version: number
  learningObjects: readonly LearningAssetObject[]
  keywordAssets: readonly KeywordAsset[]
  wordAssets: readonly WordAsset[]
  phraseAssets: readonly PhraseAsset[]
  sentenceAssets: readonly SentenceAsset[]
  paragraphAssets: readonly ParagraphAsset[]
  createdAt: string
}
