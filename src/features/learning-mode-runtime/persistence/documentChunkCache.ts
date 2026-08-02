import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'
import type { LearningChunk } from '@/core/universal-learning-engine/learning-chunk'
import { logger } from '@/lib/logger'

// Production AI Cost Optimization — Task 2/3. Real, persistent per-chunk
// cache backing `document_chunk_cache`
// (supabase/migrations/20260724000001_create_document_chunk_cache.sql).
// Mirrors `uloRecord.ts`'s own "cast through Json at a real serialization
// boundary, verify a minimal real shape on read" pattern — a LearningChunk
// is already fully JSON-safe (no class instances, no Date/Map/Set), so no
// hand-rolled (de)serialization format is needed here either.

export type DocumentChunkCacheEntry = {
  chunkOrder: number
  contentHash: string
  chunk: LearningChunk
}

function isLearningChunkShaped(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.status === 'string' && typeof candidate.content === 'string' && typeof candidate.enrichment === 'object'
}

// Real: one row per (document, chunk position) is loaded verbatim, keyed
// by `chunk_order` so the caller can match it against a freshly-rebuilt
// chunk at the same position with zero further querying. A malformed row
// (should never happen — this table only ever stores what this codebase's
// own save path wrote) is skipped and logged rather than trusted, the same
// "verify, don't assume" discipline `fromUniversalLearningObjectRecord`
// already applies to the ULO table.
export async function loadDocumentChunkCache(supabase: SupabaseClient<Database>, documentId: string): Promise<ReadonlyMap<number, DocumentChunkCacheEntry>> {
  const { data, error } = await supabase.from('document_chunk_cache').select('chunk_order, content_hash, data').eq('document_id', documentId)

  if (error) {
    logger.error('failed to load document chunk cache', { error: error.message, documentId })
    return new Map()
  }

  const entries = new Map<number, DocumentChunkCacheEntry>()
  for (const row of data ?? []) {
    if (!isLearningChunkShaped(row.data)) {
      logger.error('stored document chunk cache row is not shaped like a real LearningChunk', { documentId, chunkOrder: row.chunk_order })
      continue
    }
    entries.set(row.chunk_order, { chunkOrder: row.chunk_order, contentHash: row.content_hash, chunk: row.data as unknown as LearningChunk })
  }

  return entries
}

// Real upsert of every cacheable entry from this run in one round trip —
// `onConflict` matches the table's own real UNIQUE(document_id, chunk_order)
// constraint, so a cache hit re-saved this run harmlessly replaces the
// identical row rather than erroring. A failure here is observability, not
// correctness: it means the next run repeats real Claude calls this run
// already paid for, never that this run's own saved ULO is wrong — logged,
// not thrown, consistent with AIFoundation's own "cost tracking never
// fails the real result" precedent.
export async function saveDocumentChunkCacheEntries(supabase: SupabaseClient<Database>, documentId: string, entries: readonly DocumentChunkCacheEntry[]): Promise<boolean> {
  if (entries.length === 0) return true

  const rows = entries.map((entry) => ({
    document_id: documentId,
    chunk_order: entry.chunkOrder,
    content_hash: entry.contentHash,
    data: entry.chunk as unknown as Json,
  }))

  const { error } = await supabase.from('document_chunk_cache').upsert(rows, { onConflict: 'document_id,chunk_order' })

  if (error) {
    logger.error('failed to save document chunk cache entries', { error: error.message, documentId })
    return false
  }

  return true
}
