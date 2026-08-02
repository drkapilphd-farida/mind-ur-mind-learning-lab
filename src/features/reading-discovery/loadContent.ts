// Reading Discovery™ content loader.
//
// Every piece of content is fetched from the platform's existing Universal
// Intelligence Dataset™ (getContentForExercise, in datasetEngine.ts) at the
// caller-supplied Adaptive Difficulty Engine™ tier. Side-effect imports
// below register the word/chunk datasets this module queries (word-flash's
// and chunk-reading's — reused as-is) plus the two new lanes this feature
// needed (sentence, paragraph — see their own files for why those two are
// genuinely new, not duplicates of anything).
//
// Reading Runtime Engine™ (Sprint-2 Part-2) — `loadReadingDiscoveryContent`
// (the old single-blob-per-tier loader, one target word/one sentence/one
// paragraph) and its Foundation-sprint `readingStaticContentProvider` wrapper
// are removed: the new continuous multi-item runtime
// (`localSprintContentProvider.ts`) fetches many real items per Sprint, not
// one blob — confirmed no other real caller of either remains. Only the
// real, reused `pickUniqueByContent` dedup-by-text helper survives, now the
// shared real content-fetching primitive both this file's own callers (none
// currently) and `localSprintContentProvider.ts` can build on.

import '@/features/flash-intelligence/wordFlashDataset'
import '@/features/chunk-reading/chunkDataset'
import './sentenceDataset'
import './paragraphDataset'
import { getContentForExercise } from '@/lib/exercise-engine/datasetEngine'
import type { ContentItem, ContentType, DifficultyTier } from '@/types/exercise-engine'

const LOCALE = 'en' as const

// getContentForExercise's excludeIds only dedupes by id — but two of this
// platform's separately-authored word datasets sometimes register the same
// word text under different ids (e.g. "calm" exists in both the word-flash
// pool and the foundation pool). Left unhandled, that can surface the same
// word twice in one real session. This tracks content text (not just id)
// across every pick made during one caller's run, over-fetching a small
// buffer so a few text collisions still leave enough items to reach `count`.
export function pickUniqueByContent(
  contentType: ContentType,
  tier: DifficultyTier,
  count: number,
  seed: number,
  usedIds: Set<string>,
  usedContent: Set<string>,
): ContentItem[] {
  const candidates = getContentForExercise({
    contentType,
    locale: LOCALE,
    difficulty: tier,
    count: count * 3,
    excludeIds: Array.from(usedIds),
    seed,
  })

  const picked: ContentItem[] = []
  for (const item of candidates) {
    if (picked.length >= count) break
    // Sprint-2.5 FIX-03 — `getContentForExercise`'s own `excludeIds` only
    // *deprioritises* recently-shown ids (`avoidRecentRepeats` explicitly
    // never drops them, "to avoid empty results with small pools") — with
    // a real pool this small (e.g. 6 real paragraphs per tier), a caller
    // asking for more real items than the fresh pool holds can still see
    // an "excluded" id leak back in. `usedIds` is this function's own real
    // hard exclusion on top of that soft one — honestly under-filling
    // (returning fewer than `count`) rather than ever repeating a real id
    // the caller has already marked used.
    if (usedIds.has(item.id)) continue
    const key = item.content.toLowerCase()
    if (usedContent.has(key)) continue
    usedContent.add(key)
    usedIds.add(item.id)
    picked.push(item)
  }
  return picked
}
