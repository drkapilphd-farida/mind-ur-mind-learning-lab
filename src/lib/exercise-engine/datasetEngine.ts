// Universal Intelligence Dataset Engine™
//
// High-level dataset query layer that sits above contentEngine.ts (Sprint 5A).
// contentEngine.ts handles individual dataset registration and CRUD.
// datasetEngine.ts handles CROSS-DATASET querying, session-aware item selection,
// recent-repeat avoidance, and the single master function every exercise calls.
//
// Exercises should never import raw data arrays. They call getNextExerciseContent()
// with a DatasetQuery and receive ContentItems — the source is transparent.

import type {
  ContentItem,
  ContentDataset,
  ContentType,
  DifficultyTier,
  DatasetCategory,
  DatasetQuery,
  Locale,
} from '@/types/exercise-engine'
import { listDatasets } from './contentEngine'
import { shuffleArray, pickItems } from './randomizationEngine'
import { DIFFICULTY_TIERS } from './difficultyEngine'

// ── Cross-dataset query helpers ───────────────────────────────────────────

// All items from all registered datasets matching a content type
export function getItemsByContentType(contentType: ContentType): ContentItem[] {
  return listDatasets()
    .filter((d) => d.contentType === contentType)
    .flatMap((d) => d.items)
}

// All items from all registered datasets for a given locale
export function getItemsByLanguage(locale: Locale): ContentItem[] {
  return listDatasets()
    .filter((d) => d.locale === locale)
    .flatMap((d) => d.items)
}

// All items from all registered datasets belonging to a category
// Items without categories are treated as uncategorised (not excluded)
export function getItemsByCategory(category: DatasetCategory): ContentItem[] {
  return listDatasets()
    .flatMap((d) => d.items)
    .filter((item) => {
      if (!item.categories) return false
      return item.categories.includes(category)
    })
}

// All items filtered by difficulty tier from all registered datasets
export function getItemsByDifficulty(
  difficulty: DifficultyTier,
  contentType?: ContentType,
): ContentItem[] {
  const datasets = contentType
    ? listDatasets().filter((d) => d.contentType === contentType)
    : listDatasets()
  return datasets.flatMap((d) => d.items).filter((item) => item.difficulty === difficulty)
}

// ── Single-dataset helpers ────────────────────────────────────────────────

// Get N random items from a specific dataset using a seed
export function getRandomItems(
  dataset: ContentDataset,
  count: number,
  seed: number,
): ContentItem[] {
  return pickItems(dataset.items, count, seed)
}

// Shuffle all items in a dataset deterministically
export function shuffleDataset(dataset: ContentDataset, seed: number): ContentItem[] {
  return shuffleArray(dataset.items, seed)
}

// ── Recent-repeat avoidance ───────────────────────────────────────────────

// Returns a pool where recently-seen items are deprioritised to the end.
// This never excludes items entirely (avoids empty results with small pools),
// just ensures the student sees fresh content first.
export function avoidRecentRepeats(
  items: ContentItem[],
  recentItemIds: string[],
  seed: number,
): ContentItem[] {
  const recentSet = new Set(recentItemIds)
  const fresh = items.filter((item) => !recentSet.has(item.id))
  const recent = items.filter((item) => recentSet.has(item.id))

  // Fresh items shuffled first, then recent items shuffled at the end
  return [
    ...shuffleArray(fresh, seed),
    ...shuffleArray(recent, seed + 1),
  ]
}

// ── Difficulty-aware item selection ──────────────────────────────────────

