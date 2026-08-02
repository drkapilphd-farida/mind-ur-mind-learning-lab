import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import type { ReadingAssets } from '../types/ChapterIntelligenceBlueprint'

// A plain, deterministic sentence split — no NLP library, no AI call.
// Good enough for "does this real sentence contain a real keyword,"
// which is all keySentences needs.
function splitIntoSentences(content: string): readonly string[] {
  return content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
}

const MAX_KEY_SENTENCES = 5

// Section 4, "Reading Assets" — keywords/keyPhrases are real, direct
// reuse of UCE-3B's already-real `ChunkEnrichment` fields; keySentences/
// keyParagraphs are deterministic picks over the chunk's own real
// content/blocks — never AI-generated, never fabricated. Per this
// sprint's explicit scope, Word Chunks/Phrase Chunks are NOT built here
// (Sprint-2's job).
export function aggregateReadingAssets(chunk: LearningChunk): ReadingAssets {
  const keywords = chunk.enrichment.keywords ?? []
  const keyPhrases = chunk.enrichment.importantTerms ?? []

  const significantTerms = [...keywords, ...keyPhrases, ...(chunk.enrichment.definitions ?? []).map((entry) => entry.term)].map((term) => term.toLowerCase())

  const keySentences =
    significantTerms.length > 0
      ? splitIntoSentences(chunk.content)
          .filter((sentence) => significantTerms.some((term) => sentence.toLowerCase().includes(term)))
          .slice(0, MAX_KEY_SENTENCES)
      : []

  const keyParagraphs = chunk.blocks.filter((block): block is Extract<typeof block, { type: 'paragraph' }> => block.type === 'paragraph').map((block) => block.text)

  return { keywords, keyPhrases, keySentences, keyParagraphs }
}
