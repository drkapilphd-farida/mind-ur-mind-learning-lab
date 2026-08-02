import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { universalUploadParser } from '@/core/universal-learning-engine/upload'
import { extractUniversalLearningDocument } from '@/core/universal-learning-engine/extraction'
import { generateQuantumDocumentIntelligence } from '@/features/quantum-document-transformer/generateQuantumDocumentIntelligence'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { FREE_TIER_DOCUMENT_LIMIT } from '@/features/quantum-document-transformer/freeTierLimit'
import { MAX_SYNCHRONOUS_UPLOAD_BYTES } from '@/features/quantum-document-transformer/maxSynchronousUploadSize'
import { formatFileSize } from '@/lib/formatFileSize'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import type { QuantumDocument } from '@/features/quantum-document-transformer/types'
import type { Json } from '@/lib/supabase/types'
import { logger } from '@/lib/logger'

// AI Document Transformer™ — a file-upload endpoint, per
// ENGINEERING_CONSTITUTION.md §5 ("Route Handlers... Use API route handlers
// only for:... File upload endpoints"). One synchronous request: extract
// text → one Claude call → persist → respond, so the client can move
// straight into a QSR/Memory session with the result already in hand — no
// polling, no background job.
//
// Real extractors exist for PDF/DOCX/TXT/Image (see
// src/core/universal-learning-engine/extraction) — 'doc' (legacy .doc) and
// every other source type still has no real extractor, so this stays an
// honest allow-list rather than "everything except a deny-list."
const EXTRACTABLE_SOURCE_TYPES = new Set(['pdf', 'docx', 'txt', 'image'])

// Sequential PDF-page extraction + one synchronous Claude call + a DB
// insert, all in this one request, had no explicit timeout budget — on
// the platform's default (far shorter for serverless functions), a real
// multi-page PDF could get killed mid-flight with a non-JSON response,
// which is exactly what surfaces client-side as the generic "Something
// went wrong" catch (see AIDocumentTransformerWidget.tsx). This gives the
// handler real room; generateQuantumDocumentIntelligence's own Anthropic
// client timeout is set comfortably under this so a slow model call fails
// with a clean JSON error from our own code before the platform kills the
// function outright.
export const maxDuration = 60