// Pick items at a requested difficulty tier. If there aren't enough items
// at that tier, backfill from adjacent tiers (nearest first).
//
// "Nearest first" must hold even when `count` asks for more than any one
// tier realistically supplies — a caller requesting a generous buffer
// (e.g. count: 200 against a 24-item curated tier) must never see that
// buffer silently pull in and shuffle together every other tier's content
// too. Each radius "ring" is picked (and only shuffled within itself)
// before the next ring is ever touched — found and fixed via a real bug:
// Progressive Chunk Reading's Level 1 (2-word chunks) rendered a 4-word
// medium-tier chunk mid-session, because the old implementation collected
// every tier into one flat array once the exact tier ran out, then
// shuffled that whole merged pool uniformly, destroying tier preference
// entirely rather than only backfilling the shortfall.
export function pickWithDifficultyFallback(
  items: ContentItem[],
  difficulty: DifficultyTier,
  count: number,
  seed: number,
): ContentItem[] {
  // Reuse the canonical tier order (includes elite/master) instead of a
  // local copy — a local 5-tier copy previously silently fell back to
  // 'beginner' content for elite/master requests (indexOf returned -1).
  const targetIdx = difficulty === 'adaptive' ? 2 : DIFFICULTY_TIERS.indexOf(difficulty)

  const picked: ContentItem[] = []
  const usedIds = new Set<string>()

  for (let radius = 0; picked.length < count; radius++) {
    if (radius > DIFFICULTY_TIERS.length) break
    const radii = radius === 0 ? [0] : [-radius, radius]
    const ringCandidates: ContentItem[] = []
    for (const delta of radii) {
      const t = DIFFICULTY_TIERS[targetIdx + delta]
      if (t !== undefined) {
        const matching = items.filter((item) => item.difficulty === t && !usedIds.has(item.id))
        ringCandidates.push(...matching)
      }
    }
    const stillNeeded = count - picked.length
    const ringPicked = pickItems(ringCandidates, stillNeeded, seed + radius)
    for (const item of ringPicked) usedIds.add(item.id)
    picked.push(...ringPicked)
  }

  return picked
}

// ── Master query function ─────────────────────────────────────────────────

// The single function every exercise calls. Never import raw word lists.
// Returns ContentItems ready to use as exercise stimuli.
//
// Usage:
//   const items = getNextExerciseContent({
//     contentType: 'word',
//     locale: 'en',
//     difficulty: 'easy',
//     count: 20,
//     excludeIds: session.recentlyShownIds,
//     seed: engine.sessionSeed,
//   })
export function getNextExerciseContent(query: DatasetQuery): ContentItem[] {
  const { contentType, category, locale, difficulty, count, excludeIds = [], seed } = query

  // 1. Gather candidates from the registry
  let pool: ContentItem[] = listDatasets().flatMap((d) => d.items)

  // 2. Apply filters
  if (contentType !== undefined) pool = pool.filter((i) => {
    // Find which dataset this item belongs to by checking the dataset's contentType
    const matchingDatasets = listDatasets().filter((d) => d.contentType === contentType)
    return matchingDatasets.some((d) => d.items.includes(i))
  })
  if (locale !== undefined) pool = pool.filter((i) => i.locale === locale)
  if (category !== undefined) {
    pool = pool.filter((i) => i.categories?.includes(category) ?? false)
  }

  // 3. Deprioritise recently-shown items
  const prioritised = avoidRecentRepeats(pool, excludeIds, seed)

  // 4. Select by difficulty with fallback
  return difficulty !== undefined
    ? pickWithDifficultyFallback(prioritised, difficulty, count, seed)
    : pickItems(prioritised, count, seed)
}

// ── Pool-scoped query (Sprint QSR-2.6 — Quantum Experience Parity™) ───────

// The same real selection pipeline getContentForExercise runs (recent-repeat
// avoidance, then tier-fallback picking) but over a caller-supplied pool
// instead of the global dataset registry — the one seam a mission needs to
// draw from real, non-registry content (e.g. a document's own generated
// chunks) while reusing every other piece of the mission unmodified.
export function getContentFromPool(
  pool: readonly ContentItem[],
  params: {
    difficulty: DifficultyTier
    count: number
    excludeIds?: string[]
    seed: number
  },
): ContentItem[] {
  const { difficulty, count, excludeIds = [], seed } = params
  const prioritised = avoidRecentRepeats([...pool], excludeIds, seed)
  return pickWithDifficultyFallback(prioritised, difficulty, count, seed)
}

// ── Optimised content-type query ──────────────────────────────────────────

// Faster path when the caller knows exactly which content type they need.
// Avoids scanning all datasets — directly finds matching ones.
export function getContentForExercise(params: {
  contentType: ContentType
  locale: Locale
  difficulty: DifficultyTier
  count: number
  excludeIds?: string[]
  seed: number
}): ContentItem[] {
  const { contentType, locale, difficulty, count, excludeIds = [], seed } = params

  const matchingDatasets = listDatasets().filter(
    (d) => d.contentType === contentType && d.locale === locale,
  )
  const pool = matchingDatasets.flatMap((d) => d.items)
  return getContentFromPool(pool, { difficulty, count, excludeIds, seed })
}

// Re-export types needed by consumers so they only need one import
export type { ContentItem, ContentDataset, DatasetQuery, DatasetCategory }
