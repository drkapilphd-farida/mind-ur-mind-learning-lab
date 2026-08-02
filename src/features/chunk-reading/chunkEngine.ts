// Chunk Generation Engine™ — builds SessionItems directly from the curated
// chunk dataset. There is no splitting step: every chunk is already a
// complete, independently meaningful 2–6 word unit (see chunkDataset.ts),
// so "generation" here means picking, validating, and pairing — never
// deriving a stimulus from an arbitrary position within longer text.
//
// Pipeline: Dataset (curated chunks) → Visual Width Validator → pick
// stimuli + same-length distractors from the pool → Typography Engine
// (FitText, via ChoiceGrid/FlashStimulus) → Renderer.

import type { ContentItem, SessionItem } from '@/types/exercise-engine'
import { pickItems, shuffleArray } from '@/lib/exercise-engine/randomizationEngine'
import { isVisuallyValid } from '@/lib/exercise-engine/visualWidthValidator'

export type ChunkItem = {
  text: string
  wordCount: number
}

// Build a full session of chunk SessionItems from a pool of curated chunk
// ContentItems. Distractors are drawn from other chunks in the pool at the
// same word count — every option is independently a real, meaningful
// chunk, never a fabricated fallback. If the pool can't supply 3 distinct
// distractors for a stimulus, that stimulus is skipped rather than paired
// with a nonsense option — "choose another valid chunk," never patch with
// typography or invented text.
export function buildChunkItems(
  chunks: ContentItem[],
  targetCount: number,
  seed: number,
): SessionItem[] {
  if (chunks.length === 0) return []

  const validChunks: ChunkItem[] = chunks
    .map((c) => ({ text: c.content, wordCount: c.content.split(/\s+/).filter(Boolean).length }))
    .filter((chunk) => isVisuallyValid(chunk.text, 'option'))

  if (validChunks.length === 0) return []

  const shuffled = shuffleArray(validChunks, seed)
  const stimuli = shuffled.slice(0, Math.min(targetCount, shuffled.length))

  const items: SessionItem[] = []

  stimuli.forEach((chunk, i) => {
    const itemSeed = seed + i * 31337

    const sameSizeCandidates = validChunks.filter(
      (d) => d.text !== chunk.text && d.wordCount === chunk.wordCount,
    )
    const anyOtherCandidates = validChunks.filter((d) => d.text !== chunk.text)
    const pool = sameSizeCandidates.length >= 3 ? sameSizeCandidates : anyOtherCandidates
    const distractors = pickItems(pool, 3, itemSeed).map((d) => d.text)

    if (distractors.length < 3) return

    const options = shuffleArray([chunk.text, ...distractors], itemSeed)
    const correctIndex = options.indexOf(chunk.text)

    items.push({
      id: `chunk-${i}-${itemSeed}`,
      stimulus: chunk.text,
      stimulusLabel: `Chunk: ${chunk.text}`,
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
    })
  })

  return items
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
