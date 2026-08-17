'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
import { logSchoolAiUsage } from '@/features/school-dashboard/logSchoolAiUsage'
import type { Json } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'
import { getQuantumDocumentCount } from '../getQuantumDocumentCount'
import { FREE_TIER_DOCUMENT_LIMIT } from '../freeTierLimit'
import { checkTransformRateLimit } from '../transformRateLimiter'
import { generateQuantumDocumentIntelligence } from '../generateQuantumDocumentIntelligence'
import { DEFAULT_LANGUAGE, isSupportedLanguage, type SupportedLanguage } from '../supportedLanguages'
import { extractYouTubeVideoId, extractYouTubeTranscript } from '../urlImport/extractYouTubeTranscript'
import { extractWebsiteContent } from '../urlImport/extractWebsiteContent'

const ImportUrlInputSchema = z.object({
  url: z.string().trim().min(1).max(2000),
  targetLanguage: z.string().optional(),
})

export type ImportQuantumDocumentFromUrlResult =
  | { success: true; documentId: string }
  | { success: false; error: string; code?: 'free_limit_reached' }

// Paste URL / YouTube™ — the URL-input sibling of the file-upload Route
// Handler (/api/quantum-documents/transform): same auth/rate-limit/
// paywall gates, same generateQuantumDocumentIntelligence call, same
// quantum_documents insert shape, so a URL-imported document behaves
// identically to an uploaded one everywhere downstream (Spider Notes,
// Quiz, Feynman Challenge, Quantum Session). Only the extraction step
// differs: a YouTube link's transcript, or a web article's Readability-
// extracted text, instead of a parsed file.
export async function importQuantumDocumentFromUrl(input: unknown): Promise<ImportQuantumDocumentFromUrlResult> {
  const parsed = ImportUrlInputSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Please paste a valid link.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'You must be signed in to use the AI Document Transformer.' }
  }

  const rateLimitDecision = checkTransformRateLimit(user.id)
  if (!rateLimitDecision.allowed) {
    return { success: false, error: "You're transforming links faster than we can process them — please wait a moment and try again." }
  }

  // Pro Paywall — the real enforcement boundary, mirroring the file-
  // upload Route Handler's identical check.
  const isPro = await getIsPaidUser(user.id)
  if (!isPro) {
    const documentCount = await getQuantumDocumentCount(user.id)
    if (documentCount >= FREE_TIER_DOCUMENT_LIMIT) {
      return {
        success: false,
        code: 'free_limit_reached',
        error: `You've reached your free limit of ${FREE_TIER_DOCUMENT_LIMIT} documents. Upgrade to Pro for unlimited AI document transformations, Spider Notes, and Quantum sessions.`,
      }
    }
  }

  const targetLanguage: SupportedLanguage =
    parsed.data.targetLanguage !== undefined && isSupportedLanguage(parsed.data.targetLanguage) ? parsed.data.targetLanguage : DEFAULT_LANGUAGE

  const isYouTube = extractYouTubeVideoId(parsed.data.url) !== null

  logger.info('[UrlImport] Extraction — START', { userId: user.id, isYouTube })
  const extraction = isYouTube ? await extractYouTubeTranscript(parsed.data.url) : await extractWebsiteContent(parsed.data.url)
  if (!extraction.success) {
    logger.warn('[UrlImport] Extraction — FAIL', { userId: user.id, isYouTube, error: extraction.error })
    return { success: false, error: extraction.error }
  }
  logger.info('[UrlImport] Extraction — SUCCESS', { userId: user.id, isYouTube, contentLength: extraction.content.length })

  logger.info('[UrlImport] AI Intelligence Generated — START', { userId: user.id, targetLanguage })
  const intelligence = await generateQuantumDocumentIntelligence(extraction.title, extraction.content, targetLanguage)
  if (!intelligence.success) {
    logger.error('[UrlImport] AI Intelligence Generated — FAIL', { userId: user.id, error: intelligence.error })
    return { success: false, error: intelligence.error }
  }
  logger.info('[UrlImport] AI Intelligence Generated — SUCCESS', { userId: user.id, modelId: intelligence.modelId })

  const { payload } = intelligence
  // Multi-Language Support — identical rule to the file-upload path:
  // English never asks the model to reproduce the source, a non-English
  // target uses the model's own translation.
  const readingText = targetLanguage === 'en' ? extraction.content : (payload.reading_text ?? extraction.content)

  logger.info('[UrlImport] Quantum Document Saved — START', { userId: user.id })
  const { data: row, error: insertError } = await supabase
    .from('quantum_documents')
    .insert({
      user_id: user.id,
      title: extraction.title,
      raw_text: extraction.content,
      ai_summary: payload.ai_summary,
      one_sentence_summary: payload.one_sentence_summary,
      // See the Route Handler's identical cast for why: SpiderNote's
      // `children` is a readonly array, not structurally assignable to
      // Json's mutable-array variant, even though the data itself is
      // plain, serializable JSON.
      spider_notes: payload.spider_notes as unknown as Json,
      keywords: payload.keywords.map((keyword) => keyword.word),
      keyword_icons: Object.fromEntries(payload.keywords.map((keyword) => [keyword.word, keyword.icon])) as unknown as Json,
      quiz_questions: payload.quiz_questions,
      feynman_challenge: payload.feynman_challenge,
      mnemonics: payload.mnemonics,
      subject_lens: payload.subject_lens,
      short_story: payload.short_story,
      recall_questions: payload.recall_questions,
      target_language: targetLanguage,
      reading_text: readingText,
    })
    .select('id')
    .single()

  if (insertError || !row) {
    logger.error('[UrlImport] Quantum Document Saved — FAIL', { userId: user.id, error: insertError?.message })
    return { success: false, error: 'We generated your study material but could not save it. Please try again.' }
  }
  logger.info('[UrlImport] Quantum Document Saved — SUCCESS', { userId: user.id, quantumDocumentId: row.id })

  // Master Admin Analytics Dashboard — best-effort per-school AI-usage
  // attribution, same as the file-upload path. Logging only; never
  // blocks or fails this already-successful result.
  await logSchoolAiUsage(user.id, row.id)

  return { success: true, documentId: row.id }
}