// Of the image formats the upload pipeline recognizes (jpeg/png/webp/heic/
// heif), only png/jpeg are what this feature was scoped to support — both
// because that's the literal requirement and because they're the two
// Anthropic vision natively accepts without any re-encoding step.
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg'])

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, '')
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: 'You must be signed in to use the AI Document Transformer.' }, { status: 401 })
  }

  // Pro Paywall — the real enforcement boundary. The dashboard's own
  // proactive UI check (same FREE_TIER_DOCUMENT_LIMIT, same
  // getQuantumDocumentCount) exists purely so a free user never wastes an
  // upload attempt on a request that would be rejected anyway — this
  // check here is what actually decides, since a client-side check alone
  // can always be bypassed.
  const isPro = await getIsPaidUser(user.id)
  if (!isPro) {
    const documentCount = await getQuantumDocumentCount(user.id)
    if (documentCount >= FREE_TIER_DOCUMENT_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          code: 'free_limit_reached',
          error: `You've reached your free limit of ${FREE_TIER_DOCUMENT_LIMIT} documents. Upgrade to Pro for unlimited AI document transformations, Spider Notes, and Quantum sessions.`,
        },
        { status: 402 },
      )
    }
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid upload — please try again.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: 'No file was uploaded.' }, { status: 400 })
  }

  // Defense in depth — the real enforcement point is the client's own
  // pre-flight check (AIDocumentTransformerWidget.tsx), since a request
  // body over the platform's serverless function limit never reaches this
  // handler at all. This exists for whatever does get through (a client
  // bypassing the UI, a future caller of this route).
  if (file.size > MAX_SYNCHRONOUS_UPLOAD_BYTES) {
    return NextResponse.json(
      { success: false, error: `This file is too large for instant processing. Please choose a file up to ${formatFileSize(MAX_SYNCHRONOUS_UPLOAD_BYTES)}.` },
      { status: 413 },
    )
  }

  // Multi-Language Support — an absent field defaults to English (the
  // selector's own default), but a present, unrecognized value is a real
  // rejection, not a silent fallback: never trust the client to have sent
  // one of the actually-supported codes.
  const targetLanguageField = formData.get('target_language')
  const targetLanguage = targetLanguageField === null ? DEFAULT_LANGUAGE : String(targetLanguageField)
  if (!isSupportedLanguage(targetLanguage)) {
    return NextResponse.json({ success: false, error: 'This language is not supported yet.' }, { status: 400 })
  }

  const validated = await universalUploadParser.parse(file)
  if (!validated.success) {
    return NextResponse.json({ success: false, error: validated.error.message }, { status: 400 })
  }

  if (!EXTRACTABLE_SOURCE_TYPES.has(validated.source.sourceType)) {
    return NextResponse.json({ success: false, error: 'This file type is not supported yet — please upload a PDF, Word document, text file, or image.' }, { status: 400 })
  }

  if (validated.source.sourceType === 'image' && !SUPPORTED_IMAGE_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: 'This image format is not supported yet — please upload a PNG or JPEG.' }, { status: 400 })
  }

  logger.info('[QuantumDocumentTransformer] Document Extracted — START', { userId: user.id, sourceType: validated.source.sourceType })
  const extraction = await extractUniversalLearningDocument(file, validated.source)
  if (!extraction.success) {
    logger.error('[QuantumDocumentTransformer] Document Extracted — FAIL', { userId: user.id, error: extraction.error.message })
    return NextResponse.json({ success: false, error: extraction.error.message }, { status: 422 })
  }
  logger.info('[QuantumDocumentTransformer] Document Extracted — SUCCESS', { userId: user.id, wordCount: extraction.document.wordCount })

  const documentTitle = extraction.document.title || stripExtension(file.name)

  logger.info('[QuantumDocumentTransformer] AI Intelligence Generated — START', { userId: user.id, targetLanguage })
  const intelligence = await generateQuantumDocumentIntelligence(documentTitle, extraction.document.content, targetLanguage)
  if (!intelligence.success) {
    logger.error('[QuantumDocumentTransformer] AI Intelligence Generated — FAIL', { userId: user.id, error: intelligence.error })
    return NextResponse.json({ success: false, error: intelligence.error }, { status: 502 })
  }
  logger.info('[QuantumDocumentTransformer] AI Intelligence Generated — SUCCESS', { userId: user.id, modelId: intelligence.modelId })

  const { payload } = intelligence

  // Multi-Language Support — English never asks the model to reproduce the
  // document (see generateQuantumDocumentIntelligence.ts), so the real
  // already-extracted text is the reading text; a non-English target uses
  // the model's own translation. The `?? extraction.document.content`
  // fallback is defensive only — buildQuantumDocumentPayloadSchema's
  // refine already guarantees reading_text is present whenever
  // targetLanguage isn't English.
  const readingText = targetLanguage === 'en' ? extraction.document.content : (payload.reading_text ?? extraction.document.content)

  logger.info('[QuantumDocumentTransformer] Quantum Document Saved — START', { userId: user.id })
  const { data: row, error: insertError } = await supabase
    .from('quantum_documents')
    .insert({
      user_id: user.id,
      title: documentTitle,
      raw_text: extraction.document.content,
      ai_summary: payload.ai_summary,
      // SpiderNote's `children` is `readonly SpiderNote[]` — a readonly
      // array isn't structurally assignable to `Json`'s mutable array
      // variant, even though the actual data is plain, serializable JSON.
      spider_notes: payload.spider_notes as unknown as Json,
      keywords: payload.keywords,
      quiz_questions: payload.quiz_questions,
      feynman_challenge: payload.feynman_challenge,
      mnemonics: payload.mnemonics,
      subject_lens: payload.subject_lens,
      target_language: targetLanguage,
      reading_text: readingText,
    })
    .select('id, title, raw_text, created_at, target_language')
    .single()

  if (insertError || !row) {
    logger.error('[QuantumDocumentTransformer] Quantum Document Saved — FAIL', { userId: user.id, error: insertError?.message })
    return NextResponse.json({ success: false, error: 'We generated your study material but could not save it. Please try again.' }, { status: 500 })
  }
  logger.info('[QuantumDocumentTransformer] Quantum Document Saved — SUCCESS', { userId: user.id, quantumDocumentId: row.id })

  // Built from `payload` (the just-validated AI output) rather than
  // re-reading it back off `row` — `quantum_documents.ai_summary`/
  // `spider_notes`/`keywords`/`quiz_questions` are nullable columns (the
  // table predates this endpoint and allows other write paths), but this
  // response is honestly never one of those null cases: it's the exact
  // payload this request just inserted.
  const document: QuantumDocument = {
    id: row.id,
    title: row.title,
    rawText: row.raw_text,
    readingText,
    targetLanguage,
    aiSummary: payload.ai_summary,
    spiderNotes: payload.spider_notes,
    keywords: payload.keywords,
    quizQuestions: payload.quiz_questions,
    feynmanChallenge: payload.feynman_challenge,
    mnemonics: payload.mnemonics,
    subjectLens: payload.subject_lens,
    createdAt: row.created_at,
  }

  return NextResponse.json({ success: true, document }, { status: 200 })
}
