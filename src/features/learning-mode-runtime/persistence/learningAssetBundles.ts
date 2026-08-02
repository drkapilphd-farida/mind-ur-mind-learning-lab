import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import type { LearningAssetBundle } from '@/core/universal-learning-engine/learning-assets'
import { logger } from '@/lib/logger'

// Reading Intelligence Engine™ Upgrade — Sprint-2: Learning Assets
// Generator™. Real, persistent backing for `learning_asset_bundles`
// (supabase/migrations/20260730000001_create_learning_asset_bundles.sql).
// Mirrors `chapterIntelligenceBlueprints.ts`'s own "cast through Json at
// a real serialization boundary, verify a minimal real shape on read"
// pattern exactly — a LearningAssetBundle is already fully JSON-safe.

export type LearningAssetBundleCacheEntry = {
  chapterOrder: number
  contentHash: string
  bundle: LearningAssetBundle
}

function isBundleShaped(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.learningObjects) && Array.isArray(candidate.keywordAssets)
}

// One row per (document, chapter position) loaded verbatim, keyed by
// `chapter_order` — a malformed row (should never happen — this table
// only ever stores what this codebase's own save path wrote) is skipped
// and logged rather than trusted, the same "verify, don't assume"
// discipline every sibling loader in this codebase already applies.
export async function loadLearningAssetBundles(supabase: SupabaseClient<Database>, documentId: string): Promise<ReadonlyMap<number, LearningAssetBundleCacheEntry>> {
  const { data, error } = await supabase.from('learning_asset_bundles').select('chapter_order, content_hash, data').eq('document_id', documentId)

  if (error) {
    logger.error('failed to load learning asset bundles', { error: error.message, documentId })
    return new Map()
  }

  const entries = new Map<number, LearningAssetBundleCacheEntry>()
  for (const row of data ?? []) {
    if (!isBundleShaped(row.data)) {
      logger.error('stored learning asset bundle row is not shaped like a real bundle', { documentId, chapterOrder: row.chapter_order })
      continue
    }
    entries.set(row.chapter_order, { chapterOrder: row.chapter_order, contentHash: row.content_hash, bundle: row.data as unknown as LearningAssetBundle })
  }

  return entries
}

// Real upsert — `onConflict` matches the table's own real
// UNIQUE(document_id, chapter_order) constraint, so regenerating the
// same chapter's assets (a genuine Blueprint content change) replaces
// the row in place rather than erroring or duplicating.
export async function saveLearningAssetBundle(supabase: SupabaseClient<Database>, documentId: string, entry: LearningAssetBundleCacheEntry): Promise<boolean> {
  const { error } = await supabase
    .from('learning_asset_bundles')
    .upsert({ document_id: documentId, chapter_order: entry.chapterOrder, content_hash: entry.contentHash, data: entry.bundle as unknown as Json }, { onConflict: 'document_id,chapter_order' })

  if (error) {
    logger.error('failed to save learning asset bundle', { error: error.message, documentId, chapterOrder: entry.chapterOrder })
    return false
  }

  return true
}
