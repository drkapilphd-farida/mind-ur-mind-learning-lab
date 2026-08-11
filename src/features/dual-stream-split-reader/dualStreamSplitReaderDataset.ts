// Dual-Stream Split Reader™ — shares the exact same 25-module content
// library Flash Recall & Retention Sprint uses (own single source of truth
// for this content, per this app's established pattern — see
// verticalFlashRecallDataset.ts / subvocalizationDestroyerDataset.ts /
// photographicReadingDataset.ts for the identical precedent). What's
// genuinely different here is how the content is split: not one stream,
// but two synchronized ones — every category's full word list is cut into
// fixed-size groups, and each group is itself split into a left half and a
// right half, so the two streams always advance in lockstep, one pair per
// tick, for the whole session.
export {
  type FlashRecallSprintCategory,
  type FlashRecallSprintQuizQuestion,
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
} from '@/features/flash-recall-sprint/flashRecallSprintDataset'

import { FLASH_RECALL_SPRINT_CATEGORIES, type FlashRecallSprintCategory } from '@/features/flash-recall-sprint/flashRecallSprintDataset'

// Words per synchronized pair, split as evenly as possible between the two
// streams (3 left / 3 right at this size). Deliberately NOT sentence-
// bound — chunking the category's full word stream at a fixed size (rather
// than splitting each sentence individually) guarantees every pair is a
// clean, non-empty, roughly-equal split with no orphan fragments, which a
// sentence-by-sentence split couldn't promise for short sentences.
const DUAL_STREAM_GROUP_SIZE = 6

export type DualStreamPair = { leftUnits: string[]; rightUnits: string[] }

// Splits a category's full word stream into synchronized left/right pairs.
// Any final remainder too small to produce a non-empty half on both sides
// (e.g. a single trailing word) is dropped rather than shown as an
// awkward, one-sided orphan pair — the same "unavoidable remainder"
// tradeoff splitIntoChunks (Dynamic Chunk Sliding) already documents.
export function buildDualStreamsForCategory(category: FlashRecallSprintCategory): DualStreamPair {
  const words = category.sentences.join(' ').trim().split(/\s+/).filter(Boolean)
  const leftUnits: string[] = []
  const rightUnits: string[] = []

  for (let index = 0; index < words.length; index += DUAL_STREAM_GROUP_SIZE) {
    const group = words.slice(index, index + DUAL_STREAM_GROUP_SIZE)
    const splitPoint = Math.ceil(group.length / 2)
    const left = group.slice(0, splitPoint)
    const right = group.slice(splitPoint)
    if (left.length === 0 || right.length === 0) continue
    leftUnits.push(left.join(' '))
    rightUnits.push(right.join(' '))
  }

  return { leftUnits, rightUnits }
}

// Own storage key, independent of every other reused-content mode's own
// rotation key — the shared content library is a single source of truth,
// but each exercise's "don't repeat what I just showed you" memory is its
// own.
const LAST_CATEGORY_STORAGE_KEY = 'qsr-dual-stream-split-reader-last-category'

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
