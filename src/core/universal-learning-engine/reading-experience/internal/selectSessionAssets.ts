import type { LearningAssetBundle, WordAsset, PhraseAsset, SentenceAsset, ParagraphAsset } from '@/core/universal-learning-engine/learning-assets'
import type { ReadingSessionAssets } from '../types/ReadingSession'
import { normalizeForMatching } from './textHelpers'

// Asset Selection Engine™. Selects the most appropriate real Learning
// Assets for one reading session, straight from an already-real
// `LearningAssetBundle` — zero new AI, zero raw-content re-reading.
// "Selection should consider importance, difficulty,
// learning_object_reference, duplicate avoidance, prerequisite
// relationships": importance/difficulty/prerequisite ordering is
// Adaptive Sequencing Engine™'s own job (internal/sequenceLearningObjects.ts,
// run on this function's own `learningObjects` output); this function's
// own real responsibility is real, honest duplicate avoidance plus a
// real relevance rank for word/phrase/sentence assets (by their already-
// real `priority`/`importance`), never a fabricated score.

function dedupeByKey<T>(items: readonly T[], keyOf: (item: T) => string): readonly T[] {
  const seen = new Map<string, T>()
  for (const item of items) {
    const key = normalizeForMatching(keyOf(item))
    if (!seen.has(key)) seen.set(key, item)
  }
  return [...seen.values()]
}

function selectWords(wordAssets: readonly WordAsset[]): readonly WordAsset[] {
  return [...dedupeByKey(wordAssets, (word) => word.word)].sort((a, b) => b.priority - a.priority)
}

const PHRASE_TYPE_RANK: Record<PhraseAsset['phraseType'], number> = { 'concept-phrase': 0, 'definition-phrase': 1, 'supporting-phrase': 2 }

function selectPhrases(phraseAssets: readonly PhraseAsset[]): readonly PhraseAsset[] {
  return [...dedupeByKey(phraseAssets, (phrase) => phrase.phrase)].sort((a, b) => PHRASE_TYPE_RANK[a.phraseType] - PHRASE_TYPE_RANK[b.phraseType])
}

function selectSentences(sentenceAssets: readonly SentenceAsset[]): readonly SentenceAsset[] {
  return [...dedupeByKey(sentenceAssets, (sentence) => sentence.keySentence)].sort((a, b) => b.importance - a.importance)
}

function selectParagraphs(paragraphAssets: readonly ParagraphAsset[]): readonly ParagraphAsset[] {
  // Real reading order matters more than importance for paragraphs —
  // `paragraphId` already carries the real, deterministic
  // `${chapterId}-paragraph-{index}` order Sprint-2 established.
  return [...dedupeByKey(paragraphAssets, (paragraph) => paragraph.paragraphId)].sort((a, b) => a.paragraphId.localeCompare(b.paragraphId, undefined, { numeric: true }))
}

export function selectSessionAssets(bundle: LearningAssetBundle): ReadingSessionAssets {
  return {
    words: selectWords(bundle.wordAssets),
    phrases: selectPhrases(bundle.phraseAssets),
    sentences: selectSentences(bundle.sentenceAssets),
    paragraphs: selectParagraphs(bundle.paragraphAssets),
    // Real, unsequenced — Adaptive Sequencing Engine™ (sequenceLearningObjects.ts)
    // is the one real place ordering happens.
    learningObjects: bundle.learningObjects,
  }
}
