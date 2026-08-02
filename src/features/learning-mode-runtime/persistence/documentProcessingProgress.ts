import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// ALS-15 Instant Learning Engine™. Real, persistent backing for
// `document_processing_progress`
// (supabase/migrations/20260728000002_create_document_processing_progress.sql)
// — the durable state Phase 3 "Background AI Intelligence" advances
// across many separate, client-paced poll invocations. Mirrors
// `documentChunkCache.ts`'s own "system/service-role-only, no
// hand-rolled serialization" shape.

// Reading Intelligence Engine™ Upgrade — Sprint-1 adds
// 'generating_blueprints', inserted between 'building_learning_analysis'
// and 'complete' (see supabase/migrations/20260729000002_add_generating_blueprints_stage.sql).
// Sprint-2 adds 'generating_learning_assets', inserted between
// 'generating_blueprints' and 'complete' (see
// supabase/migrations/20260730000002_add_generating_learning_assets_stage.sql).
export type DocumentProcessingProgressStage =
  | 'enriching_chunks'
  | 'building_knowledge_graph'
  | 'building_learning_analysis'
  | 'generating_blueprints'
  | 'generating_learning_assets'
  | 'complete'
  | 'failed'

export type DocumentProcessingProgress = {
  documentId: string
  stage: DocumentProcessingProgressStage
  totalChunks: number
  chunksEnriched: number
  knowledgeGraphDone: boolean
  learningAnalysisDone: boolean
  // "Chapter" this sprint means the same real chunk granularity as
  // totalChunks/chunksEnriched — kept as its own real counter (rather
  // than reusing totalChunks directly) so a future sprint that gives
  // "chapter" a genuinely distinct granularity doesn't have to touch
  // this shape again.
  totalChapters: number
  blueprintsGenerated: number
  // Sprint-2 — reuses `totalChapters` as its own target count (one
  // Learning Asset Bundle per chapter, the same granularity Sprint-1
  // already established).
  learningAssetsGenerated: number
  errorMessage: string | null
}

type ProgressRow = {
  document_id: string
  stage: string
  total_chunks: number
  chunks_enriched: number
  knowledge_graph_done: boolean
  learning_analysis_done: boolean
  total_chapters: number
  blueprints_generated: number
  learning_assets_generated: number
  error_message: string | null
}

function toProgress(row: ProgressRow): DocumentProcessingProgress {
  return {
    documentId: row.document_id,
    stage: row.stage as DocumentProcessingProgressStage,
    totalChunks: row.total_chunks,
    chunksEnriched: row.chunks_enriched,
    knowledgeGraphDone: row.knowledge_graph_done,
    learningAnalysisDone: row.learning_analysis_done,
    totalChapters: row.total_chapters,
    blueprintsGenerated: row.blueprints_generated,
    learningAssetsGenerated: row.learning_assets_generated,
    errorMessage: row.error_message,
  }
}

// Called once, at the very end of Phase 1 "Quick Intelligence" — creates
// the one real progress row Phase 3 advances from there on.
// `ignoreDuplicates` makes a re-triggered Phase 1 run (e.g. a retried
// Quick Intelligence call) harmless rather than erroring on the real
// UNIQUE(document_id) constraint. `totalChapters` is set equal to
// `totalChunks` — this sprint scopes one chapter per chunk exactly.
export async function initializeDocumentProcessingProgress(supabase: SupabaseClient<Database>, documentId: string, totalChunks: number): Promise<void> {
  const { error } = await supabase
    .from('document_processing_progress')
    .upsert({ document_id: documentId, total_chunks: totalChunks, total_chapters: totalChunks }, { onConflict: 'document_id', ignoreDuplicates: true })

  if (error) {
    logger.error('failed to initialize document processing progress', { error: error.message, documentId })
  }
}

export async function loadDocumentProcessingProgress(supabase: SupabaseClient<Database>, documentId: string): Promise<DocumentProcessingProgress | null> {
  const { data, error } = await supabase
    .from('document_processing_progress')
    .select('document_id, stage, total_chunks, chunks_enriched, knowledge_graph_done, learning_analysis_done, total_chapters, blueprints_generated, learning_assets_generated, error_message')
    .eq('document_id', documentId)
    .maybeSingle()

  if (error) {
    logger.error('failed to load document processing progress', { error: error.message, documentId })
    return null
  }
  if (!data) return null

  return toProgress(data)
}

// The short-lived advisory lock — prevents two concurrent poll calls
// (two open tabs) from double-enriching the same chunk batch or
// double-billing Claude. Returns `true` only if this call genuinely
// claimed the lock (a row was actually updated); `false` means another
// call already holds a fresh lock, and the caller should make no
// progress this tick.
export async function claimDocumentProcessingProgressLock(supabase: SupabaseClient<Database>, documentId: string, staleAfterMs: number): Promise<boolean> {
  const cutoffIso = new Date(Date.now() - staleAfterMs).toISOString()
  const { data, error } = await supabase
    .from('document_processing_progress')
    .update({ locked_at: new Date().toISOString() })
    .eq('document_id', documentId)
    .or(`locked_at.is.null,locked_at.lt.${cutoffIso}`)
    .select('document_id')

  if (error) {
    logger.error('failed to claim document processing progress lock', { error: error.message, documentId })
    return false
  }

  return (data ?? []).length > 0
}

export type DocumentProcessingProgressPatch = {
  stage?: DocumentProcessingProgressStage
  chunksEnriched?: number
  knowledgeGraphDone?: boolean
  learningAnalysisDone?: boolean
  blueprintsGenerated?: number
  learningAssetsGenerated?: number
  errorMessage?: string | null
}

// Applies a real state transition and releases the lock in the same
// write — every real caller advances the pipeline and immediately lets
// the next poll try again, so there is no scenario where the lock should
// outlive one successful update.
export async function advanceDocumentProcessingProgress(supabase: SupabaseClient<Database>, documentId: string, patch: DocumentProcessingProgressPatch): Promise<boolean> {
  const update: Database['public']['Tables']['document_processing_progress']['Update'] = { locked_at: null }
  if (patch.stage !== undefined) update.stage = patch.stage
  if (patch.chunksEnriched !== undefined) update.chunks_enriched = patch.chunksEnriched
  if (patch.knowledgeGraphDone !== undefined) update.knowledge_graph_done = patch.knowledgeGraphDone
  if (patch.learningAnalysisDone !== undefined) update.learning_analysis_done = patch.learningAnalysisDone
  if (patch.blueprintsGenerated !== undefined) update.blueprints_generated = patch.blueprintsGenerated
  if (patch.learningAssetsGenerated !== undefined) update.learning_assets_generated = patch.learningAssetsGenerated
  if (patch.errorMessage !== undefined) update.error_message = patch.errorMessage

  const { error } = await supabase.from('document_processing_progress').update(update).eq('document_id', documentId)

  if (error) {
    logger.error('failed to advance document processing progress', { error: error.message, documentId })
    return false
  }

  return true
}
