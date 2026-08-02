// Visual Intelligence Lab™ — Image Persistence Engine™, Sprint 3B.
// Deterministic category rotation — never plain random category selection.
// completedSessionCount is the only state this needs, and it's already a
// real number sitting in the existing image_persistence_sessions table
// (no new column, no new table).

import { CATEGORY_ROTATION_ORDER, getImagesByCategory, type ImageCategory, type LibraryImage } from './imageLibrary'

export function getCategoryForSessionIndex(completedSessionCount: number): ImageCategory {
  const index = completedSessionCount % CATEGORY_ROTATION_ORDER.length
  return CATEGORY_ROTATION_ORDER[index]!
}

// 0-based position within the current 5-category cycle (0-4) — used by the
// completion screen's Mind Score (cycle progress), not the learner's
// subjective observation outcome.
export function getCycleIndex(completedSessionCount: number): number {
  return completedSessionCount % CATEGORY_ROTATION_ORDER.length
}

export function selectImageForSession(
  completedSessionCount: number,
  recentImageIds: readonly string[],
  rng: () => number = Math.random,
): LibraryImage {
  const category = getCategoryForSessionIndex(completedSessionCount)
  const candidates = getImagesByCategory(category)
  const notRecentlyUsed = candidates.filter((img) => !recentImageIds.includes(img.id))
  const pool = notRecentlyUsed.length > 0 ? notRecentlyUsed : candidates
  const index = Math.floor(rng() * pool.length)
  return pool[index]!
}
