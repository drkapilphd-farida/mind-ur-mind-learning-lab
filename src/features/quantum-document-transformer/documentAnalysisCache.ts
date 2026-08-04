// Server-only. Never import this from client components.
//
// AI Cost Optimization™ — Global Document Deduplication. The single
// biggest lever of the three cost changes in this pass: a cache hit
// means the Claude call for this upload never happens at all — 100% of
// that call's cost avoided, not just reduced. See
// supabase/migrations/20260804000001_create_quantum_document_analysis_cache.sql
// for the table this reads/writes (service-role only, no RLS policies —
// same access pattern ai_cost_log already uses).
import { createHash } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/logger'
import type { Json } from '@/lib/supabase/types'
import { McqQuizQuestionSchema, SpiderNoteSchema, FeynmanChallengeSchema, MnemonicSchema, SubjectLensSchema, type QuantumDocumentPayload } from './types'
import type { SupportedLanguage } from './supportedLanguages'
import { z } from 'zod'

// Hashes the EXACT text the model would see (the caller passes the
// already-truncated prompt text, not the full raw upload) — two
// documents that truncate to the same first-N-characters genuinely would
// get identical analysis from Claude, so hashing post-truncation is
// correct, not just convenient.
export function computeDocumentContentHash(promptText: string): string {
  return createHash('sha256').update(promptText, 'utf8').digest('hex')
}

// The cached row is untrusted-until-checked in exactly the same way a
// fresh tool-use response is (see getQuantumDocumentById.ts's own
// comment on this) — re-validated through the same Zod schemas rather
// than trusted just because it came from our own table. A row that
// somehow fails validation (e.g. written by a since-changed schema
// version) is treated as a cache miss, never surfaced as a crash.
const CachedAnalysisRowSchema = z.object({
  ai_summary: z.string(),
  spider_notes: SpiderNoteSchema,
  keywords: z.array(z.string()),
  quiz_questions: z.array(McqQuizQuestionSchema),
  feynman_challenge: FeynmanChallengeSchema,
  mnemonics: z.array(MnemonicSchema),
  subject_lens: SubjectLensSchema,
  reading_text: z.string().nullable(),
})

export type CachedAnalysis = { payload: QuantumDocumentPayload; modelId: string }

export async function getCachedAnalysis(contentHash: string, targetLanguage: SupportedLanguage): Promise<CachedAnalysis | null> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('quantum_document_analysis_cache')
      .select('ai_summary, spider_notes, keywords, quiz_questions, feynman_challenge, mnemonics, subject_lens, reading_text, model_id, hit_count')
      .eq('content_hash', contentHash)
      .eq('target_language', targetLanguage)
      .maybeSingle()

    if (error || !data) return null

    const parsed = CachedAnalysisRowSchema.safeParse(data)
    if (!parsed.success) {
      logger.warn('quantum document analysis cache: stored row failed re-validation, treating as miss', { contentHash, targetLanguage })
      return null
    }

    // Fire-and-forget hit-count bump — purely a usage/observability
    // signal (how much this cache is actually saving), never something
    // the read path waits on or fails over.
    void supabase
      .from('quantum_document_analysis_cache')
      .update({ hit_count: data.hit_count + 1, last_hit_at: new Date().toISOString() })
      .eq('content_hash', contentHash)
      .eq('target_language', targetLanguage)
      .then(({ error: updateError }) => {
        if (updateError) logger.warn('quantum document analysis cache: hit-count update failed', { error: updateError.message })
      })

    const payload: QuantumDocumentPayload = {
      ai_summary: parsed.data.ai_summary,
      spider_notes: parsed.data.spider_notes,
      keywords: parsed.data.keywords,
      quiz_questions: parsed.data.quiz_questions,
      feynman_challenge: parsed.data.feynman_challenge,
      mnemonics: parsed.data.mnemonics,
      subject_lens: parsed.data.subject_lens,
      ...(parsed.data.reading_text !== null ? { reading_text: parsed.data.reading_text } : {}),
    }

    return { payload, modelId: data.model_id }
  } catch (error) {
    logger.warn('quantum document analysis cache: read failed, treating as miss', { error: error instanceof Error ? error.message : 'Unknown error.' })
    return null
  }
}

// Best-effort write — a failed cache write must never fail the real
// request that already succeeded against Claude. The learner already
// has their real, freshly-generated result; this is purely so the NEXT
// person who uploads the same content doesn't pay for it again.
export async function saveCachedAnalysis(
  contentHash: string,
  targetLanguage: SupportedLanguage,
  payload: QuantumDocumentPayload,
  modelId: string,
): Promise<void> {
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('quantum_document_analysis_cache').upsert(
      {
        content_hash: contentHash,
        target_language: targetLanguage,
        model_id: modelId,
        ai_summary: payload.ai_summary,
        spider_notes: payload.spider_notes as unknown as Json,
        keywords: payload.keywords,
        quiz_questions: payload.quiz_questions as unknown as Json,
        feynman_challenge: payload.feynman_challenge as unknown as Json,
        mnemonics: payload.mnemonics as unknown as Json,
        subject_lens: payload.subject_lens as unknown as Json,
        reading_text: payload.reading_text ?? null,
      },
      { onConflict: 'content_hash,target_language' },
    )
    if (error) logger.warn('quantum document analysis cache: write failed', { error: error.message })
  } catch (error) {
    logger.warn('quantum document analysis cache: write failed', { error: error instanceof Error ? error.message : 'Unknown error.' })
  }
}
