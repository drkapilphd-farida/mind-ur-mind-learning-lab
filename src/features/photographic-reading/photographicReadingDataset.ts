// Photographic Reading™ — shares the exact same 25-module content library
// Flash Recall & Retention Sprint uses (own single source of truth for
// this content, per this app's established pattern — see
// verticalFlashRecallDataset.ts / subvocalizationDestroyerDataset.ts for
// the identical precedent). What's genuinely different here is how the
// content is chunked: not single RSVP words, but 3-5 word "spatial
// clusters" — small enough to take in in a single glance from any screen
// corner, large enough to carry real meaning.
export {
  type FlashRecallSprintCategory,
  type FlashRecallSprintQuizQuestion,
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
} from '@/features/flash-recall-sprint/flashRecallSprintDataset'

import { FLASH_RECALL_SPRINT_CATEGORIES, type FlashRecallSprintCategory } from '@/features/flash-recall-sprint/flashRecallSprintDataset'

// Splits a sentence into 3-5 word spatial clusters. Greedy from the left at
// `maxSize`, but shrinks the current cluster whenever taking the max would
// leave a trailing remainder smaller than `minSize` (a lone 1-2 word
// orphan) — own-copy of the exact algorithm splitIntoChunks in Dynamic
// Chunk Sliding proved out, just tuned to a slightly larger cluster size
// (3-5 rather than 3-4), since a spatial cluster needs to read as one
// coherent glance-sized idea, not a bare word pair. Some totals can't be
// cleanly decomposed into only 3-5s at all — in that rare, unavoidable
// case the remainder is kept together as one cluster outside the normal
// range rather than emitting an orphan fragment.
export function splitIntoSpatialClusters(text: string, minSize = 3, maxSize = 5): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const clusters: string[] = []
  let index = 0
  while (index < words.length) {
    const remaining = words.length - index
    let size = Math.min(maxSize, remaining)
    const leftoverAfter = remaining - size
    if (leftoverAfter > 0 && leftoverAfter < minSize) {
      size = remaining - minSize
    }
    if (size < minSize) {
      size = remaining
    }
    clusters.push(words.slice(index, index + size).join(' '))
    index += size
  }
  return clusters
}

export function buildSpatialClustersForCategory(category: FlashRecallSprintCategory): string[] {
  return category.sentences.flatMap((sentence) => splitIntoSpatialClusters(sentence))
}

// Own storage key, independent of Flash Recall Sprint's, Vertical Flash
// Recall's, and Subvocalization Destroyer's own rotation keys — the shared
// content library is a single source of truth, but each exercise's "don't
// repeat what I just showed you" memory is its own, so a user working
// through multiple exercises in one day never has one silently skip a
// module because a sibling exercise already claimed it.
const LAST_CATEGORY_STORAGE_KEY = 'qsr-photographic-reading-last-category'

export function pickSessionCategory(): FlashRecallSprintCategory {
  const categories = FLASH_RECALL_SPRINT_CATEGORIES
  let lastId: string | null = null
  if (typeof window !== 'undefined') {
    try {
      lastId = localStorage.getItem(LAST_CATEGORY_STORAGE_KEY)
    } catch {
      lastId = null
    }
  }
  const pool = lastId === null ? categories : categories.filter((category) => category.id !== lastId)
  const eligiblePool = pool.length > 0 ? pool : categories
  const picked = eligiblePool[Math.floor(Math.random() * eligiblePool.length)] ?? categories[0]!
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LAST_CATEGORY_STORAGE_KEY, picked.id)
    } catch {
      // Ignore write failures (e.g. private-browsing storage caps) — the
      // session still works, it just loses the not-last-time memory.
    }
  }
  return picked
}
