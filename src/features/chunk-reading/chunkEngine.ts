// Chunk Engine™ — splits sentences into fixed-size word groups and builds SessionItems.
// This is the core transformation that makes Chunk Reading different from Flash Words:
// instead of one word, the student sees N words simultaneously.

import type { SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import type { ContentItem } from '@/types/exercise-engine'

export type ChunkItem = {
  text: string        // e.g. "the quick brown"
  wordCount: number
  sourceId: string    // which sentence this came from
  position: number    // chunk index within the sentence
}

// ── Text splitting ────────────────────────────────────────────────────────────

// Split a sentence into fixed-size word chunks.
// The final chunk may be smaller if the sentence doesn't divide evenly.
export function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const group = words.slice(i, i + wordsPerChunk)
    // Only include chunks that meet the minimum size (avoid 1-word trailing chunks)
    if (group.length >= Math.max(2, Math.floor(wordsPerChunk * 0.6))) {
      chunks.push(group.join(' '))
    }
  }
  return chunks
}

// ── SessionItem generation ───────────────────────────────────────────────────

// Build a full session of chunk SessionItems from a pool of sentence ContentItems.
// Each stimulus is a multi-word chunk; options are 3 distractor chunks from other sentences.
export function buildChunkItems(
  sentences: ContentItem[],
  wordsPerChunk: number,
  targetCount: number,
  seed: number,
): SessionItem[] {
  if (sentences.length === 0) return []

  // Extract all chunks from all sentences
  const allChunks: ChunkItem[] = sentences.flatMap((s) =>
    splitIntoChunks(s.content, wordsPerChunk).map((text, pos) => ({
      text,
      wordCount: text.split(/\s+/).length,
      sourceId: s.id,
      position: pos,
    })),
  )

  if (allChunks.length === 0) return []

  // Shuffle and pick target count
  const shuffled = shuffleArray(allChunks, seed)
  const stimuli = shuffled.slice(0, Math.min(targetCount, shuffled.length))
  const distractorPool = shuffled.slice(stimuli.length)

  return stimuli.map((chunk, i) => {
    const itemSeed = seed + i * 31337

    // Pick 3 distractors: prefer chunks from different sentences + same word count
    const sameSizeCandidates = distractorPool.filter(
      (d) => d.sourceId !== chunk.sourceId && d.wordCount === chunk.wordCount,
    )
    const anyOtherCandidates = distractorPool.filter((d) => d.sourceId !== chunk.sourceId)

    const pool = sameSizeCandidates.length >= 3 ? sameSizeCandidates : anyOtherCandidates
    const distractors = pickItems(pool, 3, itemSeed).map((d) => d.text)

    // Pad with fallbacks if not enough distractors
    while (distractors.length < 3) {
      const fallback = allChunks.find(
        (d) => d.text !== chunk.text && !distractors.includes(d.text),
      )
      distractors.push(fallback?.text ?? chunk.text.split(' ').reverse().join(' '))
    }

    const rawOptions = [chunk.text, ...distractors.slice(0, 3)]
    const sortSeed = (itemSeed) % 4
    const options = [
      rawOptions[sortSeed % 4] ?? chunk.text,
      rawOptions[(sortSeed + 1) % 4] ?? distractors[0] ?? 'a b c',
      rawOptions[(sortSeed + 2) % 4] ?? distractors[1] ?? 'd e f',
      rawOptions[(sortSeed + 3) % 4] ?? distractors[2] ?? 'g h i',
    ]
    const correctIndex = options.indexOf(chunk.text)

    return {
      id: `chunk-${chunk.sourceId}-${chunk.position}-${i}`,
      stimulus: chunk.text,
      stimulusLabel: `Chunk: ${chunk.text}`,
      options: options.slice(0, 4),
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    }
  })
}

// ── Analytics helpers ─────────────────────────────────────────────────────────

export function computeChunkMetrics(
  items: SessionItem[],
  correctCount: number,
): {
  accuracyPercent: number
  totalChunks: number
  avgWordCount: number
} {
  const totalChunks = items.length
  const avgWordCount = totalChunks > 0
    ? Math.round(items.reduce((sum, item) => sum + item.stimulus.split(/\s+/).length, 0) / totalChunks)
    : 0
  const accuracyPercent = totalChunks > 0 ? Math.round((correctCount / totalChunks) * 100) : 0
  return { accuracyPercent, totalChunks, avgWordCount }
}
