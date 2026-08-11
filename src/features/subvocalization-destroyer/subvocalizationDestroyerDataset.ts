// Subvocalization Destroyer™ — an ultra-high-speed True RSVP training
// modality built on the exact same 25-module content library as Flash
// Recall & Retention Sprint™, per the spec's explicit "shared 25 rich
// modules integration." Content types and the passage/question data
// itself are imported directly, a deliberate single source of truth —
// duplicating roughly 7,000 words of real, hand-authored content across
// feature folders would be wasteful and a genuine maintenance hazard (a
// fix or fact-check in one place silently not applying to the other).
// This mirrors Vertical Flash Recall's own identical re-export pattern
// exactly (see verticalFlashRecallDataset.ts's own doc comment for the
// full rationale) — unlike the "own-copy" convention this app uses for
// small self-contained *logic* (PRNGs, audio recipes), which exists to
// avoid coupling unrelated features together, not to justify duplicating
// an entire content library.
//
// The non-repeat *rotation* is intentionally its own copy with its own
// localStorage key, though: Subvocalization Destroyer, Flash Recall
// Sprint, and Vertical Flash Recall are different practice modalities a
// learner chooses between independently, so each tracks its own "don't
// repeat the last one" history rather than sharing a single pointer that
// would make one mode's reading silently skip a module for the others.
export {
  type FlashRecallSprintCategory,
  type FlashRecallSprintQuizQuestion,
  FLASH_RECALL_SPRINT_CATEGORIES,
  TOTAL_FLASH_RECALL_SPRINT_CATEGORIES,
  buildWordsForCategory,
} from '@/features/flash-recall-sprint/flashRecallSprintDataset'

import { FLASH_RECALL_SPRINT_CATEGORIES, type FlashRecallSprintCategory } from '@/features/flash-recall-sprint/flashRecallSprintDataset'

const LAST_CATEGORY_STORAGE_KEY = 'qsr-subvocalization-destroyer-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses (Vertical Chunk Sliding, Flash Recall Sprint,
// Vertical Flash Recall) — client-only, called only from a useEffect in
// the Experience orchestrator, never a lazy useState initializer, so the
// server-rendered 'settings' phase and the client's first paint always
// match before this ever runs.
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
