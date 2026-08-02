import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import type { ChapterIntelligenceBlueprint } from '@/core/universal-learning-engine/learning-blueprint'
import { logger } from '@/lib/logger'

// Reading Intelligence Engine™ Upgrade — Sprint-1: Learning Blueprint
// Generator™. Real, persistent backing for `chapter_intelligence_blueprints`
// (supabase/migrations/20260729000001_create_chapter_intelligence_blueprints.sql).
// Mirrors `documentChunkCache.ts`'s own "cast through Json at a real
// serialization boundary, verify a minimal real shape on read" pattern —
// a ChapterIntelligenceBlueprint is already fully JSON-safe (no class
// instances, no Date/Map/Set), so no hand-rolled (de)serialization
// format is needed here either.

export type ChapterIntelligenceBlueprintCacheEntry = {
  chapterOrder: number
  contentHash: string
  blueprint: ChapterIntelligenceBlueprint
}

function isBlueprintShaped(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.header === 'object' && candidate.header !== null && typeof candidate.learningObjects === 'object' && candidate.learningObjects !== null
}

// Real: one row per (document, chapter position) is loaded verbatim,
// keyed by `chapter_order` so the caller can match it against a
// freshly-rebuilt chunk at the same position with zero further
// querying. A malformed row (should never happen — this table only ever
// stores what this codebase's own save path wrote) is skipped and
// logged rather than trusted, the same "verify, don't assume"
// discipline `document_chunk_cache`'s own loader already applies.
export async function loadChapterIntelligenceBlueprints(supabase: SupabaseClient<Database>, documentId: string): Promise<ReadonlyMap<number, ChapterIntelligenceBlueprintCacheEntry>> {
  const { data, error } = await supabase.from('chapter_intelligence_blueprints').select('chapter_order, content_hash, data').eq('document_id', documentId)

  if (error) {
    logger.error('failed to load chapter intelligence blueprints', { error: error.message, documentId })
    return new Map()
  }

  const entries = new Map<number, ChapterIntelligenceBlueprintCacheEntry>()
  for (const row of data ?? []) {
    if (!isBlueprintShaped(row.data)) {
      logger.error('stored chapter intelligence blueprint row is not shaped like a real Blueprint', { documentId, chapterOrder: row.chapter_order })
      continue
    }
    entries.set(row.chapter_order, { chapterOrder: row.chapter_order, contentHash: row.content_hash, blueprint: row.data as unknown as ChapterIntelligenceBlueprint })
  }

  return entries
}

// Real upsert — `onConflict` matches the table's own real
// UNIQUE(document_id, chapter_order) constraint, so regenerating the
// same chapter's Blueprint (a genuine content change) replaces the row
// in place rather than erroring or duplicating.
export async function saveChapterIntelligenceBlueprint(supabase: SupabaseClient<Database>, documentId: string, entry: ChapterIntelligenceBlueprintCacheEntry): Promise<boolean> {
  const { error } = await supabase
    .from('chapter_intelligence_blueprints')
    .upsert({ document_id: documentId, chapter_order: entry.chapterOrder, content_hash: entry.contentHash, data: entry.blueprint as unknown as Json }, { onConflict: 'document_id,chapter_order' })

  if (error) {
    logger.error('failed to save chapter intelligence blueprint', { error: error.message, documentId, chapterOrder: entry.chapterOrder })
    return false
  }

  return true
}
