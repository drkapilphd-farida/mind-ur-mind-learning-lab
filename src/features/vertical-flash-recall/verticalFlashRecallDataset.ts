// Vertical Flash Recall & Retention Sprint™ — a companion training
// modality to Flash Recall & Retention Sprint™, deliberately built on the
// exact same 25-module content library rather than a duplicated copy —
// the spec explicitly calls for reusing "the exact same 25-module content
// library," and duplicating roughly 7,000 words of real, hand-authored
// content across two feature folders would be wasteful and a genuine
// maintenance hazard (a fix or fact-check in one place silently not
// applying to the other). Content types and the passage/question data
// itself are therefore imported directly, a deliberate single source of
// truth — unlike the "own-copy" convention this app uses for small
// self-contained *logic* (PRNGs, audio recipes, chime synths), which
// exists precisely to avoid coupling unrelated features together, not to
// justify duplicating an entire content library.
//
// The non-repeat *rotation* is intentionally its own copy with its own
// localStorage key, though: Vertical Flash Recall and horizontal Flash
// Recall Sprint are different practice modalities a learner chooses
// between independently, so each tracks its own "don't repeat the last
// one" history rather than sharing a single pointer that would make one
// mode's reading silently skip a module for the other.
export {
  type FlashRecallSprintCategory,
  type FlashRecallSprintQuizQuestion,
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
  buildWordsForCategory,
} from '@/features/flash-recall-sprint/flashRecallSprintDataset'

import { FLASH_RECALL_SPRINT_CATEGORIES, type FlashRecallSprintCategory } from '@/features/flash-recall-sprint/flashRecallSprintDataset'

const LAST_CATEGORY_STORAGE_KEY = 'qsr-vertical-flash-recall-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses (Vertical Chunk Sliding, Flash Recall Sprint)
// — client-only, called only from a useEffect in the Experience
// orchestrator, never a lazy useState initializer, so the server-rendered
// 'settings' phase and the client's first paint always match.
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
      // Best-effort only — a session still works perfectly without
      // non-repeat tracking, it just can't remember last time's pick.
    }
  }

  return picked
}
